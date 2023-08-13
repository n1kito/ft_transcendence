#!/bin/sh

npm ci

# Setting up the database with prisma
npx prisma generate
npx prisma migrate dev --name='initial_migration'

npm run start:dev