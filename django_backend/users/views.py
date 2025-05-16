from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer
import traceback
import json

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Log received data (removing sensitive info for security)
            sanitized_data = {k: v for k, v in request.data.items() if k != 'password'}
            print(f"Registration attempt with data: {sanitized_data}")
            
            serializer = self.get_serializer(data=request.data)
            
            # Validate data and check for specific errors
            if not serializer.is_valid():
                print(f"Registration validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            # Create user without saving yet to test for potential issues
            user = serializer.save()
            print(f"User created with ID: {user.id}, Email: {user.email}")
            
            try:
                # Generate tokens for the user
                refresh = RefreshToken.for_user(user)
                token_data = {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
                print("JWT tokens generated successfully")
            except Exception as token_error:
                print(f"Token generation error: {str(token_error)}")
                # Continue with registration even if token generation fails
                token_data = {"message": "Token generation failed, but user was created"}
            
            return Response({
                "user": UserSerializer(user).data,
                **token_data,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Registration exception: {str(e)}")
            print(f"Full traceback: {traceback.format_exc()}")
            return Response(
                {"detail": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Adding print statement for debugging
        users = User.objects.all()
        print(f"UserListView: Found {users.count()} users")
        for user in users:
            print(f"User ID: {user.id}, Email: {user.email}, Is Staff: {user.is_staff}, Is Superuser: {user.is_superuser}")
        return users

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)
    
    def perform_update(self, serializer):
        serializer.save()