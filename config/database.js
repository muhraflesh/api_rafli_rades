var Pool = require('pg').Pool;
var connection = new Pool({
    user: 'raflesh',
    host: '127.0.0.1',
    database: 'thalassaemia_v2',
    password: '123',
    port: '5432',
});

connection.connect(function (err) {
    if(err) {
        throw err;
    }
});

module.exports = connection;