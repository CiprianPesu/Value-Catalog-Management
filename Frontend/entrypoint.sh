#!/bin/sh

set -e

CONFIG_FILE=/usr/share/nginx/html/config.js

echo "Injecting runtime config into $CONFIG_FILE..."

# Replace placeholders with environment variables
sed -i "s|__BACKEND_URL__|${BACKEND_URL}|g" $CONFIG_FILE
sed -i "s|__KEYCLOAK_URL__|${KEYCLOAK_URL}|g" $CONFIG_FILE
sed -i "s|__KEYCLOAK_REALM__|${KEYCLOAK_REALM}|g" $CONFIG_FILE
sed -i "s|__KEYCLOAK_CLIENT__|${KEYCLOAK_CLIENT}|g" $CONFIG_FILE
sed -i "s|__ROLE_GUEST__|${ROLE_GUEST}|g" $CONFIG_FILE
sed -i "s|__ROLE_ADMINISTRATOR__|${ROLE_ADMINISTRATOR}|g" $CONFIG_FILE
sed -i "s|__ROLE_TRANSLATOR__|${ROLE_TRANSLATOR}|g" $CONFIG_FILE
sed -i "s|__ROLE_VALIDATOR__|${ROLE_VALIDATOR}|g" $CONFIG_FILE

echo "Final config.js:"
cat $CONFIG_FILE

echo "Starting Nginx..."
exec nginx -g "daemon off;"