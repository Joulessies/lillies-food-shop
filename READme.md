# Lillies Food Shop - Production Setup with Ngrok

This README explains how to set up the Lillies Food Shop application to use a real database in production via ngrok.

## Overview

Instead of using mock data in production, we're now using ngrok to expose our local Django backend to the internet. This allows:

1. The deployed frontend on AWS Amplify to connect to a real database
2. User data to persist between sessions
3. Real-time data synchronization

## Setup Instructions

### 1. Start the Django Backend Locally

```bash
cd django_backend
python manage.py runserver
```

### 2. Start Ngrok to Create a Tunnel

```bash
npx ngrok http 8000 --log=stdout
```

This will create a secure tunnel to your local Django server. You'll see a URL like `https://xxxx-xxx-xxx-xx.ngrok-free.app` - this is your public backend URL.

### 3. Update Configuration Files

When you see the ngrok URL, update these files:

- `vite.config.js` - Update the `ngrokUrl` variable
- `amplify.yml` - Update the environment variables

### 4. Deploy the Frontend

When deploying to AWS Amplify, make sure the ngrok tunnel remains active so the frontend can access the backend.

## Important Notes

1. **Tunnel Expiration**: Free ngrok URLs expire when you stop the tunnel. For a permanent solution, consider:

   - Upgrading to a paid ngrok plan for persistent URLs
   - Deploying your backend to a proper cloud service (AWS, Heroku, etc.)

2. **Database Persistence**: The data is stored in your local SQLite database while using ngrok.

3. **Production Readiness**: This setup is good for testing but not ideal for real production. For a true production environment:
   - Deploy the Django backend to a cloud service
   - Set up a proper database like PostgreSQL
   - Configure proper security measures

## Current Configuration

Current ngrok URL: `https://cec0-158-62-34-241.ngrok-free.app`

## Connecting React Frontend to Django Backend

### Development Setup

1. **Start the Django backend server:**

   ```
   cd django_backend
   python manage.py runserver 8000
   ```

   The backend will be available at http://localhost:8000

2. **Start the React frontend development server:**

   ```
   npm run dev
   ```

   The frontend will be available at http://localhost:5173

3. **Alternative: Use the provided start script:**

   ```
   ./start-dev.bat
   ```

   This will start both the backend and frontend servers in separate command prompts.

4. **Test the API connection:**
   Navigate to http://localhost:5173/api-test in your browser to verify the connection between the frontend and backend.

### Configuration

The connection between the frontend and backend is configured in:

- `src/services/apiService.js` - Controls API URLs and authentication
- `django_backend/lillies_backend/settings.py` - Controls CORS settings and allowed origins
- `django_backend/lillies_backend/middleware.py` - Contains custom CORS middleware

### API Endpoints

The main API endpoints available in the Django backend:

- Authentication: `/api/auth/`
- Admin operations: `/api/admin/`
- Menu operations: `/api/menu/`
- Products: `/api/products/`
- Categories: `/api/categories/`
- Orders: `/api/orders/`
- Health check: `/api/health/`

## Production Deployment

For production deployment, follow these steps to configure the React frontend to connect to the Django backend:

1. **Set environment variables in your frontend build system:**

   ```
   VITE_API_BASE_URL=https://your-production-backend-url.com
   VITE_API_URL=https://your-production-backend-url.com
   ```

2. **Build the React frontend:**

   ```
   npm run build
   ```

3. **Deploy the Django backend with the correct CORS settings:**

   - In `django_backend/lillies_backend/settings.py`, update the `CORS_ALLOWED_ORIGINS` to include your frontend domain.
   - Ensure the custom CORS middleware in `django_backend/lillies_backend/middleware.py` includes your frontend domain.

4. **Ensure proper SSL configuration:**

   - Both frontend and backend should use HTTPS in production.
   - Update `API_URL` and `API_BASE_URL` in `src/services/apiService.js` to use the HTTPS protocol.

5. **Configure your server:**
   - Set up proper NGINX or Apache configuration to route requests correctly.
   - Ensure all static files are served properly.

### Environment-Specific Configuration

The frontend application uses environment variables for API configuration:

| Variable          | Purpose                        | Example                 |
| ----------------- | ------------------------------ | ----------------------- |
| VITE_API_BASE_URL | Base URL for API endpoints     | https://api.example.com |
| VITE_API_URL      | Base URL for the Django server | https://api.example.com |

### Local Environment Variables

To configure the API URLs for local development, create a `.env.local` file in the project root with the following content:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
```

This will ensure that your React app communicates with the local Django development server.
