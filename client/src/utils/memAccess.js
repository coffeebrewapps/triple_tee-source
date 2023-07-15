import schemasData from '@/../../_init/schemas.json';
import contactsData from '@/../../_init/contacts.json';
import countriesData from '@/../../_init/countries.json';
import currenciesData from '@/../../_init/currencies.json';
import systemConfigsData from '@/../../_init/system_configs.json';

export function useMemAccess({ config, logger, utils }) {
  const schemas = config.schemas;
  const indexes = config.indexes;

  const bootstrapData = {
    contacts: contactsData,
    countries: countriesData,
    currencies: currenciesData,
    system_configs: systemConfigsData,
  };

  function initData() {
    return new Promise((resolve, reject) => {
      const result = {
        schemas: {},
        indexes: {},
        data: [],
      };

      result.schemas = schemasData;
      localStorage.setItem(schemas, JSON.stringify(schemasData));

      logger.debug(`Init schema complete`);

      const existingIndexes = JSON.parse(localStorage.getItem(indexes) || '{}');
      if (Object.keys(existingIndexes).length > 0) {
        result.indexes = existingIndexes;
      } else {
        result.indexes = { unique: {}, filter: {}, foreign: {} };
      }

      const existingModelData = JSON.parse(localStorage.getItem('data') || '{}');

      Object.keys(schemasData).forEach((modelClass) => {
        let modelData = {};
        if (existingModelData[modelClass] && Object.keys(existingModelData[modelClass]).length > 0) {
          modelData = existingModelData[modelClass];
        } else {
          modelData = bootstrapData[modelClass] || {};
        }

        result.data.push({
          modelClass,
          data: modelData,
        });
      });

      logger.debug(`Init model data complete`);

      resolve(result);
    });
  }

  function write(modelClass, data) {
    if (modelClass === 'indexes') {
      localStorage.setItem(indexes, JSON.stringify(data));
    } else {
      const modelData = JSON.parse(localStorage.getItem('data'));
      modelData[modelClass] = data;
      localStorage.setItem('data', JSON.stringify(modelData));
    }
  }

  return {
    initData,
    write,
  };
};
