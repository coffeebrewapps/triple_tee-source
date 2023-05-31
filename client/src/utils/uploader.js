export function useUploader() {
  function generateFilePath(field, filename) {
    const suffix = [Date.now(), Math.round(Math.random() * 1E9)].join('-');
    const sanitizedFilename = filename.replace(/[^0-9A-Za-z]/g, '-');
    return [field, sanitizedFilename, suffix].join('-');
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  async function upload(field, file) {
    const mimeType = file.type;
    const filename = file.name;
    const filePath = generateFilePath(field, filename);

    const rawData = await fileToBase64(file);

    const files = JSON.parse(localStorage.getItem('files') || '{}');
    files[filePath] = rawData;
    localStorage.setItem('files', JSON.stringify(files));
    return { filename, mimeType, filePath };
  }

  return {
    upload,
  };
}
