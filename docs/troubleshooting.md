# Troubleshooting Guide

> Common issues and solutions for new users

## First Time Setup

### "Command not found: npx"

```bash
# Install Node.js and npm first
# Windows: Download from https://nodejs.org
# Mac: brew install node
# Linux: sudo apt install nodejs npm
```

### "Failed to run init command"

1. Make sure you're in your repository's root directory
2. Verify you have write permissions
3. Try running with sudo if needed: `sudo npx near-protocol-rewards init`

### "track command not working"

- The `track` command is ONLY for GitHub Actions
- You should only run `init` on your local machine
- GitHub Actions will run `track` automatically

## GitHub Actions

### "Actions not running?"

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Look for "NEAR Protocol Rewards Tracking"
4. Check if workflow is enabled

### "Workflow permission errors?"

1. Go to repository Settings
2. Click Actions → General
3. Scroll to "Workflow permissions"
4. Enable "Read and write permissions"
5. Save changes

### "GITHUB_TOKEN errors?"

- You don't need to set up any tokens
- GitHub Actions provides this automatically
- Just make sure workflow permissions are correct

## Dashboard Connection

### "Repository not showing up?"

1. Wait for first push to main after setup
2. Verify GitHub Actions completed successfully
3. Check you're logged in with correct GitHub account

### "No metrics showing?"

1. Actions must run at least once
2. Push something to main branch
3. Wait for workflow to complete
4. Refresh dashboard

### "Metrics not updating?"

- Updates happen:
  - Every push to main
  - Every 12 hours automatically
- Check Actions tab for any errors

## Common Error Messages

### "Invalid configuration"

- Only required fields are:
  - Repository must be initialized with git
  - Must be connected to GitHub remote
  - Must have main branch

### "Failed to collect metrics"

1. Check GitHub Actions logs
2. Verify repository permissions
3. Make sure repository is not empty

### "Repository not found"

1. Verify repository exists on GitHub
2. Check you have correct access
3. Repository must be public or have proper permissions

## Getting More Help

1. **Check Logs**
   - GitHub Actions tab shows workflow runs
   - Each run has detailed logs
   - Look for red X marks for errors

2. **Common Places to Check**
   - `.github/workflows/near-rewards.yml` exists
   - Repository is properly connected to GitHub
   - GitHub Actions is enabled

3. **Still Stuck?**
   - [Open an Issue](https://github.com/jbarnes850/near-protocol-rewards/issues)
   - Include:
     - Error messages
     - Actions log snippets
     - Steps to reproduce
