'use strict'

module.exports = (config, logger, utils) => {
  const path = require('path')
  const fs = require('fs');
  const fsPromises = require('fs').promises;

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
      readFromFile(schemas)
        .then((result) => {
          resolve(JSON.parse(result));
        })
        .catch((error) => {
          logger.error(`Error schema file`, { schemas, error });
          reject(error);
        });
    });
  }

  async function loadIndexes(indexes) {
    return new Promise((resolve, reject) => {
      readFromFile(indexes)
        .then((result) => {
          resolve({ indexes: JSON.parse(result) });
        })
        .catch((error) => {
          logger.error(`Error index file`, { indexes, error });
          reject(error);
        });
    });
  }

  async function loadData(modelClass) {
    return new Promise((resolve, reject) => {
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
    });
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
