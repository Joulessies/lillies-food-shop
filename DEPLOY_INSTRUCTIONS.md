# Lillies Food Shop - Deployment Instructions

This document provides instructions for deploying the Lillies Food Shop application on AWS Amplify.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured with your credentials
- AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Git repository with your code

## Deployment Steps

### 1. Initialize Amplify

```bash
# Navigate to your project directory
cd lillies-food-shop

# Initialize Amplify
amplify init
```

Follow the prompts to create a new Amplify project or use an existing one.

### 2. Add Authentication

```bash
amplify add auth
```

Choose the default configuration or customize as needed.

### 3. Add API (Lambda + API Gateway)

```bash
amplify add api
```

- Select "REST" for the API type
- Choose "Lambda function" as the runtime
- Create a new Lambda function (lilliesBackend)
- Select Python as the runtime
- When asked about additional configurations, enable CORS

### 4. Add Function

If not already created during the API setup:

```bash
amplify add function
```

- Name the function "lilliesBackend"
- Choose Python as the runtime

### 5. Deploy Backend

```bash
amplify push
```

This will deploy all backend resources.

### 6. Connect Frontend to Backend

Get the API endpoint URL:

```bash
amplify status
```

Look for the API endpoint URL in the output. Update your amplify.yml file with this information.

### 7. Deploy to Amplify Hosting Console

1. Go to AWS Amplify Console
2. Choose "Host web app"
3. Connect to your GitHub repository
4. Configure build settings using the amplify.yml file
5. Deploy the application

## Troubleshooting

### Database Issues

If using SQLite in Lambda, remember that the filesystem is ephemeral. The database in `/tmp` is not persistent between invocations. For a production application, consider using:

- Amazon RDS for a fully managed database
- DynamoDB for serverless database
- S3 for storing and retrieving the SQLite file between invocations

### CORS Issues

If experiencing CORS issues:

1. Verify all necessary CORS headers are being returned
2. Check that your API Gateway settings have CORS enabled
3. Ensure your Django settings allow the Amplify app domain

### Deployment Failures

If the build fails:

1. Check Amplify build logs for specific errors
2. Ensure all required environment variables are set
3. Verify the amplify.yml file is properly configured

For persistent issues, you may need to run:

```bash
amplify delete
```

And then reinitialize your Amplify app.

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Django on AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
