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
echo "Retrieving database information:"
echo
read -p "> POSTGRES_USER:	" POSTGRES_USER
read -p "> POSTGRES_PASSWORD:	" POSTGRES_PASSWORD
read -p "> POSTGRES_DB:		" POSTGRES_DB
echo 
echo "Retrieving API information"
echo
read -p "> UID:			" FT_UID
read -p "> SECRET:		" FT_SECRET

> "$root_dir"/.env printf "\
# Postgres variables
POSTGRES_DB=\"$POSTGRES_DB\"
POSTGRES_USER=\"$POSTGRES_USER\"
POSTGRES_PASSWORD=\"$POSTGRES_PASSWORD\"

DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\""

> "$root_dir"/nestjs/.env printf "\
# Database
DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\"

# 42 API
42UID=\"$FT_UID\"
42SECRET=\"$FT_SECRET\"
"

# run npm install
printf "
░█▀█░█▀█░█▄█░░░▀█▀░█▀█░█▀▀░▀█▀░█▀█░█░░░█░░
░█░█░█▀▀░█░█░░░░█░░█░█░▀▀█░░█░░█▀█░█░░░█░░
░▀░▀░▀░░░▀░▀░░░▀▀▀░▀░▀░▀▀▀░░▀░░▀░▀░▀▀▀░▀▀▀

"
cd $root_dir/nestjs && npm install
cd $root_dir

echo
echo "All done ! 🔥"