#!/bin/bash

CONTAINER=apparaatti_db
SERVICE_NAME=db
DB_NAME=postgres

PROJECT_ROOT=$(dirname $(dirname $(realpath "$0")))
BACKUPS=$PROJECT_ROOT/backups/
DOCKER_COMPOSE=$PROJECT_ROOT/docker-compose.yml

retry () {
    for i in {1..60}
    do
        $@ && break || echo "Retry attempt $i failed, waiting..." && sleep 3;
    done
}

# Check if backups folder exists
if [ ! -d "$BACKUPS" ]; then
  echo ""
  echo "!! Backups folder not found !!"
  echo "Please ensure the backups folder exists at: $BACKUPS"
  echo ""
  exit 1
fi

# --- Selection ---
echo "Listing available backups in $BACKUPS..."
backup_files=$(find "$BACKUPS" -name "*.sql.gz" -type f)

if [ -z "$backup_files" ]; then
  echo "No backup files found in $BACKUPS"
  echo "Please ensure you have .sql.gz files in the backups folder"
  exit 1
fi

echo "Available backups:"
select chosen_backup in $backup_files; do
  if [ -n "$chosen_backup" ]; then
    echo "You selected: $chosen_backup"
    FILE_NAME=$(basename "$chosen_backup")
    break
  else
    echo "Invalid selection. Please select a valid backup number."
  fi
done

if [ ! -f "$chosen_backup" ]; then
  echo "Backup file not found: $chosen_backup"
  exit 1
fi

# --- Reset and Start ---
echo "Removing database and related volume"
docker compose -f $DOCKER_COMPOSE down -v

echo "Starting postgres containers in the background"
docker compose -f $DOCKER_COMPOSE up -d 

read -p "Almost there, press enter to continue"

echo "Populating database with $FILE_NAME"
docker exec -i $CONTAINER /bin/bash -c "gunzip | psql -U postgres" < "$chosen_backup"

echo ""
echo "Database populated successfully!"
echo ""
