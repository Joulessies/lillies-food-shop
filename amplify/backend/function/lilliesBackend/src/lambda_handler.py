"""
AWS Lambda handler for Django application
This file serves as the entry point for Lambda to execute the Django application
"""

import os
import sys
import json
import logging
from urllib.parse import urlencode
import io

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add the current directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lillies_backend.settings')

# Ensure proper settings for AWS Lambda
os.environ['AWS_LAMBDA_FUNCTION_NAME'] = os.environ.get('AWS_LAMBDA_FUNCTION_NAME', 'local')
os.environ['DEBUG'] = os.environ.get('DEBUG', 'False')

# Import Django after environment setup
import django
django.setup()

# Get the WSGI application
from lillies_backend.wsgi import application

def lambda_handler(event, context):
    """AWS Lambda function handler for Django application"""
    
    logger.info("Event received: %s", json.dumps(event))
    
    # Convert API Gateway event to WSGI request
    return apigateway_to_wsgi(application, event, context)

def apigateway_to_wsgi(application, event, context):
    """Convert API Gateway event to WSGI request and process with Django application"""
    
    # Extract request information from event
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    query_string = event.get('queryStringParameters', {}) or {}
    headers = event.get('headers', {}) or {}
    body = event.get('body', '')
    
    if event.get('isBase64Encoded', False):
        import base64
        body = base64.b64decode(body)
    
    # Convert body to bytes if it's a string
    if isinstance(body, str):
        body = body.encode('utf-8')
    
    # Create an input stream from the body
    body_file = io.BytesIO(body)
    
    # Construct the environment dictionary for WSGI
    environ = {
        'REQUEST_METHOD': method,
        'PATH_INFO': path,
        'QUERY_STRING': urlencode(query_string) if query_string else '',
        'CONTENT_LENGTH': str(len(body) if body else 0),
        'CONTENT_TYPE': headers.get('Content-Type', headers.get('content-type', 'application/json')),
        'SERVER_NAME': 'lambda',
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': body_file,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
        'API_GATEWAY_CONTEXT': context,
        'event': event,
    }
    
    # Add HTTP headers
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            environ[f'HTTP_{key}'] = value
    
    # Add special headers for API Gateway
    environ['HTTP_X_FORWARDED_PROTO'] = 'https'
    environ['HTTP_X_FORWARDED_HOST'] = headers.get('Host', headers.get('host', 'execute-api.amazonaws.com'))
    
    # Response data
    response_data = {
        'statusCode': 500,
        'headers': {},
        'body': '',
        'isBase64Encoded': False,
    }
    
    # Process request with Django application
    def start_response(status, headers):
        status_code = int(status.split(' ')[0])
        response_data['statusCode'] = status_code
        response_data['headers'] = dict(headers)
    
    # Process the request
    try:
        response = application(environ, start_response)
        
        # Collect response body
        response_body = b''
        for data in response:
            if data:
                response_body += data
        
        if response_body:
            # Check if response should be base64 encoded
            content_type = response_data['headers'].get('Content-Type', '')
            if should_base64_encode(content_type):
                import base64
                response_data['body'] = base64.b64encode(response_body).decode('utf-8')
                response_data['isBase64Encoded'] = True
            else:
                response_data['body'] = response_body.decode('utf-8')
        
        # Ensure CORS headers are present
        response_data['headers']['Access-Control-Allow-Origin'] = '*'
        response_data['headers']['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        response_data['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        
    except Exception as e:
        logger.exception("Error processing request: %s", str(e))
        response_data['statusCode'] = 500
        response_data['body'] = json.dumps({'error': str(e)})
        # Add CORS headers even on error
        response_data['headers']['Access-Control-Allow-Origin'] = '*'
        response_data['headers']['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        response_data['headers']['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    
    return response_data

def should_base64_encode(content_type):
    """Determine if content should be base64 encoded based on content type"""
    binary_types = [
        'image/',
        'audio/',
        'video/',
        'application/octet-stream',
        'application/pdf',
        'application/zip',
        'font/',
        'application/x-font',
    ]
    
    return any(content_type.startswith(t) for t in binary_types) 