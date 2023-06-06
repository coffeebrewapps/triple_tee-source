const fs = require('fs');

module.exports = ({ config }) => {
  const uploadDir = config.uploadDir;

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const multer = require('multer');

  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const mimetype = file.mimetype;
      const extension = mimetype.split('/')[1];
      const suffix = [Date.now(), Math.round(Math.random() * 1E9)].join('-');
      const sanitizedFilename = file.originalname.replace(/[^0-9A-Za-z]/g, '-');
      const filename = [file.fieldname, sanitizedFilename, suffix].join('-');
      cb(null, `${filename}.${extension}`);
    },
  });

  const uploader = multer({ storage });

  return {
    uploader,
  };
};
