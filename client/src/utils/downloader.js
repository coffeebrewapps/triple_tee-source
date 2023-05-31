export function useDownloader() {
  function downloadRawFile(mimeType, filePath) {
    if (localStorage.getItem('files')) {
      const files = JSON.parse(localStorage.getItem('files'));
      const rawFile = files[filePath];
      return rawFile;
    } else {
      return null;
    }
  }

  return {
    downloadRawFile,
  };
};
