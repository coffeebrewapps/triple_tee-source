const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const common = require('./common');

async function handleDirOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (!canceled) {
    return filePaths[0];
  }
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });
  if (!canceled) {
    return filePaths[0];
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: common.DEFAULT_WIN_WIDTH,
    height: common.DEFAULT_WIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  win.loadFile('./config_app/index.html');

  ipcMain.on('set-app-config', (event, { port, dataDir, logFile, uploadDir }) => {
    const configFile = path.join(__dirname, 'app_config.json');
    const result = fs.readFileSync(configFile, { encoding: 'utf8' });
    const parsedResult = JSON.parse(result);
    const updatedConfig = Object.assign({}, parsedResult);

    if (port) {
      updatedConfig.port = port;
    }

    if (dataDir) {
      updatedConfig.dataDir = dataDir;
    }

    if (logFile) {
      updatedConfig.logFile = logFile;
    }

    if (uploadDir) {
      updatedConfig.uploadDir = uploadDir;
    }

    if (
      parsedResult.port !== updatedConfig.port ||
      parsedResult.dataDir !== updatedConfig.dataDir ||
      parsedResult.logFile !== updatedConfig.logFile ||
      parsedResult.uploadDir !== updatedConfig.uploadDir
    ) {
      fs.writeFileSync(configFile, JSON.stringify(updatedConfig), { encoding: 'utf8' });
    }

    require('./dist/index');
    const res = win.loadURL(`http://localhost:${updatedConfig.port}`);

    res.then((data) => {
      console.log('Server started');
    }).catch((error) => {
      console.log(error);
    });
  });
};

app.whenReady().then(() => {
  ipcMain.handle('dialog:openDir', handleDirOpen);
  ipcMain.handle('dialog:openFile', handleFileOpen);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
