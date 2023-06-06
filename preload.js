const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirDialog: async() => ipcRenderer.invoke('dialog:openDir'),
  openFileDialog: async() => ipcRenderer.invoke('dialog:openFile'),
  setAppConfig: ({ port, dataRootDir }) => {
    ipcRenderer.send('set-app-config', { port, dataRootDir });
  },
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
