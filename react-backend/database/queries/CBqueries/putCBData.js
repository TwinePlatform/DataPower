const dbConnection = require('../../dbConnection');

const insertCB = 'INSERT INTO cbusiness (org_name, email, genre, hash_pwd) VALUES ($1, $2, $3, $4)';

const putCBData = (org_name, email, genre, hash_pwd) => {
  new Promise((resolve, reject) => {
    dbConnection.query(insertCB, [org_name, email, genre, hash_pwd])
      .then((result) => {
        resolve(res);
      })
      .catch((error) => {
        return reject('There was an error with the putCBData query');

      });
  })
};
module.exports = putCBData;
