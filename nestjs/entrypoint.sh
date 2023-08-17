#!/bin/sh

npm ci

# Setting up the database with prisma
# if [ ! -d "/app/prisma/migrations" ]
# then
    npx prisma generate
    npx prisma migrate dev --name='initial_migration'
# fi
npm run start:dev & npx prisma studio