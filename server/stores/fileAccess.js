'use strict'

module.exports = (config, logger, utils) => {
  const path = require('path')
  const fs = require('fs');
  const fsPromises = require('fs').promises;

  const schemasData = require('../../_init/schemas.json');

  function pathName(modelClass) {
    return path.join(config.dataDir, `${modelClass}.json`);
  }

  async function initData(schemas, indexes) {
    return new Promise((resolve, reject) => {
      Promise.all([loadSchemasAndData(schemas), loadIndexes(indexes)])
      .then((result) => {
        const allResults = result.reduce((o, r) => {
          return Object.assign({}, o, r)
        });
        resolve(allResults);
      })
      .catch((error) => {
        reject(error);
      })
    });
  }

  async function loadSchemasAndData(schemas) {
    return new Promise((resolve, reject) => {
      loadSchemas(schemas)
        .then((schemaResult) => {
          const promises = Object.keys(schemaResult).map((modelClass) => {
            return loadData(modelClass);
          });
          Promise
            .all(promises)
            .then((dataResults) => {
              resolve({ schemas: schemaResult, data: dataResults });
            })
            .catch((error) => {
              reject(error);
            })
        })
        .catch((error) => {
          reject(error);
        });
    })
  }

  async function loadSchemas(schemas) {
    return new Promise((resolve, reject) => {
      initFileIfNotExists(schemas, schemasData)
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
      initFileIfNotExists(modelClass)
        .then(() => {
          readFromFile(modelClass)
            .then((result) => {
              if (result) {
                resolve({ modelClass: modelClass, data: JSON.parse(result) });
              } else {
                resolve({ modelClass: modelClass, data: {} });
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
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      } else {
        resolve()
      }
    })
  }

  async function readFromFile(modelClass) {
    return fs.promises.readFile(pathName(modelClass), 'utf8');
  }

  async function writeToFile(modelClass, data) {
    try {
      fs.promises.writeFile(pathName(modelClass), JSON.stringify(data));
    } catch (error) {
      logger.error(`Error writing to file`, { modelClass, error });
    }
  }

  return {
    initData,
    loadSchemas,
    loadData,
    readFromFile,
    writeToFile
  }
}
