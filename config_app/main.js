const launchButton = document.getElementById('launchBtn');
const portInput = document.getElementById('portInput');
const currentDirInput = document.getElementById('currentDirInput');
const dataDirInput = document.getElementById('dataDirInput');
const logFileInput = document.getElementById('logFileInput');
const uploadDirInput = document.getElementById('uploadDirInput');
const dataDirChooseButton = document.getElementById('dataDirChooseButton');
const logFileChooseButton = document.getElementById('logFileChooseButton');
const uploadDirChooseButton = document.getElementById('uploadDirChooseButton');

launchButton.addEventListener('click', () => {
  const port = portInput.value;
  const dataDir = dataDirInput.value;
  const logFile = logFileInput.value;
  const uploadDir = uploadDirInput.value;

  window.electronAPI.setAppConfig({ port, dataDir, logFile, uploadDir });
});

dataDirChooseButton.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openDirDialog();
  dataDirInput.value = filePath;
});

logFileChooseButton.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openFileDialog();
  logFileInput.value = filePath;
});

uploadDirChooseButton.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openDirDialog();
  uploadDirInput.value = filePath;
});

portInput.value = window.initAppConfigs.port;
currentDirInput.value = window.initAppConfigs.currentDir;
dataDirInput.value = window.initAppConfigs.dataDir;
logFileInput.value = window.initAppConfigs.logFile;
uploadDirInput.value = window.initAppConfigs.uploadDir;
