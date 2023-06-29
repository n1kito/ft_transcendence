#
# BUILD FOR LOCAL DEVELOPMENT
#

FROM node:latest As development

# Create app directory

WORKDIR /usr/src/app

# Copy the package files into the container like we did for nestJs
# COPY --chown=node:node package*.json ./
COPY package*.json ./

# Install app dependencies using clean install
RUN npm ci

# Copy the rest of the app source
COPY . .
# COPY --chown=node:node . .

# Set user to node instead of root
# USER node

# Build the app
RUN npm run build

# this is jst the development part, for production implement other stages
## EXAMPLE

# Stage 2 - the production environment
# FROM nginx:1.17.9-alpine
# COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]