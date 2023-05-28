const launchButton = document.getElementById('launchBtn')
const portInput = document.getElementById('portInput')
const dataDirInput = document.getElementById('dataDirInput')
const logFileInput = document.getElementById('logFileInput')

launchButton.addEventListener('click', () => {
  const port = portInput.value
  const dataDir = dataDirInput.value
  const logFile = logFileInput.value

  window.electronAPI.setAppConfig({ port, dataDir, logFile })
})
