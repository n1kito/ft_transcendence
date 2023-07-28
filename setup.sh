#!/bin/bash

# Formatting 

GREEN_CHECKMARK="\033[32m✓\033[0m"
BOLD=$(tput bold)
DIM="\033[2m"
UNDERLINE="\033[4m"
END_C=$(tput sgr0)

# Checking that we are in a .git repo
if ! git status &> /dev/null; then
    echo "This is not a git repository !\n"
    exit 1
fi

# Retrieve the path to the git repo top level
root_dir=$(git rev-parse --show-toplevel)

printf "
░█▀▄░█▀█░▀█▀░█▀█░█▀▄░█▀█░█▀▀░█▀▀░░░█▀▀░█▀▀░▀█▀░█░█░█▀█
░█░█░█▀█░░█░░█▀█░█▀▄░█▀█░▀▀█░█▀▀░░░▀▀█░█▀▀░░█░░█░█░█▀▀
░▀▀░░▀░▀░░▀░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀░░

"
# retrieve variables from users
echo -e "${DIM}This script will automatically look through your ${BOLD}exported${END_C}${DIM} environment variables and use them if they are available.
They should have the same name as the following variables.${END_C}"
echo
echo -e "${UNDERLINE}Retrieving database information${END_C}:"
echo

if [[ -z "${POSTGRES_USER}" ]]; then
	read -p "> ${BOLD}POSTGRES_USER${END_C}:	" POSTGRES_USER
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}POSTGRES_USER${END_C}:	${POSTGRES_USER}"
fi

if [[ -z "${POSTGRES_PASSWORD}" ]]; then
read -p "> ${BOLD}POSTGRES_PASSWORD${END_C}:	" POSTGRES_PASSWORD
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}POSTGRES_PASSWORD${END_C}:	${POSTGRES_PASSWORD}"
fi

if [[ -z "${POSTGRES_DB}" ]]; then
read -p "> ${BOLD}POSTGRES_DB${END_C}:		" POSTGRES_DB
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}POSTGRES_DB${END_C}:		${POSTGRES_DB}"
fi

echo 
echo -e "${UNDERLINE}Retrieving API information${END_C}:"
echo
if [[ -z "${FT_UID}" ]]; then
read -p "> ${BOLD}FT_UID${END_C}:			" FT_UID
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}FT_UID${END_C}:		${FT_UID}"
fi

if [[ -z "${FT_SECRET}" ]]; then
read -p "> ${BOLD}FT_SECRET${END_C}:		" FT_SECRET
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}FT_SECRET${END_C}:		${FT_SECRET}"
fi
echo
echo -e "${UNDERLINE}Retrieving JWT secret key${END_C}:"
echo
if [[ -z "${JWT_SECRET_KEY}" ]]; then
read -p "> ${BOLD}SECRET KEY${END_C}:		" JWT_SECRET_KEY
else
	echo -e "${GREEN_CHECKMARK} ${BOLD}SECRET KEY${END_C}:		${JWT_SECRET_KEY}"
fi
echo

# Create the .env files
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