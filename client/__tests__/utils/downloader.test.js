import { useDownloader } from '../../src/utils/downloader.js';

const downloader = useDownloader();

describe('useDownloader', () => {
  test('should export functions', () => {
    expect(downloader).toEqual(expect.objectContaining({
      downloadRawFile: expect.anything(),
    }));
  });
});

describe('downloadRawFile', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('when exists should load raw file from local storage', () => {
    const files = {
      'logo.png': 'data:image/png;base64,fake-file-string',
    };
    localStorage.setItem('files', JSON.stringify(files));

    const rawFile = downloader.downloadRawFile('image/png', 'logo.png');
    expect(rawFile).toEqual('data:image/png;base64,fake-file-string');
  });

  test('when not exists should return undefined', () => {
    const files = {
      'logo.png': 'data:image/png;base64,fake-file-string',
    };
    localStorage.setItem('files', JSON.stringify(files));

    const rawFile = downloader.downloadRawFile('image/png', 'logo2.png');
    expect(rawFile).toBeUndefined();
  });

  test('when no local storage should return null', () => {
    const rawFile = downloader.downloadRawFile('image/png', 'logo2.png');
    expect(rawFile).toBeNull();
  });
});
