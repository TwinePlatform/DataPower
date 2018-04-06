const { selectQuery } = require('../../shared/models/query_builder');

const getUserList = (dbConnection, cbId) =>
  dbConnection.query(
    selectQuery(
      'users',
      [
        'id',
        'fullName AS name',
        'sex AS gender',
        'yearofbirth AS yob',
        'email',
        'date AS registered_at',
        'is_email_contact_consent_granted AS email_consent',
        'is_sms_contact_consent_granted AS sms_consent',
      ],
      { cb_id: cbId }
    )
  )
    .then(res => res.rows);

module.exports = getUserList;
