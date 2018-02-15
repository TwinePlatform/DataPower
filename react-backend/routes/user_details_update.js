const router = require('express').Router();
const userUpdate = require('../database/queries/user_details_update');

router.post('/', (req, res, next) => {
  userUpdate(
    req.auth.cb_id,
    req.body.userId,
    req.body.userFullName,
    req.body.sex,
    req.body.yearOfBirth,
    req.body.email
  )
    .then(details => res.send({ details }))
    .catch(next);
});

module.exports = router;