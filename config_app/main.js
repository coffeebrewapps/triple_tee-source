const launchButton = document.getElementById('launchBtn');
const portInput = document.getElementById('portInput');
const appRootDirInput = document.getElementById('appRootDirInput');
const logsRootDirInput = document.getElementById('logsRootDirInput');
const userConfigFilePathInput = document.getElementById('userConfigFilePathInput');
const dataRootDirInput = document.getElementById('dataRootDirInput');
const dataRootDirChooseButton = document.getElementById('dataRootDirChooseButton');

launchButton.addEventListener('click', () => {
  const port = portInput.value;
  const dataRootDir = dataRootDirInput.value;

  window.electronAPI.setAppConfig({ port, dataRootDir });
});

dataRootDirChooseButton.addEventListener('click', async() => {
  const filePath = await window.electronAPI.openDirDialog();
  dataRootDirInput.value = filePath;
});

portInput.value = window.initAppConfigs.port;
appRootDirInput.value = window.initAppConfigs.appRootDir;
logsRootDirInput.value = window.initAppConfigs.logsRootDir;
userConfigFilePathInput.value = window.initAppConfigs.userConfigFilePath;
dataRootDirInput.value = window.initAppConfigs.dataRootDir;
