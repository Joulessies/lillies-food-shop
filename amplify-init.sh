#!/bin/bash

# Script to properly initialize Amplify configuration during build process
# Exit on error
set -e

# Enable error logging
exec 2> >(tee -a "amplify-init.log" >&2)

echo "Starting Amplify initialization..."

# Ensure directories exist
mkdir -p ./amplify/backend
mkdir -p ./amplify/.config
mkdir -p ./amplify/backend/api/lilliesapi
mkdir -p ./amplify/backend/function/lilliesBackend/src

# Create project config
echo "Creating project config..."
cat > ./amplify/.config/project-config.json << 'EOL'
{
  "projectName": "lilliesfoodshop",
  "version": "3.1",
  "frontend": "javascript",
  "javascript": {
    "framework": "react",
    "config": {
      "SourceDir": "src",
      "DistributionDir": "dist",
      "BuildCommand": "npm run build",
      "StartCommand": "npm run dev"
    }
  },
  "providers": [
    "awscloudformation"
  ]
}
EOL

# Create basic amplify-meta.json
echo "Creating amplify-meta.json..."
cat > ./amplify/backend/amplify-meta.json << 'EOL'
{
  "providers": {
    "awscloudformation": {
      "AuthRoleName": "amplify-lilliesfoodshop-dev-123456-authRole",
      "UnauthRoleArn": "arn:aws:iam::123456789012:role/amplify-lilliesfoodshop-dev-123456-unauthRole",
      "AuthRoleArn": "arn:aws:iam::123456789012:role/amplify-lilliesfoodshop-dev-123456-authRole",
      "Region": "ap-northeast-1",
      "DeploymentBucketName": "amplify-lilliesfoodshop-dev-123456-deployment",
      "UnauthRoleName": "amplify-lilliesfoodshop-dev-123456-unauthRole",
      "StackName": "amplify-lilliesfoodshop-dev-123456",
      "StackId": "arn:aws:cloudformation:ap-northeast-1:123456789012:stack/amplify-lilliesfoodshop-dev-123456/abcdef",
      "AmplifyAppId": "abcdefghij"
    }
  },
  "api": {
    "lilliesapi": {
      "dependsOn": [
        {
          "category": "function",
          "resourceName": "lilliesBackend",
          "attributes": ["Name", "Arn"]
        }
      ],
      "providerPlugin": "awscloudformation",
      "service": "API Gateway"
    }
  },
  "function": {
    "lilliesBackend": {
      "build": true,
      "providerPlugin": "awscloudformation",
      "service": "Lambda"
    }
  },
  "hosting": {
    "amplifyhosting": {
      "providerPlugin": "awscloudformation",
      "service": "amplifyhosting",
      "type": "manual"
    }
  }
}
EOL

# Create API Gateway params
echo "Creating API Gateway params..."
cat > ./amplify/backend/api/lilliesapi/api-params.json << 'EOL'
{
  "paths": [
    {
      "name": "/api/{proxy+}",
      "lambdaFunction": "lilliesBackend",
      "privacy": {
        "open": true
      }
    }
  ],
  "resourceName": "lilliesapi",
  "apiName": "lilliesapi",
  "functionArns": [
    {
      "lambdaFunction": "lilliesBackend"
    }
  ],
  "privacy": {
    "auth": 0,
    "unauth": 0,
    "authRoleName": "amplify-lilliesfoodshop-dev-123456-authRole",
    "unAuthRoleName": "amplify-lilliesfoodshop-dev-123456-unauthRole"
  },
  "dependsOn": [
    {
      "category": "function",
      "resourceName": "lilliesBackend",
      "attributes": [
        "Name",
        "Arn"
      ]
    }
  ]
}
EOL

# Create function params
echo "Creating function params..."
cat > ./amplify/backend/function/lilliesBackend/function-parameters.json << 'EOL'
{
  "lambdaLayers": [],
  "permissions": {
    "storage": {},
    "function": {},
    "auth": {}
  }
}
EOL

# Create API CloudFormation template
echo "Creating CloudFormation template..."
cat > ./amplify/backend/api/lilliesapi/lilliesapi-cloudformation-template.json << 'EOL'
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "API Gateway resource stack creation using Amplify CLI",
  "Parameters": {
    "env": {
      "Type": "String"
    },
    "functionlilliesBackendName": {
      "Type": "String",
      "Default": "functionlilliesBackendName"
    },
    "functionlilliesBackendArn": {
      "Type": "String",
      "Default": "functionlilliesBackendArn"
    }
  },
  "Resources": {
    "lilliesapi": {
      "Type": "AWS::ApiGateway::RestApi",
      "Properties": {
        "Description": "API Gateway for Lillies Food Shop",
        "Name": {
          "Fn::Join": [
            "",
            [
              "lilliesapi-",
              {
                "Ref": "env"
              }
            ]
          ]
        },
        "EndpointConfiguration": {
          "Types": ["EDGE"]
        },
        "Policy": ""
      }
    },
    "ApiResource": {
      "Type": "AWS::ApiGateway::Resource",
      "Properties": {
        "ParentId": {
          "Fn::GetAtt": ["lilliesapi", "RootResourceId"]
        },
        "PathPart": "api",
        "RestApiId": {
          "Ref": "lilliesapi"
        }
      }
    },
    "ApiResourceProxy": {
      "Type": "AWS::ApiGateway::Resource",
      "Properties": {
        "ParentId": {
          "Ref": "ApiResource"
        },
        "PathPart": "{proxy+}",
        "RestApiId": {
          "Ref": "lilliesapi"
        }
      }
    },
    "ProxyResourceANY": {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType": "NONE",
        "HttpMethod": "ANY",
        "Integration": {
          "IntegrationHttpMethod": "POST",
          "Type": "AWS_PROXY",
          "Uri": {
            "Fn::Join": [
              "",
              [
                "arn:aws:apigateway:",
                {
                  "Ref": "AWS::Region"
                },
                ":lambda:path/2015-03-31/functions/",
                {
                  "Ref": "functionlilliesBackendArn"
                },
                "/invocations"
              ]
            ]
          }
        },
        "MethodResponses": [
          {
            "StatusCode": "200",
            "ResponseParameters": {
              "method.response.header.Access-Control-Allow-Origin": true,
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true
            }
          }
        ],
        "RequestParameters": {
          "method.request.path.proxy": true
        },
        "ResourceId": {
          "Ref": "ApiResourceProxy"
        },
        "RestApiId": {
          "Ref": "lilliesapi"
        }
      }
    },
    "DeploymentAPIGW": {
      "Type": "AWS::ApiGateway::Deployment",
      "Properties": {
        "Description": "API deployment",
        "RestApiId": {
          "Ref": "lilliesapi"
        }
      },
      "DependsOn": [
        "ProxyResourceANY"
      ]
    },
    "Stage": {
      "Type": "AWS::ApiGateway::Stage",
      "Properties": {
        "DeploymentId": {
          "Ref": "DeploymentAPIGW"
        },
        "RestApiId": {
          "Ref": "lilliesapi"
        },
        "StageName": {
          "Ref": "env"
        }
      }
    },
    "ApiGatewayMethodOptions": {
      "Type": "AWS::ApiGateway::Method",
      "Properties": {
        "AuthorizationType": "NONE",
        "HttpMethod": "OPTIONS",
        "Integration": {
          "IntegrationResponses": [
            {
              "ResponseParameters": {
                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                "method.response.header.Access-Control-Allow-Methods": "'GET,POST,PUT,DELETE,OPTIONS'",
                "method.response.header.Access-Control-Allow-Origin": "'*'"
              },
              "StatusCode": "200"
            }
          ],
          "RequestTemplates": {
            "application/json": "{\"statusCode\": 200}"
          },
          "Type": "MOCK"
        },
        "MethodResponses": [
          {
            "ResponseParameters": {
              "method.response.header.Access-Control-Allow-Headers": true,
              "method.response.header.Access-Control-Allow-Methods": true,
              "method.response.header.Access-Control-Allow-Origin": true
            },
            "StatusCode": "200"
          }
        ],
        "ResourceId": {
          "Ref": "ApiResourceProxy"
        },
        "RestApiId": {
          "Ref": "lilliesapi"
        }
      }
    }
  },
  "Outputs": {
    "ApiName": {
      "Description": "API Gateway endpoint name",
      "Value": {
        "Ref": "lilliesapi"
      }
    },
    "ApiURL": {
      "Description": "API Gateway endpoint URL",
      "Value": {
        "Fn::Join": [
          "",
          [
            "https://",
            {
              "Ref": "lilliesapi"
            },
            ".execute-api.",
            {
              "Ref": "AWS::Region"
            },
            ".amazonaws.com/",
            {
              "Ref": "env"
            },
            "/api"
          ]
        ]
      }
    }
  }
}
EOL

# Create function CloudFormation template
echo "Creating function CloudFormation template..."
cat > ./amplify/backend/function/lilliesBackend/lilliesBackend-cloudformation-template.json << 'EOL'
{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Lambda Function resource stack creation using Amplify CLI",
  "Parameters": {
    "env": {
      "Type": "String"
    }
  },
  "Resources": {
    "LambdaFunction": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
          "S3Bucket": {
            "Fn::Sub": "amplify-${env}-${env}-${RandomString}"
          },
          "S3Key": "amplify-builds/lilliesBackend-LambdaLayerVersionXXXXXX-build.zip"
        },
        "Handler": "lambda_handler.lambda_handler",
        "FunctionName": {
          "Fn::If": [
            "ShouldNotCreateEnvResources",
            "lilliesBackend",
            {
              "Fn::Join": [
                "",
                [
                  "lilliesBackend-",
                  {
                    "Ref": "env"
                  }
                ]
              ]
            }
          ]
        },
        "Environment": {
          "Variables": {
            "ENV": {
              "Ref": "env"
            }
          }
        },
        "Role": {
          "Fn::GetAtt": [
            "LambdaExecutionRole",
            "Arn"
          ]
        },
        "Runtime": "python3.11",
        "Layers": [],
        "Timeout": 25
      }
    },
    "LambdaExecutionRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "RoleName": {
          "Fn::If": [
            "ShouldNotCreateEnvResources",
            "lilliesfoodshopLambdaRole",
            {
              "Fn::Join": [
                "",
                [
                  "lilliesfoodshopLambdaRole",
                  "-",
                  {
                    "Ref": "env"
                  }
                ]
              ]
            }
          ]
        },
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "Service": [
                  "lambda.amazonaws.com"
                ]
              },
              "Action": [
                "sts:AssumeRole"
              ]
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ]
      }
    }
  },
  "Outputs": {
    "Name": {
      "Value": {
        "Ref": "LambdaFunction"
      }
    },
    "Arn": {
      "Value": {
        "Fn::GetAtt": [
          "LambdaFunction",
          "Arn"
        ]
      }
    },
    "Region": {
      "Value": {
        "Ref": "AWS::Region"
      }
    },
    "LambdaExecutionRole": {
      "Value": {
        "Ref": "LambdaExecutionRole"
      }
    },
    "LambdaExecutionRoleArn": {
      "Value": {
        "Fn::GetAtt": [
          "LambdaExecutionRole",
          "Arn"
        ]
      }
    }
  },
  "Conditions": {
    "ShouldNotCreateEnvResources": {
      "Fn::Equals": [
        {
          "Ref": "env"
        },
        "NONE"
      ]
    }
  }
}
EOL

# Create backend config
echo "Creating backend config..."
cat > ./amplify/backend/backend-config.json << 'EOL'
{
  "api": {
    "lilliesapi": {
      "dependsOn": [
        {
          "attributes": ["Name", "Arn"],
          "category": "function",
          "resourceName": "lilliesBackend"
        }
      ],
      "providerPlugin": "awscloudformation",
      "service": "API Gateway"
    }
  },
  "function": {
    "lilliesBackend": {
      "build": true,
      "providerPlugin": "awscloudformation",
      "service": "Lambda"
    }
  },
  "hosting": {
    "amplifyhosting": {
      "providerPlugin": "awscloudformation",
      "service": "amplifyhosting",
      "type": "manual"
    }
  }
}
EOL

# Create amplify JSON file
echo "Creating amplify.json..."
cat > ./amplify/backend/amplify.json << 'EOL'
{
  "features": {
    "graphqltransformer": {
      "addmissingownerfields": true,
      "improvepluralization": false,
      "validatetypenamereservedwords": true,
      "useexperimentalpipelinedtransformer": true,
      "enableiterativegsiupdates": true,
      "secondarykeyasgsi": true,
      "skipoverridemutationinputtypes": true,
      "transformerversion": 2,
      "suppressschemamigrationprompt": true,
      "securityenhancementnotification": false,
      "showfieldauthnotification": false,
      "usesubusernamefordefaultidentityclaim": true,
      "usefieldnameforprimarykeyconnectionfield": false,
      "enableautoindexquerynames": true,
      "respectprimarykeyattributesonconnectionfield": true,
      "shoulddeepmergeschema": false,
      "populateownerfieldforstaticgroupauth": true
    },
    "frontend-ios": {
      "enablexcodeintegration": true
    },
    "auth": {
      "enablecaseinsensitivity": true,
      "useinclusiveterminology": true,
      "breakcirculardependency": true,
      "forcealiasattributes": false,
      "useenabledmfas": true
    },
    "codegen": {
      "useappsyncmodelgenplugin": true,
      "usedocsgeneratorplugin": true,
      "usetypesgeneratorplugin": true,
      "cleangeneratedmodelsdirectory": true,
      "retaincasestyle": true,
      "addtimestampfields": true,
      "handlelistnullabilitytransparently": true,
      "emitauthprovider": true,
      "generateindexrules": true,
      "enabledartnullsafety": true,
      "generatemodelsforlazyloadandcustomselectionset": false
    },
    "appsync": {
      "generategraphqlpermissions": true
    },
    "latestregionsupport": {
      "pinpoint": 1,
      "translate": 1,
      "transcribe": 1,
      "rekognition": 1,
      "textract": 1,
      "comprehend": 1
    },
    "project": {
      "overrides": true
    }
  }
}
EOL

# Ensure files are readable
chmod 644 ./amplify/backend/amplify-meta.json
chmod 644 ./amplify/.config/project-config.json
chmod 644 ./amplify/backend/api/lilliesapi/api-params.json
chmod 644 ./amplify/backend/function/lilliesBackend/function-parameters.json
chmod 644 ./amplify/backend/api/lilliesapi/lilliesapi-cloudformation-template.json
chmod 644 ./amplify/backend/function/lilliesBackend/lilliesBackend-cloudformation-template.json
chmod 644 ./amplify/backend/backend-config.json
chmod 644 ./amplify/backend/amplify.json

echo "Amplify initialization completed successfully!" 