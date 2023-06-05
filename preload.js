const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirDialog: async() => ipcRenderer.invoke('dialog:openDir'),
  openFileDialog: async() => ipcRenderer.invoke('dialog:openFile'),
  setAppConfig: ({ port, dataDir, logFile, uploadDir }) => {
    ipcRenderer.send('set-app-config', { port, dataDir, logFile, uploadDir });
  },
});

ipcRenderer.on('init-app-config', (event, { port, currentDir, dataDir, logFile, uploadDir }) => {
  contextBridge.exposeInMainWorld('initAppConfigs', {
    port,
    currentDir,
    dataDir,
    logFile,
    uploadDir,
  });
});
