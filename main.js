const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const net = require('net');
const common = require('./common');

const userDataPath = app.getPath('userData');
const userConfigFilePath = path.join(userDataPath, 'app_config.json');
const initConfigFilePath = path.join(__dirname, '_init', 'app_config.json');

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

async function handleShowFileInFinder(event, { filePath }) {
  await shell.showItemInFolder(filePath);
}

async function handleCheckPort(event, { port }) {
  console.log(`handleCheckPort`);
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', function(err) {
      console.log(`port in use`);
      if (err.code === 'EADDRINUSE') {
        resolve({ result: false, error: 'Port in use' });
      } else {
        resolve({ result: false, error: 'Unknown' });
      }
    });

    server.once('listening', function() {
      console.log(`port not in use`);
      server.close();
      resolve({ result: true });
    });

    server.listen(port);
  });
}

const initFiles = () => {
  if (!fs.existsSync(userConfigFilePath)) {
    fs.copyFileSync(initConfigFilePath, userConfigFilePath);
  }
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: common.DEFAULT_WIN_WIDTH,
    height: common.DEFAULT_WIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    icon: './icons/t3_icon.png',
  });

  const appRootDir = path.join(app.getAppPath(), 'dist');
  const logsRootDir = app.getPath('logs');
  const dataRootDir = path.join(app.getPath('documents'), 'TripleTeeApp');
  const result = fs.readFileSync(userConfigFilePath, { encoding: 'utf8' });
  const parsedResult = JSON.parse(result);

  win.webContents.send(
    'init-app-config',
    { port: parsedResult.port, appRootDir, logsRootDir, dataRootDir, userConfigFilePath }
  );

  win.loadFile('./config_app/index.html');

  ipcMain.on('set-app-config', async(event, { port, dataRootDir }) => {
    const result = fs.readFileSync(userConfigFilePath, { encoding: 'utf8' });
    const parsedResult = JSON.parse(result);
    const updatedConfig = Object.assign({}, parsedResult);

    if (port) {
      updatedConfig.port = port;
    }

    if (dataRootDir) {
      updatedConfig.dataRootDir = dataRootDir;
    }

    if (
      parsedResult.port !== updatedConfig.port ||
      parsedResult.dataRootDir !== updatedConfig.dataRootDir
    ) {
      fs.writeFileSync(userConfigFilePath, JSON.stringify(updatedConfig), { encoding: 'utf8' });
    }

    const { startServer } = require('./dist/index');
    await startServer({ port: updatedConfig.port, appConfigPath: userConfigFilePath, appRootDir, logsRootDir });

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
  ipcMain.handle('finder:openFile', handleShowFileInFinder);
  ipcMain.handle('check-port', handleCheckPort);

  initFiles();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
