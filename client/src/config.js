import { ref } from 'vue';

const useConfig = () => {
  const env = import.meta.env;
  const baseUrl = ref('');
  const dataAccess = ref('');

  function castUndefined(value) {
    if (value === 'undefined') {
      return null;
    } else {
      return value;
    }
  }

  if (env.MODE === 'development') {
    const port = castUndefined(env.VITE_SERVER_PORT) || env.VITE_DEFAULT_SERVER_PORT;
    dataAccess.value = castUndefined(env.VITE_DATA_ACCESS) || env.VITE_DEFAULT_DATA_ACCESS;
    baseUrl.value = `http://localhost:${port}`;
  } else if (env.MODE === 'staging') {
    dataAccess.value = 'web';
  } else {
    baseUrl.value = ``;
    dataAccess.value = 'api';
  }

  return {
    baseUrl: baseUrl.value,
    dataAccess: dataAccess.value,
  };
};

export default useConfig;
