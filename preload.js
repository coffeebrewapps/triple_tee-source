const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirDialog: async() => ipcRenderer.invoke('dialog:openDir'),
  openFileDialog: async() => ipcRenderer.invoke('dialog:openFile'),
  showFileFinder: async(filePath) => ipcRenderer.invoke('finder:openFile', { filePath }),
  setAppConfig: ({ port, dataRootDir }) => {
    ipcRenderer.send('set-app-config', { port, dataRootDir });
  },
  checkValidPort: async(port) => ipcRenderer.invoke('check-port', { port }),
});

ipcRenderer.on('init-app-config', (event, { port, appRootDir, logsRootDir, dataRootDir, userConfigFilePath }) => {
  contextBridge.exposeInMainWorld('initAppConfigs', {
    port,
    appRootDir,
    logsRootDir,
    dataRootDir,
    userConfigFilePath,
  });
});
