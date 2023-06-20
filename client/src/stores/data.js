import { ref } from 'vue';
import { defineStore } from 'pinia';

import { default as useDataAccess } from '#/dataAccess.js';
import { default as utils } from '#/utils.js';

import { useLogger } from '@/utils/logger';
import { useDataValidations } from '@/utils/dataValidations';
import { useDownloader } from '@/utils/downloader';
import { useMemAccess } from '@/utils/memAccess';

export const useDataStore = defineStore('data', () => {
  const schemas = '_schemas';
  const indexes = '_indexes';
  const config = {
    schemas,
    indexes,
  };

  const validator = useDataValidations();
  const downloader = useDownloader();
  const logger = useLogger();
  const persistence = useMemAccess({ config, logger, utils });

  const dataAccess = useDataAccess({ persistence, validator, downloader, config, logger, utils });

  const isInit = ref(false);
  const customFunctions = ref({});

  async function init() {
    if (isInit.value) { return; }

    await dataAccess.initData(true);

    isInit.value = true
  }

  function registerFunction(modelClass, fnType, fnName, fn) {
    if (!customFunctions.value[modelClass]) {
      customFunctions.value[modelClass] = {};
    }

    if (!customFunctions.value[modelClass][fnType]) {
      customFunctions.value[modelClass][fnType] = {};
    }

    customFunctions.value[modelClass][fnType][fnName] = fn;
  }

  function customFunctionsForModel(modelClass, fnType) {
    return (customFunctions.value[modelClass] || {})[fnType];
  }

  function listCustomFunctions() {
    return customFunctions.value;
  }

  return Object.assign(
    {
      init,
    },
    dataAccess,
    {
      registerFunction,
      customFunctionsForModel,
      listCustomFunctions,
    }
  );
});
