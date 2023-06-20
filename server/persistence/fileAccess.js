module.exports = ({ config, logger, utils }) => {
  const path = require('path');
  const fs = require('fs');

  const dataDir = config.dataDir;
  const initDir = config.initDir;

  const schemasData = require(path.join(initDir, 'schemas.json'));
  const chartConfigsData = require(path.join(initDir, 'chart_configs.json'));
  const contactsData = require(path.join(initDir, 'contacts.json'));
  const countriesData = require(path.join(initDir, 'countries.json'));
  const currenciesData = require(path.join(initDir, 'currencies.json'));
  const systemConfigsData = require(path.join(initDir, 'system_configs.json'));
  const bootstrapData = {
    chart_configs: chartConfigsData,
    contacts: contactsData,
    countries: countriesData,
    currencies: currenciesData,
    system_configs: systemConfigsData,
  };

  const writeToFileQueue = {};

  function pathName(modelClass) {
    return path.join(dataDir, `${modelClass}.json`);
  }

  async function initData(schemas, indexes) {
    writeToFileQueue[schemas] = [];
    writeToFileQueue[indexes] = [];

    if (!fs.existsSync(dataDir)) {
      logger.log(`Data directory does not exist, creating directory...`, dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      Promise.all([loadSchemasAndData(schemas), loadIndexes(indexes)])
        .then((result) => {
          const allResults = result.reduce((o, r) => {
            return Object.assign({}, o, r);
          });
          resolve(allResults);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function loadSchemasAndData(schemas) {
    return new Promise((resolve, reject) => {
      loadSchemas(schemas)
        .then((schemaResult) => {
          const promises = Object.keys(schemaResult).map((modelClass) => {
            writeToFileQueue[modelClass] = [];
            return loadData(modelClass);
          });
          Promise
            .all(promises)
            .then((dataResults) => {
              resolve({ schemas: schemaResult, data: dataResults });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function loadSchemas(schemas) {
    return new Promise((resolve, reject) => {
      initSchemasFile(schemas, schemasData)
        .then(() => {
          readFromFile(schemas)
            .then((result) => {
              resolve(JSON.parse(result));
            })
            .catch((error) => {
              logger.error(`Error schema file`, { schemas, error });
              reject(error);
            });
        })
        .catch((error) => {
          logger.error(`Error initializing schema file`, { schemas, error });
          reject(error);
        });
    });
  }

  async function loadIndexes(indexes) {
    return new Promise((resolve, reject) => {
      initFileIfNotExists(indexes, { unique: {}, foreign: {}, filter: {} })
        .then(() => {
          readFromFile(indexes)
            .then((result) => {
              resolve({ indexes: JSON.parse(result) });
            })
            .catch((error) => {
              logger.error(`Error index file`, { indexes, error });
              reject(error);
            });
        })
        .catch((error) => {
          logger.error(`Error creating index file`, { indexes, error });
          reject(error);
        });
    });
  }

  async function loadData(modelClass) {
    return new Promise((resolve, reject) => {
      initFileIfNotExists(modelClass, bootstrapData[modelClass])
        .then(() => {
          readFromFile(modelClass)
            .then((result) => {
              if (result) {
                resolve({ modelClass, data: JSON.parse(result) });
              } else {
                resolve({ modelClass, data: {} });
              }
            })
            .catch((error) => {
              logger.error(`Error reading file`, { modelClass, error });
              reject(error);
            });
        })
        .catch((error) => {
          logger.error(`Error initializing data file`, { modelClass, error });
          reject(error);
        });
    });
  }

  async function initFileIfNotExists(modelClass, initData = {}) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(pathName(modelClass))) {
        logger.log(`Data file not found, creating empty file...`, { modelClass });
        writeToFile(modelClass, initData)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }

  async function initSchemasFile(schemas, schemasData) {
    return new Promise((resolve, reject) => {
      writeToFile(schemas, schemasData)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async function readFromFile(modelClass) {
    return fs.promises.readFile(pathName(modelClass), 'utf8');
  }

  async function writeToFile(modelClass, data) {
    writeToFileQueue[modelClass].push(data);
    executeWriteToFileQueue(modelClass);
  }

  async function executeWriteToFileQueue(modelClass) {
    if (writeToFileQueue[modelClass].length === 0) { return; }

    const data = writeToFileQueue[modelClass].shift();

    try {
      logger.log(`Executing write to file...`, { modelClass });
      fs.writeFileSync(pathName(modelClass), JSON.stringify(data));
      logger.log(`Data written to file`, { modelClass });
      executeWriteToFileQueue(modelClass);
    } catch (error) {
      logger.error(`Error writing to file`, { modelClass, error });
    }
  }

  return {
    initData,
    loadSchemas,
    loadData,
    read: readFromFile,
    write: writeToFile,
  };
};