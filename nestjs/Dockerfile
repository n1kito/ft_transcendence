#
# BUILD FOR LOCAL DEVELOPMENT
#

FROM node:alpine As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image
# This copies both package.json and package-lock.json (if available)
# Copying this now prevents re-running `npm install` on every code change
# The --chown flag is used to set the ownership of the files to user and groupe `node` inside the container.
COPY --chown=node:node ./package*.json ./

# Instal app dependencies using the `npm ci` (clean install) command instead of `npm install`
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

# Generate Prisma database client code
RUN npx prisma generate

# User the node user for the image (instead of root)
USER node

# this is just the development part, the rest of the stages (build for prod and prod) is documented here: https://www.tomray.dev/nestjs-docker-compose-postgres
