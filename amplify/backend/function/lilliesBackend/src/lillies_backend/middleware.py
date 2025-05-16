from django.http import HttpResponse

class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.allowed_origins = [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://main.d1tks6esoyf2em.amplifyapp.com",
            "https://d1tks6esoyf2em.amplifyapp.com",
            "https://lillies-prod-env.eba-mmphcea.ap-northeast-1.elasticbeanstalk.com",
            "https://88fc-158-62-34-241.ngrok-free.app"
        ]

    def __call__(self, request):
        # Allow all requests while developing
        # Comment this block out when in production
        if True:  # Allow all origins for testing
            origin = request.headers.get('Origin', '')
            
            # Handle preflight OPTIONS requests
            if request.method == "OPTIONS":
                response = HttpResponse()
                response["Access-Control-Allow-Origin"] = origin
                response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
                response["Access-Control-Allow-Credentials"] = "true"
                response["Access-Control-Max-Age"] = "3600"
                return response
            
            # Process the request first
            response = self.get_response(request)
            
            # Add CORS headers
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Vary"] = "Origin"
            return response
            
        # Original conditional code - not used in development
        origin = request.headers.get('Origin')
        is_ngrok = origin and ('.ngrok-free.app' in origin or '.ngrok.io' in origin)
        is_allowed = origin in self.allowed_origins or is_ngrok

        # Handle preflight OPTIONS requests
        if request.method == "OPTIONS":
            response = HttpResponse()
            if is_allowed:
                response["Access-Control-Allow-Origin"] = origin
                response["Access-Control-Allow-Credentials"] = "true"
                response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
                response["Access-Control-Max-Age"] = "3600"  # Cache preflight for 1 hour
            return response
        
        # Process the regular request
        response = self.get_response(request)
        
        # Add CORS headers to the response
        if is_allowed:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Vary"] = "Origin"  # Important for caching with multiple origins
            
        return response class APIGatewayMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle specific API Gateway headers
        if 'HTTP_X_FORWARDED_FOR' in request.META:
            request.META['REMOTE_ADDR'] = request.META['HTTP_X_FORWARDED_FOR'].split(',')[0].strip()

        if 'HTTP_X_FORWARDED_PROTO' in request.META:
            request.scheme = request.META['HTTP_X_FORWARDED_PROTO']

        response = self.get_response(request)
        return response
