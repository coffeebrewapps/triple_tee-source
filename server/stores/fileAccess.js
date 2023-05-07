'use strict'

const logger = require('../logger');
const path = require('path')
const mainDirname = path.dirname(require.main.filename)
const fs = require('fs');
const fsPromises = require('fs').promises;

function pathName(modelClass) {
  return path.join(mainDirname, './data', `${modelClass}.json`);
}

async function initData(schemas) {
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
  });
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

async function loadData(modelClass) {
  return new Promise((resolve, reject) => {
    readFromFile(modelClass)
      .then((result) => {
        resolve({ modelClass: modelClass, data: JSON.parse(result) });
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

module.exports = {
  initData,
  loadSchemas,
  loadData,
  readFromFile,
  writeToFile
}
