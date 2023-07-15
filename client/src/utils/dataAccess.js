import useConfig from '@/config';
import { useApiAccess } from './api';
import { useWebAccess } from './web';
import { useDataStore } from '@/stores/data';

export function useDataAccess() {
  const config = useConfig();
  const dataAccess = config.dataAccess;
  const dataStore = useDataStore();

  if (dataAccess === 'api') {
    return useApiAccess();
  } else if (dataAccess === 'web') {
    return useWebAccess(dataStore);
  } else {
    return {};
  }
}
