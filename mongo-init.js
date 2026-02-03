// Initialisation MongoDB avec Replica Set pour supporter les transactions
rs.initiate({
    _id: "rs0",
    members: [
        { _id: 0, host: "localhost:27017" }
    ]
});
