#!/bin/bash
# Script d'initialisation MongoDB Replica Set

echo "Attente du démarrage de MongoDB..."
sleep 10

echo "Initialisation du Replica Set..."
docker exec isa-mongodb mongosh --eval '
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
})
' || echo "Replica Set déjà initialisé"

echo "Vérification du statut du Replica Set..."
docker exec isa-mongodb mongosh --eval 'rs.status()' || true

echo "✓ MongoDB configuré pour les transactions"
