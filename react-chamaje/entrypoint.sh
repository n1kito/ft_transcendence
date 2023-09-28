#!/bin/sh

# Make sure we are using the last version of npm 
npm install -g npm

# # # Make sure we use all last versions of our dependencies
# npm update --save

# npm audit fix --force

npm install
npm run build
npm start