import { ref } from 'vue'
const env = import.meta.env

const useConfig = () => {
  const baseUrl = ref('')
  const dataAccess = 'api'

  if (env.MODE === 'development') {
    baseUrl.value = `http://localhost:${env.VITE_SERVER_PORT}`
  } else {
    baseUrl.value = ``
  }

  return {
    baseUrl: baseUrl.value,
    dataAccess
  }
}

export default useConfig
