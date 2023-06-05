export function useFileUtils() {
  async function fileToBase64(file) {
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

  async function base64ToFile(datauri, filename, mimeType) {
    return new Promise((resolve, reject) => {
      fetch(datauri)
        .then((result) => {
          result.blob()
            .then((blob) => {
              resolve(new File([blob], filename, { type: mimeType }));
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  return {
    fileToBase64,
    base64ToFile,
  };
}
