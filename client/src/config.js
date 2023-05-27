import { ref } from 'vue'
const env = import.meta.env

const useConfig = () => {
  const baseUrl = ref('')
  const dataAccess = ref('')

  if (env.MODE === 'development') {
    const port = env.VITE_SERVER_PORT || env.VITE_DEFAULT_SERVER_PORT
    dataAccess.value = env.VITE_DATA_ACCESS || env.VITE_DEFAULT_DATA_ACCESS
    baseUrl.value = `http://localhost:${port}`
  } else if (env.MODE === 'staging') {
    dataAccess.value = 'web'
  } else {
    baseUrl.value = ``
  }

  return {
    baseUrl: baseUrl.value,
    dataAccess: dataAccess.value
  }
}

export default useConfig
