# Production Deployment Instructions

Since your React application builds into static files (HTML/CSS/JS), the environment variables starting with `REACT_APP_` are **embedded into the application at build time**.

This means you do **not** need to list them in `docker-compose.yml`, provided that a `.env` file is present in the directory when the image is built.

## 1. Prepare Environment File

Ensure you have a `.env` file on your production machine in the same directory as `docker-compose.yml`. It should contain all your secrets and configuration:

```env
# Frontend Build Variables (Required during build)
NODE_ENV=production
REACT_APP_FIREBASE_API_KEY=AIzaSyDAFPIyoRyNKh7r2G5RvGyhTtdw0vq5yDo
REACT_APP_FIREBASE_PROJECT_ID=webgrove-1719942620266
REACT_APP_FIREBASE_AUTH_DOMAIN=webgrove-1719942620266.firebaseapp.com
REACT_APP_ALERTS_URL=https://services.swpc.noaa.gov/products/alerts.json
REACT_APP_FIREBASE_APP_ID=1:233112374215:web:8bc93a35b2ab523580e7e2
REACT_APP_NASA_API_KEY=EPzph5xAodjbAfetUoN9aXol9ada4muRH1p8Kg4m
REACT_APP_AURORA_FORECAST_SOUTHERN_URL=https://services.swpc.noaa.gov/images/aurora-forecast-southern-hemisphere.jpg
REACT_APP_SDO_BASE_URL=https://sdo.gsfc.nasa.gov/assets/img/latest
REACT_APP_KP_INDEX_URL=https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
REACT_APP_FIREBASE_STORAGE_BUCKET=webgrove-1719942620266.firebasestorage.app
REACT_APP_AURORA_FORECAST_NORTHERN_URL=https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.jpg
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=233112374215
REACT_APP_KP_FORECAST_URL=https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json
REACT_APP_DISABLE_REGISTRATION=true
REACT_APP_APOD_URL=https://api.nasa.gov/planetary/apod

# Backend Runtime Variables
SMTP_HOST=your_smtp_host
SMTP_PORT=465
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...} (Use single line JSON string)
```

## 2. Docker Compose Configuration

Create or update your `docker-compose.yml` with the following content. This includes both the frontend `sdo-dash` service (exposed via Traefik) and the `backend` service (background worker).

```yaml
version: "3.8"

services:
  sdo-dash:
    container_name: sdo-dash
    build:
      context: .
      # No args needed if .env is present during build
    restart: unless-stopped

    # Runtime env for Nginx container (if needed)
    environment:
      - NODE_ENV=production

    networks:
      - traefik_default

    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.sdo-dash-http.rule=Host(`sdodash.webgrove.pl`)"
      - "traefik.http.routers.sdo-dash-http.entrypoints=web"
      - "traefik.http.services.sdo-dash.loadbalancer.server.port=80"

  backend:
    container_name: solar-dashboard-backend
    build: ./backend
    restart: unless-stopped
    # Backend needs these at runtime to send emails and access Firebase
    environment:
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - FIREBASE_SERVICE_ACCOUNT=${FIREBASE_SERVICE_ACCOUNT}
    # It doesn't need to be on traefik network unless it needs to talk to other containers directly.
    # It just needs internet access to reach Firebase and NOAA APIs.

networks:
  traefik_default:
    external: true
```

## 3. Build and Deploy

Run the following command on your production machine. This will:

1. Build both images using your production `.env` file.
2. Recreate the containers.

```bash
docker compose up -d --build
```
