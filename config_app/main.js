const portInput = document.getElementById('portInput');
const portInputError = document.getElementById('portInputError');

const appRootDirInput = document.getElementById('appRootDirInput');
const logsRootDirInput = document.getElementById('logsRootDirInput');
const userConfigFilePathInput = document.getElementById('userConfigFilePathInput');

const dataRootDirInput = document.getElementById('dataRootDirInput');
const dataRootDirInputError = document.getElementById('dataRootDirInputError');

const appRootDirShowButton = document.getElementById('appRootDirShowButton');
const logsRootDirShowButton = document.getElementById('logsRootDirShowButton');
const userConfigFilePathShowButton = document.getElementById('userConfigFilePathShowButton');
const dataRootDirChooseButton = document.getElementById('dataRootDirChooseButton');

const launchButton = document.getElementById('launchBtn');

function isEmpty(val) {
  return (
    Object.is(val, undefined) ||
    Object.is(val, 'undefined') ||
    Object.is(val, null) ||
    Object.is(val, 'null') ||
    Object.is(val, '')
  );
}

function resetErrors() {
  portInputError.innerHTML = '';
  dataRootDirInputError.innerHTML = '';
}

async function validateInput() {
  let error = false;

  if (isEmpty(portInput.value)) {
    portInputError.innerHTML = 'Required field';
    error = true;
  } else {
    const result = await window.electronAPI.checkValidPort(portInput.value);
    if (!result) {
      portInputError.innerHTML = 'Port is in use';
      error = true;
    }
  }

  if (isEmpty(dataRootDirInput.value)) {
    dataRootDirInputError.innerHTML = 'Required field';
    error = true;
  }

  return error;
}

launchButton.addEventListener('click', async() => {
  const port = portInput.value;
  const dataRootDir = dataRootDirInput.value;

  resetErrors();
  const result = await validateInput();

  if (result) {
    window.electronAPI.setAppConfig({ port, dataRootDir });
  }
});

appRootDirShowButton.addEventListener('click', async() => {
  if (appRootDirInput.value) {
    await window.electronAPI.showFileFinder(appRootDirInput.value);
  }
});

logsRootDirShowButton.addEventListener('click', async() => {
  if (logsRootDirInput.value) {
    await window.electronAPI.showFileFinder(logsRootDirInput.value);
  }
});

userConfigFilePathShowButton.addEventListener('click', async() => {
  if (userConfigFilePathInput.value) {
    await window.electronAPI.showFileFinder(userConfigFilePathInput.value);
  }
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
