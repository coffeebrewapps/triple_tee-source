const launchButton = document.getElementById('launchBtn');
const portInput = document.getElementById('portInput');
const currentDirInput = document.getElementById('currentDirInput');
const dataDirInput = document.getElementById('dataDirInput');
const logFileInput = document.getElementById('logFileInput');

launchButton.addEventListener('click', () => {
  const port = portInput.value;
  const dataDir = dataDirInput.value;
  const logFile = logFileInput.value;

  window.electronAPI.setAppConfig({ port, dataDir, logFile });
});

dataDirInput.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openDirDialog();
  dataDirInput.value = filePath;
});

logFileInput.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openFileDialog();
  logFileInput.value = filePath;
});

portInput.value = window.initAppConfigs.port;
currentDirInput.value = window.initAppConfigs.currentDir;
dataDirInput.value = window.initAppConfigs.dataDir;
logFileInput.value = window.initAppConfigs.logFile;
