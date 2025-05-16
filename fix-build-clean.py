import subprocess

print("Starting git operations for build fix changes")

# Add the files
subprocess.run("git add amplify.yml amplify-init.sh", shell=True)
print("Files added")

# Commit the changes
subprocess.run("git commit -m \"Add Amplify build initialization script to fix meta.json issues\"", shell=True)
print("Changes committed")

# Push to GitHub
subprocess.run("git push origin main", shell=True)
print("Changes pushed to GitHub") 