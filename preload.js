const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setAppConfig: ({ port, dataDir, logFile }) => ipcRenderer.send('set-app-config', { port, dataDir, logFile })
})
