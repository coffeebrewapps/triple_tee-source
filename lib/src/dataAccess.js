module.exports = ({ persistence, validator, downloader, config, logger, utils }) => {
  const schemas = config.schemas;
  const indexes = config.indexes;

  let init = false;
  let schemaCache = {};
  let dataCache = {};
  let indexCache = {};
  let indexTypes = [];

  async function initData(force = false) {
    logger.log(`Init data start`);
    if (!init || force) {
      await persistence.initData(schemas, indexes)
        .then((result) => {
          schemaCache = result.schemas;
          indexCache = result.indexes;
          indexTypes = Object.keys(indexCache);
          logger.log(`Init schema complete`, { schemaCache, indexCache });
          result.data.forEach((dataResult) => {
            dataCache[dataResult.modelClass] = dataResult.data;
            logger.log(`Init data model complete`, { modelCache: dataCache[dataResult.modelClass] });
          });
          init = true;
          logger.log(`Init data complete`);
        })
        .catch((error) => {
          logger.error(`Error initializing data`, { error });
        });
    }
  }

  function writeData(modelClass, data) {
    persistence.write(modelClass, data);
  }

  function cacheRecord(modelClass, record) {
    const cacheableData = dataCache[modelClass];
    cacheableData[record.id] = record;

    const writable = Object.assign(record);
    delete writable.includes;
    const writableData = Object.assign({}, dataCache[modelClass]);
    writableData[record.id] = writable;

    writeData(modelClass, writable);
  }

  function listSchemas() {
    return Object.keys(schemaCache);
  }

  function viewSchemas(modelClass) {
    return schemaCache[modelClass];
  }

  function list(modelClass, filters = {}) {
    const schema = schemaCache[modelClass];
    const modelData = dataCache[modelClass] || {};
    const data = Object.values(modelData);
    const paramsFilters = filters.filters || {};
    const sortFilters = filters.sort || {};

    let filteredData = [];

    if (Object.keys(paramsFilters).length > 0) {
      filteredData = filterData(modelClass, paramsFilters);
    } else {
      filteredData = data;
    }

    if (sortFilters.field) {
      const fieldType = schema.fields[sortFilters.field].type;
      sortData(filteredData, Object.assign({}, sortFilters, { fieldType }));
    }

    const total = filteredData.length;
    const include = filters.include || [];

    filteredData = paginateData(filteredData, filters);

    filteredData = filteredData.map((record) => {
      const combined = Object.assign({}, record, { includes: fetchIncludes(modelClass, record, include) });
      return combined;
    });

    return {
      total,
      data: filteredData,
    };
  }

  function view(modelClass, id, params = {}) {
    const data = dataCache[modelClass] || {};
    const record = data[id];

    if (utils.isEmpty(record)) {
      return {
        success: false,
        errors: {
          id: ['notFound'],
        },
      };
    }

    const include = params.include || [];
    const foreignRecords = fetchIncludes(modelClass, record, include);

    return {
      success: true,
      record: Object.assign({}, record, { includes: foreignRecords }),
    };
  }

  function defaultValuesForCreate(modelClass) {
    const fields = schemaCache[modelClass].fields;

    return Object.entries(fields).reduce((o, [field, schema]) => {
      if (utils.notEmpty(schema.default)) {
        o[field] = schema.default;
      } else {
        o[field] = null;
      }
      return o;
    }, {});
  }

  // TODO: check exists
  function create(modelClass, params) {
    const result = validator.validate(modelClass, params, schemaCache, indexCache, dataCache);

    if (result.valid) {
      const data = dataCache[modelClass];
      const lastId = parseInt(Array.from(Object.keys(data)).reverse()[0] || 0);
      const newId = (lastId + 1).toString();
      const now = new Date();
      const defaultValues = defaultValuesForCreate(modelClass);
      const newRow = Object.assign({}, defaultValues, params, { id: newId, createdAt: now, updatedAt: now });
      cacheRecord(modelClass, newRow);
      cacheIndexes(modelClass, newRow);
      writeData(indexes, indexCache);

      return {
        success: true,
        record: newRow,
      };
    } else {
      return {
        success: false,
        errors: result.errors,
      };
    }
  }

  // TODO: check exists
  function createIfNotExists(modelClass, params) {
    return create(modelClass, params);
  }

  function update(modelClass, id, params) {
    const existing = view(modelClass, id);
    if (!existing.record) {
      return {
        success: false,
        errors: {
          id: ['notFound'],
        },
      };
    }

    const result = validator.validate(
      modelClass,
      Object.assign({}, existing.record, params),
      schemaCache, indexCache, dataCache
    );

    if (result.valid) {
      const now = new Date();
      const updated = Object.assign({}, existing.record, params, { updatedAt: now });

      const indexesToRemove = Object.entries(existing.record).reduce((o, [field, value]) => {
        if (utils.isEmpty(value)) { return o; }

        const existingValues = utils.wrapArray(value);
        const newValues = utils.wrapArray(updated[field]);

        o[field] = existingValues.filter(ev => !newValues.includes(ev));
        return o;
      }, {});
      indexesToRemove.id = id;

      cacheRecord(modelClass, updated);
      cacheIndexes(modelClass, updated);
      removeIndexes(modelClass, indexesToRemove);
      writeData(indexes, indexCache);

      return {
        success: true,
        record: updated,
      };
    } else {
      return {
        success: false,
        errors: result.errors,
      };
    }
  }

  function remove(modelClass, id) {
    const data = dataCache[modelClass];
    const existing = view(modelClass, id);

    if (!existing.success) {
      return existing;
    }

    const record = existing.record;
    const used = validator.isUsed(modelClass, record, schemaCache, indexCache, dataCache);

    if (!used) {
      delete data[id];
      writeData(modelClass, data);
      removeIndexes(modelClass, record);
      writeData(indexes, indexCache);

      return {
        success: true,
        record,
      };
    } else {
      return {
        success: false,
        errors: {
          id: ['isUsed'],
        },
      };
    }
  }

  function isUsed(modelClass, id) {
    const existing = view(modelClass, id);
    const record = existing.record;
    if (!record) { return false; }

    return validator.isUsed(modelClass, record, schemaCache, indexCache, dataCache);
  }

  function download(modelClass) {
    const data = dataCache[modelClass];
    return { data };
  }

  function upload(modelClass, data) {
    dataCache[modelClass] = data;
    writeData(modelClass, data);
    return { data };
  }

  function downloadIndexes() {
    const data = indexCache;
    return { data };
  }

  function uploadIndexes(data) {
    indexCache = data;
    writeData(indexes, indexCache);
    return { data };
  }

  function atomic(steps) {
    const pastResults = [];
    const success = steps.every((step) => {
      const result = step.invoke(step.params, pastResults);
      if (!result.success) {
        pastResults.forEach((pastResult) => {
          pastResult.step.rollback(pastResult.result);
        });
        pastResults.unshift({ step, result });
        return false;
      }
      pastResults.unshift({ step, result });
      return true;
    });
    return {
      success,
      results: pastResults,
    };
  }

  function downloadRawFile(mimeType, filePath) {
    const rawFileDataUri = downloader.downloadRawFile(mimeType, filePath);
    return rawFileDataUri;
  }

  function paginateData(data, filters) {
    let filteredData = Array.from(data);
    if (utils.notEmpty(filters.offset) && utils.notEmpty(filters.limit) && filteredData.length > 0) {
      const offset = parseInt(filters.offset);
      const limit = parseInt(filters.limit);

      filteredData = filteredData.slice(offset, offset + limit);
    }
    return filteredData;
  }

  function filterData(modelClass, filters) {
    const modelData = dataCache[modelClass] || {};
    const filterIndexes = indexCache.filter[modelClass] || {};
    const filterSchemas = (schemaCache[modelClass].indexes || {}).filter || {};

    const filteredIds = [...filterFromIndexes(modelClass, modelData, filterIndexes, filterSchemas, filters)];
    return filteredIds.map(i => modelData[i]);
  }

  // {"field":"tags","indexedValue":"3","ids":["2"],"filterValue":["10"]}
  function filterValueMatch(filterSchemas, field, indexedValue, filterValue) {
    const filterOptions = filterSchemas[field] || {};

    const partialMatch = filterOptions.match && indexedValue.match(filterValue);
    const multiMatch = Array.isArray(filterValue) && filterValue.some(fv => fv === indexedValue);
    const exactMatch = !filterOptions.match && indexedValue === filterValue;
    const dateRangeMatch = (
      Object.hasOwn(filterValue, 'startDate') ||
      Object.hasOwn(filterValue, 'endDate') ||
      Object.hasOwn(filterValue, 'startTime') ||
      Object.hasOwn(filterValue, 'endTime')
    ) && rangeMatch(filterValue.startDate, filterValue.endDate, indexedValue);

    return partialMatch || multiMatch || exactMatch || dateRangeMatch;
  }

  function rangeMatch(rangeStart, rangeEnd, compareValue) {
    return (utils.isEmpty(rangeStart) || compareValue >= rangeStart) &&
      (utils.isEmpty(rangeEnd) || compareValue <= rangeEnd);
  }

  function filterFromIndexes(modelClass, modelData, indexes, filterSchemas, filters) {
    return Object.entries(filters).reduce((filteredIds, [field, filterValue]) => {
      if (utils.notEmpty(indexes[field])) {
        const indexedIds = Object.entries(indexes[field]).reduce((arr, [indexedValue, ids]) => {
          if (filterValueMatch(filterSchemas, field, indexedValue, filterValue)) {
            arr = arr.concat(ids);
          }
          return arr;
        }, []);

        if (indexedIds.length > 0) {
          logger.log(`Index hit`, { field, filterValue });
          indexedIds.forEach(i => filteredIds.add(i));
        } else {
          logger.log(`Index miss`, { field, filterValue });
          const idsFromData = filterIdsFromData(modelClass, modelData, filterSchemas, field, filterValue);
          idsFromData.forEach(i => filteredIds.add(i));
        }
      } else {
        logger.log(`Index miss`, { field, filterValue });
        const idsFromData = filterIdsFromData(modelClass, modelData, filterSchemas, field, filterValue);
        idsFromData.forEach(i => filteredIds.add(i));
      }
      return filteredIds;
    }, (new Set()));
  }

  function filterIdsFromData(modelClass, modelData, schemas, field, filterValue) {
    return Object.entries(modelData).reduce((arr, [id, record]) => {
      const recordValue = record[field];
      if (utils.notEmpty(recordValue) && filterValueMatch(schemas, field, recordValue, filterValue)) {
        arr.push(id);
      }
      return arr;
    }, []);
  }

  function fetchIncludes(modelClass, record, include) {
    const schema = schemaCache[modelClass];
    const foreignConstraints = schema.constraints.foreign;

    return include.reduce((records, foreignKey) => {
      const referenceValue = [record[foreignKey]].flat().filter(v => !!v);

      const constraint = foreignConstraints[foreignKey] || {};
      const foreignClass = constraint.reference;
      const foreignKeyType = schema.fields[foreignKey].type;

      records[foreignKey] = referenceValue.reduce((references, value) => {
        if (utils.notEmpty(dataCache[foreignClass])) {
          const foreignValue = dataCache[foreignClass][value];

          if (foreignKeyType === 'file' && utils.notEmpty(foreignValue)) {
            const rawFileDataUri = downloader.downloadRawFile(foreignValue.mimeType, foreignValue.filePath);
            references[value] = Object.assign({}, foreignValue, { rawData: rawFileDataUri });
          } else {
            references[value] = foreignValue;
          }
        } else {
          references[value] = null;
        }

        return references;
      }, {});

      return records;
    }, {});
  }

  function sortData(data, params) {
    const sortField = params.field;
    const sortFieldType = params.fieldType;
    const sortOrder = params.order === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      let aParsed = a[sortField];
      let bParsed = b[sortField];

      if (sortFieldType === 'date' || sortFieldType === 'datetime') {
        if (utils.notEmpty(aParsed)) { aParsed = new Date(aParsed); }
        if (utils.notEmpty(bParsed)) { bParsed = new Date(bParsed); }
      } else if (sortFieldType === 'number') {
        if (utils.notEmpty(aParsed)) { aParsed = parseFloat(aParsed); }
        if (utils.notEmpty(bParsed)) { bParsed = parseFloat(bParsed); }
      }

      if (aParsed < bParsed) {
        return sortOrder * -1;
      } else if (aParsed > bParsed) {
        return sortOrder * 1;
      } else {
        return 0;
      }
    });
  }

  function cacheIndexes(modelClass, record) {
    indexTypes.forEach((indexType) => {
      if (indexType === 'unique') {
        cacheUniqueIndexes(modelClass, record);
      } else if (indexType === 'foreign') {
        cacheForeignIndexes(modelClass, record);
      } else if (indexType === 'filter') {
        cacheFilterIndexes(modelClass, record);
      }
    });
  }

  // indexCache.unique = {"tags":{"category|name":{"activity|implementation":"1"}}}
  function cacheUniqueIndexes(modelClass, record) {
    const uniqueIndexes = indexCache.unique;
    if (!uniqueIndexes[modelClass]) {
      uniqueIndexes[modelClass] = {};
    }

    const uniqueConstraints = schemaCache[modelClass].constraints.unique || [];
    const newIndexes = uniqueConstraints.reduce((o, key) => {
      const existingIndexes = uniqueIndexes[modelClass][key] || {};
      const keys = key.split('|');
      const values = keys.map(k => record[k]).join('|');
      existingIndexes[values] = record.id;
      o[key] = existingIndexes;
      return o;
    }, {});

    uniqueIndexes[modelClass] = newIndexes;
  }

  // indexCache.foreign = {"tags":{"1":{"work_logs":["1"]}}}
  function cacheForeignIndexes(modelClass, record) {
    const foreignIndexes = indexCache.foreign;
    const foreignConstraints = schemaCache[modelClass].constraints.foreign || {};

    Object.keys(foreignConstraints).forEach((key) => {
      const foreignModelClass = foreignConstraints[key].reference;
      const existingIndexes = foreignIndexes[foreignModelClass] || {};
      let foreignValues = record[key];

      if (utils.isEmpty(foreignValues)) { return; }

      if (!Array.isArray(foreignValues)) {
        foreignValues = [foreignValues];
      }

      foreignValues.forEach((foreignValue) => {
        const foreignValueAssocs = existingIndexes[foreignValue] || {};

        if (!foreignValueAssocs[modelClass]) {
          foreignValueAssocs[modelClass] = [];
        }

        const existing = foreignValueAssocs[modelClass].indexOf(record.id);

        if (existing > -1) { return; }

        foreignValueAssocs[modelClass].push(record.id);
        existingIndexes[foreignValue] = foreignValueAssocs;
        indexCache.foreign[foreignModelClass] = existingIndexes;
      });
    });
  }

  // indexCache.filter = {"tags":{"category":{"activity":["1","2","3","4"]}}}
  function cacheFilterIndexes(modelClass, record) {
    const filterIndexes = indexCache.filter;
    if (!filterIndexes[modelClass]) {
      filterIndexes[modelClass] = {};
    }

    if (utils.isEmpty(schemaCache[modelClass].indexes)) { return; }

    const modelFilters = schemaCache[modelClass].indexes.filter || {};
    Object.entries(modelFilters).forEach(([field, options]) => {
      const fieldIndexes = filterIndexes[modelClass][field] || {};
      let fieldValues = record[field];

      if (utils.isEmpty(fieldValues)) { return; }

      if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues];
      }

      fieldValues.forEach((fieldValue) => {
        const existingIds = fieldIndexes[fieldValue] || [];

        const found = existingIds.indexOf(record.id);

        if (found > -1) { return; }

        existingIds.push(record.id);
        fieldIndexes[fieldValue] = existingIds;
        filterIndexes[modelClass][field] = fieldIndexes;
      });
    });
  }

  function removeIndexes(modelClass, record) {
    indexTypes.forEach((indexType) => {
      if (indexType === 'unique') {
        removeUniqueIndexes(modelClass, record);
      } else if (indexType === 'foreign') {
        removeForeignIndexes(modelClass, record);
      } else if (indexType === 'filter') {
        removeFilterIndexes(modelClass, record);
      }
    });
    cleanupIndexes(modelClass, record);
  }

  function removeUniqueIndexes(modelClass, record) {
    const uniqueIndexes = indexCache.unique;
    if (!uniqueIndexes[modelClass]) {
      return;
    }

    const uniqueConstraints = schemaCache[modelClass].constraints.unique || [];
    uniqueConstraints.forEach((key) => {
      const existingIndexes = uniqueIndexes[modelClass][key];
      if (existingIndexes) {
        const updatedIndexes = Object.keys(existingIndexes).reduce((o, index) => {
          const id = existingIndexes[index];
          if (id !== record.id) {
            o[index] = id;
          }
          return o;
        }, {});
        uniqueIndexes[modelClass][key] = updatedIndexes;
      }
    });
  }

  function removeForeignIndexes(modelClass, record) {
    const foreignIndexes = indexCache.foreign;
    const foreignConstraints = schemaCache[modelClass].constraints.foreign;

    if (utils.isEmpty(foreignConstraints)) { return; }

    Object.keys(foreignConstraints).forEach((key) => {
      const foreignModelClass = foreignConstraints[key].reference;
      const existingIndexes = foreignIndexes[foreignModelClass];

      if (utils.isEmpty(existingIndexes)) { return; }

      let foreignValues = record[key];

      if (utils.isEmpty(foreignValues)) { return; }

      if (!Array.isArray(foreignValues)) {
        foreignValues = [foreignValues];
      }

      foreignValues.forEach((foreignValue) => {
        const foreignValueAssocs = existingIndexes[foreignValue];
        const modelForeignAssocs = foreignValueAssocs[modelClass];

        if (utils.isEmpty(modelForeignAssocs)) { return; }

        const foundAssocIndex = modelForeignAssocs.indexOf(record.id);

        if (foundAssocIndex < 0) { return; }

        modelForeignAssocs.splice(foundAssocIndex, 1);
        foreignValueAssocs[modelClass] = modelForeignAssocs;
        existingIndexes[foreignValue] = foreignValueAssocs;
        indexCache.foreign[foreignModelClass] = existingIndexes;
      });
    });
  }

  // {"work_logs":{"tags":{"3":["2"],"4":["3"],"10":["1","2","3"]}}}
  function removeFilterIndexes(modelClass, record) {
    const filterIndexes = indexCache.filter;

    if (utils.isEmpty(filterIndexes[modelClass])) { return; }

    if (utils.isEmpty(schemaCache[modelClass].indexes)) { return; }

    const modelFilters = schemaCache[modelClass].indexes.filter || {};

    Object.keys(modelFilters).forEach((field) => {
      const fieldIndexes = filterIndexes[modelClass][field];

      if (utils.isEmpty(fieldIndexes)) { return; }

      let fieldValues = record[field];

      if (!Array.isArray(fieldValues)) {
        fieldValues = [fieldValues];
      }

      fieldValues.forEach((fieldValue) => {
        const existingIds = fieldIndexes[fieldValue];

        if (utils.isEmpty(existingIds)) { return; }

        const foundIndex = existingIds.indexOf(record.id);

        if (foundIndex < 0) { return; }

        existingIds.splice(foundIndex, 1);
        fieldIndexes[fieldValue] = existingIds;
        filterIndexes[modelClass][field] = fieldIndexes;
      });
    });
  }

  function cleanupIndexes(modelClass, record) {
    const foreignIndexes = indexCache.foreign;
    if (utils.isEmpty(foreignIndexes[modelClass])) { return; }

    delete foreignIndexes[modelClass][record.id];

    const filterIndexes = indexCache.filter;
    Object.entries(filterIndexes).forEach(([indexModel, indexedData]) => {
      if (indexModel === modelClass) { return; }

      Object.entries(indexedData).forEach(([key, modelClassData]) => {
        const foreignConstraints = schemaCache[indexModel].constraints.foreign[key];

        if (utils.isEmpty(foreignConstraints)) { return; }

        const reference = foreignConstraints.reference;

        if (reference !== modelClass) { return; }

        const foreignPrimaryKey = foreignConstraints.primary;
        delete modelClassData[record[foreignPrimaryKey]];
      });
    });
  }

  return {
    initData,
    listSchemas,
    viewSchemas,
    list,
    view,
    create,
    createIfNotExists,
    update,
    remove,
    isUsed,
    download,
    upload,
    downloadIndexes,
    uploadIndexes,
    atomic,
    downloadRawFile,
  };
};
