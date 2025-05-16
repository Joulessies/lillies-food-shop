import git
import os

try:
    print("Starting git operations for amplify-meta.json fix")
    
    # Get the repo
    repo = git.Repo('.')
    
    # Add the file
    print("Adding amplify-meta.json")
    repo.git.add('amplify/backend/amplify-meta.json')
    
    # Commit the changes
    print("Committing changes")
    repo.git.commit('-m', 'Fix amplify-meta.json to include lilliesBackend function')
    
    # Push to origin
    print("Pushing to origin/main")
    repo.git.push('origin', 'main')
    
    print("Successfully updated and pushed amplify-meta.json")
except Exception as e:
    print(f"Error: {e}") 