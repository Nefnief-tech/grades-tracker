# Deployment Guide

This project is configured to use prebuilt static files for deployment, which improves deployment speed and reliability.

## Quick Start

1. **Build the project locally:**
   ```bash
   npm run build
   ```

2. **Deploy the `out` directory** to your hosting platform.

## Platform-Specific Instructions

### Vercel
- The `vercel.json` is configured to use prebuilt files
- Upload the `out` directory contents
- Vercel will serve the static files directly

### Netlify
- The `netlify.toml` is configured to skip builds
- Upload the `out` directory as your site folder
- Set publish directory to `out` in Netlify dashboard

### GitHub Pages
- Use the GitHub Actions workflow in `.github/workflows/deploy.yml`
- Build locally and commit the `out` directory
- Push to trigger deployment

### Custom Server
- Use `deploy.sh` (Linux/Mac) or `deploy.bat` (Windows)
- Modify the script for your specific deployment method
- Upload contents of `out` directory to your web server

## Important Notes

- Always build locally before deploying: `npm run build`
- The `out` directory contains all static files needed
- No server-side rendering or API routes are used
- Configure your hosting platform to serve `index.html` for all routes (SPA routing)

## Troubleshooting

If CSS/JS files aren't loading:
1. Ensure the `out` directory is being served as the root
2. Check that your hosting platform serves static files with correct MIME types
3. Verify that all files in `out` directory are uploaded correctly