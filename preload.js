const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
  openDirDialog: async() => ipcRenderer.invoke('dialog:openDir'),
  openFileDialog: async() => ipcRenderer.invoke('dialog:openFile'),
  setAppConfig: ({ port, dataDir, logFile }) => ipcRenderer.send('set-app-config', { port, dataDir, logFile }),
});

const currentDir = path.join(__dirname);
const configFile = path.join(__dirname, 'app_config.json');
const result = fs.readFileSync(configFile, { encoding: 'utf8' });
const parsedResult = JSON.parse(result);

contextBridge.exposeInMainWorld('initAppConfigs', {
  port: parsedResult.port,
  currentDir,
  dataDir: parsedResult.dataDir,
  logFile: parsedResult.logFile,
});
