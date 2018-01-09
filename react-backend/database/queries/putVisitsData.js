const dbConnection = require('../dbConnection');

const insertVisit =
  'INSERT INTO visits (usersId, activitiesId, date) VALUES ((SELECT id FROM users WHERE hash = $1),(SELECT id FROM activities WHERE name = $2), DEFAULT)';

const putVisitsData = (hashString, activitiesName) => {
  new Promise((resolve, reject) => {
    dbConnection.query(insertVisit, [hashString, activitiesName])
      .then((result) => {
        resolve(true);
      })
      .catch((error) => {
        return reject('There was an error with the putVisitsData query');
      });
  })
};

module.exports = putVisitsData;
