@echo off
echo Adding changes to amplify-meta.json...
git add amplify/backend/amplify-meta.json

echo Committing changes...
git commit -m "Fix amplify-meta.json to include lilliesBackend function"

echo Pushing changes to repository...
git push origin main

echo Changes pushed successfully. 