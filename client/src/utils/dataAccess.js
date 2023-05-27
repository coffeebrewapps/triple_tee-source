import useConfig from '@/config'
import { useApiAccess } from './api'
import { useWebAccess } from './web'

export function useDataAccess() {
  const config = useConfig()
  const dataAccess = config.dataAccess

  if (dataAccess === 'api') {
    return useApiAccess()
  } else if (dataAccess === 'web') {
    return useWebAccess()
  } else {
    return {}
  }
}
