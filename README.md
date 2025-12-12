Commands:

const OTLP_ENDPOINT = 'http://otel-collector:4318/v1/';
export SERVICE_NAME=shop-service && node service-a.js

docker compose up -d --remove-orphans

docker image prune -a
docker image volume -a



Docker Compose with Backend
---------------------------------
docker-compose up --build -d

docker-compose up --build -d
up: Starts all services defined in the YAML file.

--build: Forces Docker Compose to re-read and build the Dockerfile for any services (like node-backend) that have changed.

-d: Runs the containers in detached mode (in the background).

Rebuild Backend-container:
-------------------------
docker-compose up --build -d node-backend
 docker-compose logs node-backend   

 docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"