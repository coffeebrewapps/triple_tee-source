const fs = require('fs');

module.exports = () => {
  function downloadRawFile(mimeType, filePath) {
    if (fs.existsSync(filePath)) {
      const rawFile = fs.readFileSync(filePath);
      const bufferString = Buffer.from(rawFile, 'binary').toString('base64');
      return `data:${mimeType};base64,${bufferString}`;
    } else {
      return null;
    }
  }

  return {
    downloadRawFile,
  };
};
