#!/bin/bash

CONTAINER=apparaatti_db
SERVICE_NAME=db
DB_NAME=postgres

# currently it is not gzipped
apparaatti_FILE_NAME=apparaatti.sql

SERVER=toska.cs.helsinki.fi
SERVER_PATH=/home/toska_user/most_recent_backup_store/

SERVER_FILE=${SERVER_PATH}${apparaatti_FILE_NAME}

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
BACKUPS=$PROJECT_ROOT/backups/
DOCKER_COMPOSE=$PROJECT_ROOT/compose.yaml

USER_DATA_FILE_PATH=$PROJECT_ROOT/scripts/my_username

username=""

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

get_username() {
  # Check if username has already been set
  [ -z "$username" ]|| return 0

  # Check if username is saved to data file and ask it if not
  if [ ! -f "$USER_DATA_FILE_PATH" ]; then
    echo ""
    echo "!! No previous username data found. Will ask it now !!"
    echo "Enter your Uni Helsinki username:"
    read username
    echo $username > $USER_DATA_FILE_PATH
    echo "Succesfully saved username"
    echo ""
  fi

  # Set username
  username=$(cat $USER_DATA_FILE_PATH | head -n 1)
}

echo "Creating backups folder"
mkdir -p ${BACKUPS}

echo "Fetching a new dump"
get_username
# scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" $username@$SERVER:$SERVER_FILE $BACKUPS

#for sending a file to server:
# echo "sending a dump to storage"
# scp -r -o ProxyCommand="ssh -l $username -W %h:%p melkki.cs.helsinki.fi" $BACKUPS${apparaatti_FILE_NAME} $username@$SERVER:$SERVER_FILE

echo "Removing database and related volume"
docker compose -f $DOCKER_COMPOSE down -v

echo "Starting postgres in the background"
docker compose -f $DOCKER_COMPOSE up -d $SERVICE_NAME $JAMI_DB

retry docker compose -f $DOCKER_COMPOSE exec $SERVICE_NAME pg_isready --dbname=$DB_NAME

echo "Populating apparaatti"
docker exec -i $CONTAINER /bin/bash -c "psql -U postgres" < ${BACKUPS}${apparaatti_FILE_NAME}

# currently the backup file is gzipped
# docker exec -i $CONTAINER /bin/bash -c "gunzip | psql -U postgres" < ${BACKUPS}${apparaatti_FILE_NAME}
