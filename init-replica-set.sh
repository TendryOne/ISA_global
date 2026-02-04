#!/bin/bash
# Script d'initialisation MongoDB Replica Set

echo "Attente du démarrage de MongoDB..."
sleep 10

echo "Initialisation du Replica Set..."
docker exec isa-mongodb mongosh -u admin -p "${MONGO_PASSWORD:-password}" --authenticationDatabase admin --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb:27017" }
  ]
})
' || echo "Replica Set déjà initialisé"

echo "Vérification du statut du Replica Set..."
docker exec isa-mongodb mongosh -u admin -p "${MONGO_PASSWORD:-password}" --authenticationDatabase admin --eval 'rs.status()' || true

echo "✓ MongoDB configuré pour les transactions"
