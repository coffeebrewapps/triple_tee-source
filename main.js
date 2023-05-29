const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const common = require('./common');

const createWindow = () => {
  const win = new BrowserWindow({
    width: common.DEFAULT_WIN_WIDTH,
    height: common.DEFAULT_WIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  win.loadFile('./config_app/index.html')

  ipcMain.on('set-app-config', (event, { port, dataDir, logFile }) => {
    const configFile = path.join(__dirname, 'app_config.json')
    const result = fs.readFileSync(configFile, { encoding: 'utf8' })
    const parsedResult = JSON.parse(result)
    const updatedConfig = Object.assign({}, parsedResult)

    if (port) {
      updatedConfig.port = port
    }

    if (dataDir) {
      updatedConfig.dataDir = dataDir
    }

    if (logFile) {
      updatedConfig.logFile = logFile
    }

    if (parsedResult.port !== updatedConfig.port || parsedResult.dataDir !== updatedConfig.dataDir || parsedResult.logFile !== updatedConfig.logFile) {
      fs.writeFileSync(configFile, JSON.stringify(updatedConfig), { encoding: 'utf8' })
    }

    const server = require('./dist/index');
    const res = win.loadURL(`http://localhost:${updatedConfig.port}`)

    res.then((data) => {
      console.log('Server started')
    }).catch((error) => {
      console.log(error)
    })
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
