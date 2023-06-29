#!/bin/bash

# Checking that we are in a .git repo
if ! git status &> /dev/null; then
    echo "This is not a git repository !\n"
    exit 1
fi

# retrieve the path to the git repo top level
root_dir=$(git rev-parse --show-toplevel)

printf "
░█▀▄░█▀█░▀█▀░█▀█░█▀▄░█▀█░█▀▀░█▀▀░░░█▀▀░█▀▀░▀█▀░█░█░█▀█
░█░█░█▀█░░█░░█▀█░█▀▄░█▀█░▀▀█░█▀▀░░░▀▀█░█▀▀░░█░░█░█░█▀▀
░▀▀░░▀░▀░░▀░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀░░

"
# retrieve variables from users
read -p "POSTGRES_USER=" POSTGRES_USER
read -p "POSTGRES_PASSWORD=" POSTGRES_PASSWORD
read -p "POSTGRES_DB=" POSTGRES_DB

> "$root_dir"/.env printf "\
POSTGRES_DB=\"db\"
POSTGRES_USER=\"postgres\"
POSTGRES_PASSWORD=\"password\"

DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\""

> "$root_dir"/nestjs/.env printf "\
DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\""

# run npm install
printf "
░█▀█░█▀█░█▄█░░░▀█▀░█▀█░█▀▀░▀█▀░█▀█░█░░░█░░
░█░█░█▀▀░█░█░░░░█░░█░█░▀▀█░░█░░█▀█░█░░░█░░
░▀░▀░▀░░░▀░▀░░░▀▀▀░▀░▀░▀▀▀░░▀░░▀░▀░▀▀▀░▀▀▀

"
cd $root_dir/nestjs && npm install
cd $root_dir