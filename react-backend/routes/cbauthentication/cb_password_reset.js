const router = require('express').Router();
const validator = require('validator');
const cbCheckExists = require('../../database/queries/cb/cb_check_exists');
const resetTokenGen = require('../../functions/tokengen');
const pwdTokenAdd = require('../../database/queries/cb/pwd_token_add');
const sendResetEmail = require('../../functions/sendResetEmail');

router.post('/', (req, res, next) => {
  const { formEmail } = req.body;
  const tokenExpire = Date.now() + 3600000;

  const isEmpty = !formEmail.length;
  const notEmail = !validator.isEmail(formEmail);

  const validationError =
    (isEmpty && 'noinput') || (notEmail && 'email') || null;

  if (validationError) return res.send(validationError);

  cbCheckExists(formEmail)
    .then(exists => {
      if (exists) {
        resetTokenGen()
          .then(token =>
            Promise.all([
              pwdTokenAdd(token, tokenExpire, formEmail),
              sendResetEmail(formEmail, token)
            ])
          )
          .then(() => res.send(exists))
          .catch(err => {
            console.log('Error sending email:', err);
            res.status(502).send('failed');
          });
      } else {
        res.status(400).send(exists);
      }
    })
    .catch(next);
});

module.exports = router;
