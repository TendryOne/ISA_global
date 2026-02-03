#!/bin/bash
# Génération du keyFile MongoDB pour replica set

echo "Génération du keyFile MongoDB..."
openssl rand -base64 756 > mongodb-keyfile
chmod 400 mongodb-keyfile
echo "✓ KeyFile généré: mongodb-keyfile"
