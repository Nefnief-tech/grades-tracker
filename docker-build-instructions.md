# Docker Build and Deployment Instructions

## Building the Docker Image

To build the Docker image:

```bash
docker build -t grades-app:latest .
```

## Running with Docker

To run the container directly:

```bash
docker run -p 3000:3000 -e NODE_ENV=production --name grades-app grades-app:latest
```

## Running with Docker Compose

To run using Docker Compose:

```bash
docker-compose up -d
```

This will start the application in detached mode.

## Publishing to Docker Hub

### Prerequisites

- A [Docker Hub](https://hub.docker.com/) account
- Docker CLI logged in to your Docker Hub account

### Login to Docker Hub

```bash
docker login
```

### Tag Your Image

```bash
# Replace "your-username" with your Docker Hub username
docker tag grades-app:latest your-username/grades-app:latest
docker tag grades-app:latest your-username/grades-app:1.0.0
```

### Push to Docker Hub

```bash
docker push your-username/grades-app:latest
docker push your-username/grades-app:1.0.0
```

### Automated Publishing

You can also use the provided script:

#### For Windows:

```
# First edit the docker-hub-publish.bat to set your username
docker-hub-publish.bat
```

#### For Linux/Mac:

```bash
# First edit the docker-hub-publish.sh to set your username
chmod +x docker-hub-publish.sh
./docker-hub-publish.sh
```

### Verify Publication

Open your browser and navigate to:

```
https://hub.docker.com/r/your-username/grades-app
```

## Viewing Logs

```bash
docker logs -f grades-app
```

## Stopping the Container

If running directly:

```bash
docker stop grades-app
```

If using Docker Compose:

```bash
docker-compose down
```

## Deploying to a Server

1. Build the image locally:

   ```bash
   docker build -t grades-app:latest .
   ```

2. Tag the image for your registry:

   ```bash
   docker tag grades-app:latest your-registry.com/your-username/grades-app:latest
   ```

3. Push the image to your registry:

   ```bash
   docker push your-registry.com/your-username/grades-app:latest
   ```

4. On your server, pull and run the image:
   ```bash
   docker pull your-registry.com/your-username/grades-app:latest
   docker run -d -p 3000:3000 --name grades-app your-registry.com/your-username/grades-app:latest
   ```

Or use Docker Compose by copying the docker-compose.yml file to your server and running:

```bash
docker-compose pull
docker-compose up -d
```

## Using Your Docker Hub Image

Once published, you can deploy your app anywhere using:

```bash
docker run -d -p 3000:3000 your-username/grades-app:latest
```
