#!/bin/bash

BOLD=$(tput bold)
END_C=$(tput sgr0)

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
read -p "> ${BOLD}POSTGRES_USER${END_C}:	" POSTGRES_USER
read -p "> ${BOLD}POSTGRES_PASSWORD${END_C}:	" POSTGRES_PASSWORD
read -p "> ${BOLD}POSTGRES_DB${END_C}:		" POSTGRES_DB
echo 
echo "Retrieving API information"
echo
read -p "> ${BOLD}UID${END_C}:			" FT_UID
read -p "> ${BOLD}SECRET${END_C}:		" FT_SECRET
echo
echo "Retrieving JWT secret key"
echo
read -p "> ${BOLD}SECRET KEY${END_C}:		" JWT_SECRET_KEY
echo

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
FT_UID=\"$FT_UID\"
FT_SECRET=\"$FT_SECRET\"

# JWT SECRET KEY
JWT_SECRET_KEY=\"$JWT_SECRET_KEY\"
"

echo
echo "All done ! 🔥"
echo
echo -n "> ${BOLD}Would you like to install nestJs and React packages and launch Docker ?${END_C} (y/N)"
read -n1 answer
echo
case ${answer:0:1} in
    y|Y )
        # Run your script here. For example:
        ./launch.sh
    ;;
    * )
		echo
        echo "Fine ! Do what you want I'm not your mother."
		echo
        exit
    ;;
esac