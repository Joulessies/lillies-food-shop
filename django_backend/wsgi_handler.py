import os
from waitress import serve
from lillies_backend.wsgi import application
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Get port from environment variable or use default
port = int(os.environ.get('PORT', '8000'))
logger.info(f"Starting Waitress server on port {port}")

# Serve the application
serve(application, host='0.0.0.0', port=port) 