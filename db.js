const {Pool} = require('pg');

const pool = new Pool({
    user: 'kadm',
    password: '123',
    host: 'localhost',
    port: 5432,
    database: 'kreg'
});

module.exports = pool;
