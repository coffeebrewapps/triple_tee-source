'use strict'

const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

function pathName(modelClass) {
  return path.join(__dirname, '../../data', `${modelClass}.json`);
}

function readFromFile(modelClass) {
  return fs.promises.readFile(pathName(modelClass), 'utf8');
}

function writeToFile(modelClass, data) {
  try {
    fs.promises.writeFile(pathName(modelClass), JSON.stringify(data));
  } catch (error) {
    console.log(`Error writing to file ${modelClass}: ${JSON.stringify(error)}`);
  }
}

module.exports = {
  readFromFile,
  writeToFile
}
