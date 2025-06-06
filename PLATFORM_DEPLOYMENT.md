# Platform Deployment Instructions

## Before Deploying

**IMPORTANT:** Always build locally first:
```bash
npm run build
```

This creates the `out` directory with prebuilt static files.

## Docker Deployment

### Local Docker
```bash
# Build the Docker image
docker build -t grade-tracker .

# Run the container
docker run -p 80:80 grade-tracker
```

### Docker with Railway-specific image
```bash
docker build -f Dockerfile.railway -t grade-tracker-railway .
docker run -p 3000:3000 grade-tracker-railway
```

## Railway Deployment

1. **Build locally:** `npm run build`
2. **Commit the `out` directory** to your repository
3. **Deploy to Railway** - it will use `Dockerfile.railway` automatically
4. Railway will serve your prebuilt static files

### Railway CLI
```bash
railway login
railway link
railway up
```

## Nixpacks Deployment

1. **Build locally:** `npm run build`
2. **Ensure `out` directory exists** and contains your built files
3. **Deploy with Nixpacks** - it will use the `nixpacks.toml` configuration

```bash
nixpacks build . --name grade-tracker
```

## Key Benefits

- ✅ **Faster deployments** - No build time on the platform
- ✅ **Consistent builds** - Same environment every time  
- ✅ **Smaller images** - Only static files, no build dependencies
- ✅ **Better reliability** - No build failures during deployment

## Troubleshooting

- Make sure the `out` directory exists and has content before deploying
- If CSS/JS isn't loading, check that your platform serves static files correctly
- For SPA routing issues, ensure your platform redirects all routes to `index.html`