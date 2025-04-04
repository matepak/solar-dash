# Build stage
FROM node:16-alpine as build

# Add build arguments
ARG NODE_ENV=production
ARG REACT_APP_DISABLE_REGISTRATION=false

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV REACT_APP_DISABLE_REGISTRATION=${REACT_APP_DISABLE_REGISTRATION}

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
