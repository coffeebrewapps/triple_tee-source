const fs = require('fs');

module.exports = ({ config }) => {
  const uploadDir = config.uploadDir;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      cb(null, `${file.fieldname}-${file.originalname}`);
    },
  });

  const uploader = multer({ storage });

  return {
    uploader,
  };
};
