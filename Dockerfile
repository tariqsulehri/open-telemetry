# Dockerfile (Final Version)
# Use the current Node.js LTS version on Alpine for a small image size
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker's build cache. 
# This means npm install only re-runs if package.json changes.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle the rest of the app source code
COPY . .

# EXPOSE: Informational port. Use the port your app is listening on (3500)
EXPOSE 3500

# CMD: Execute the application. 
# We use the --require flag to load the OpenTelemetry instrumentation 
# file *before* the main application file (app.js) executes.
CMD ["node", "app.js"]