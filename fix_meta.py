import subprocess
import os

def run_git_command(command):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    print(f"Output: {result.stdout}")
    if result.stderr:
        print(f"Error: {result.stderr}")
    return result.returncode == 0

def main():
    print("Starting git operations for amplify-meta.json fix")
    
    # Add the file
    if not run_git_command("git add amplify/backend/amplify-meta.json"):
        print("Failed to add file")
        return
    
    # Commit the changes
    if not run_git_command('git commit -m "Fix amplify-meta.json to include lilliesBackend function"'):
        print("Failed to commit changes")
        return
    
    # Push to GitHub
    if not run_git_command("git push origin main"):
        print("Failed to push changes")
        return
    
    print("Successfully updated and pushed amplify-meta.json")

if __name__ == "__main__":
    main() 