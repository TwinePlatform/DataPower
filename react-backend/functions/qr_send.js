const qrCodeMaker = require('../functions/qrcodemaker');
const generatePdf = require('../functions/pdfgenerator');
const sendemail = require('../functions/sendemail');

const sendQrCode = (email, name, hash, cbLogo) => {
  if (!email) return console.log('Missing the person to deliver this email to');

  qrCodeMaker(hash)
    .then(QRcodeBase64Url => generatePdf(QRcodeBase64Url, cbLogo))
    .then(pdf => sendemail(email, name, pdf))
    .catch(err => {
      console.log('Failed to send email ', err);
    });
};

module.exports = sendQrCode;