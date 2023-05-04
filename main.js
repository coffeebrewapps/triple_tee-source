const { app, BrowserWindow } = require('electron');
const path = require('path');

const server = require('./dist/server');
const common = require('./common');

const port = process.env.PORT || common.DEFAULT_PORT;

const createWindow = () => {
  const win = new BrowserWindow({
    width: common.DEFAULT_WIN_WIDTH,
    height: common.DEFAULT_WIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const res = win.loadURL(`http://localhost:${port}`)
  res.then((data) => {
    console.log('Server started')
  }).catch((error) => {
    console.log(error)
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
