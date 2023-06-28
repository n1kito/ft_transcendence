# ft_transcendence
Soon, you will realize that you already know things that you thought you didn’t...

# Env setup script

```bash
#!/bin/bash

# retrieve the path to the git repo top level
root_dir=$(git rev-parse --show-toplevel)

# retrieve variables from users
read -p "POSTGRES_USER=" POSTGRES_USER
read -p "POSTGRES_PASSWORD=" POSTGRES_PASSWORD
read -p "POSTGRES_DB=" POSTGRES_DB

> "$root_dir"/Docker/.env printf "\
POSTGRES_DB=\"db\"
POSTGRES_USER=\"postgres\"
POSTGRES_PASSWORD=\"password\"

DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\""

> "$root_dir"/nestjs/.env printf "\
DATABASE_URL=\"postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public\""

# run npm install
echo "* Running npm install *"
cd nestjs && npm install
cd $root_dir
```
