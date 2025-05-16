# Lillies Food Shop Backend Deployment Guide

This guide walks you through deploying the Lillies Food Shop Django backend to AWS Lambda using Amplify.

## Prerequisites

- AWS CLI installed and configured with your AWS account
- Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Node.js and npm installed
- PowerShell (for Windows users)

## Deployment Steps

### 1. Prepare Your Environment

Ensure you have the AWS CLI configured with your credentials:

```bash
aws configure
```

### 2. Run the Preparation Script

This script will prepare your Django backend for deployment to AWS Lambda:

```bash
powershell -ExecutionPolicy Bypass -File ./prepare-backend.ps1
```

### 3. Initialize Amplify (if not already done)

If you haven't already initialized Amplify in your project:

```bash
amplify init
```

Follow the prompts to configure your project.

### 4. Deploy the Backend

Run the deployment script to deploy your backend to AWS Lambda:

```bash
powershell -ExecutionPolicy Bypass -File ./deploy-lambda.ps1
```

### 5. Connecting Frontend to Backend

After deployment, you'll need to update your frontend configuration to use the new API endpoint.

1. Get your API endpoint URL from the Amplify Console or by running:

```bash
amplify status
```

2. Update your frontend configuration in `src/config.js` with the API endpoint URL.

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Check your Django CORS settings in `lillies_backend/settings.py`
2. Make sure you're using the correct API endpoint URL in your frontend

### Database Issues

The deployment uses SQLite by default. For production, consider:

1. Setting up a managed database like RDS
2. Updating your settings.py to use the managed database

### API Gateway Issues

If your API endpoints aren't working:

1. Check the CloudWatch logs for your Lambda function
2. Verify your route configurations in `lillies_backend/urls.py`

## Maintenance

### Making Updates

To update your deployed backend:

1. Make your changes to the Django code
2. Run the prepare-backend.ps1 script
3. Deploy the changes using:

```bash
amplify push
```

### Monitoring

Monitor your application using:

1. CloudWatch for Lambda function logs
2. Amplify Console for overall deployment status

## Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Django on AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
