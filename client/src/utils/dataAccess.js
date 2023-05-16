import useConfig from '@/config'
import { useApiAccess } from './api'

export function useDataAccess() {
  const config = useConfig()
  const dataAccess = config.dataAccess

  if (dataAccess === 'api') {
    return useApiAccess()
  } else {
    return {}
  }
}
