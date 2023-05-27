import { ref } from 'vue'
const env = import.meta.env

const useConfig = () => {
  const baseUrl = ref('')
  const dataAccess = 'api'

  if (env.MODE === 'development') {
    const port = env.VITE_SERVER_PORT || env.VITE_DEFAULT_SERVER_PORT
    baseUrl.value = `http://localhost:${port}`
  } else {
    baseUrl.value = ``
  }

  return {
    baseUrl: baseUrl.value,
    dataAccess
  }
}

export default useConfig
