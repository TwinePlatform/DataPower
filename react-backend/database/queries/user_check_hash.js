const dbConnection = require('../dbConnection');

const checkName = 'SELECT fullName, hash FROM users WHERE hash = $1';

const getHash = hashString =>
  dbConnection
    .query(checkName, [hashString])
    .then(
      res =>
        res.rowCount ? res.rows[0] : Promise.reject(new Error('No user found'))
    );

module.exports = getHash;
