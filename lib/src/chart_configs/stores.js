const modelClass = 'chart_configs';

module.exports = ({ dataAccess, logger, utils }) => {
  function list(filters = {}) {
    return dataAccess.list(modelClass, filters);
  }

  function view(id, params) {
    return dataAccess.view(modelClass, id, params);
  }

  function create(params) {
    return dataAccess.create(modelClass, params);
  }

  function update(id, params) {
    return dataAccess.update(modelClass, id, params);
  }

  function remove(id) {
    return dataAccess.remove(modelClass, id);
  }

  function formatDataFilters({ dataSource, startDate, endDate, includeTags }) {
    const dataFilters = {};

    if (dataSource === 'transactions') {
      dataFilters.transactionDate = {
        startDate,
        endDate,
      };
    } else if (dataSource === 'work_logs') {
      dataFilters.startTime = {
        startTime: startDate,
      };
      dataFilters.endTime = {
        endTime: endDate,
      };
    }

    if (includeTags.length > 0) {
      dataFilters.tags = includeTags;
    }

    return dataFilters;
  }

  function formatSortFilters({ dataSource, groupBy }) {
    const sort = { order: 'asc' };

    if (groupBy === 'category') {
      sort.field = 'tags';
    } else {
      if (dataSource === 'transactions') {
        sort.field = 'transactionDate';
      } else {
        sort.field = 'startTime';
      }
    }

    return sort;
  }

  function groupChartData({ dataSource, data, groupBy, includeTags }) {
    if (dataSource === 'transactions') {
      return groupDataBy({ data, groupBy, includeTags, dateField: 'transactionDate' });
    } else if (dataSource === 'work_logs') {
      return groupDataBy({ data, groupBy, includeTags, dateField: 'startTime' });
    } else {
      return {};
    }
  }

  function groupDataBy({ data, groupBy, includeTags, dateField }) {
    if (groupBy === 'category') {
      return data.reduce((grouping, record) => {
        const tags = record.tags.filter((tag) => {
          return includeTags.includes(tag);
        }).map((tag) => {
          return record.includes.tags[tag];
        });
        tags.forEach((tag) => {
          const groupValue = tag.description;
          if (utils.isEmpty(grouping[groupValue])) {
            grouping[groupValue] = [];
          }
          grouping[groupValue].push(record);
        });
        return grouping;
      }, {});
    } else {
      return data.reduce((grouping, record) => {
        if (utils.notEmpty(record[dateField])) {
          const date = new Date(record[dateField]);
          let groupKey = null;

          if (groupBy === 'day') {
            groupKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          } else if (groupBy === 'month') {
            groupKey = `${date.getFullYear()}-${date.getMonth()}`;
          } else {
            groupKey = date.getFullYear();
          }

          if (utils.isEmpty(grouping[groupKey])) {
            grouping[groupKey] = [];
          }
          grouping[groupKey].push(record);
        }
        return grouping;
      }, {});
    }
  }

  function calculateWorkLogDuration({ record, scaleUnit }) {
    const { startTime, endTime } = record;
    const duration = (new Date(endTime)) - (new Date(startTime));
    if (scaleUnit === 'hour') {
      return Math.round(duration / 1000 / 60 / 60, 2);
    } else if (scaleUnit === 'minute') {
      return Math.round(duration / 1000 / 60, 2);
    } else {
      return Math.round(duration / 1000, 2);
    }
  }

  function sumChartData({ dataSource, groupedData, scaleUnit }) {
    if (dataSource === 'transactions') {
      return Object.entries(groupedData).map(([key, val]) => {
        return {
          key,
          total: val.reduce((sum, record) => {
            const multiplier = record.type === 'income' || record.type === 'expenseReversal' ? 1 : -1;
            return sum + record.amount * multiplier;
          }, 0),
        };
      });
    } else if (dataSource === 'work_logs') {
      return Object.entries(groupedData).map(([key, val]) => {
        return {
          key,
          total: val.reduce((sum, record) => {
            const duration = calculateWorkLogDuration({ record, scaleUnit });
            return sum + duration;
          }, 0),
        };
      });
    } else {
      return [];
    }
  }

  function chartData(id) {
    const chartResult = dataAccess.view('chart_configs', id, {});

    if (!chartResult) {
      return chartResult;
    }

    const { dataSource, scaleUnit, groupBy, startDate, endDate, includeTags } = chartResult.record;

    const dataFilters = formatDataFilters({ dataSource, startDate, endDate, includeTags });
    const sortFilters = formatSortFilters({ dataSource, groupBy });
    const dataResult = dataAccess.list(dataSource, { sort: sortFilters, filters: dataFilters, include: ['tags'] });

    if (dataResult.total === 0) {
      return {
        success: true,
        record: [],
      };
    }

    const data = dataResult.data;
    const groupedData = groupChartData({ dataSource, data, groupBy, includeTags });
    const summedData = sumChartData({ dataSource, groupedData, scaleUnit });
    return {
      success: true,
      record: summedData,
    };
  }

  return {
    modelClass,
    list,
    view,
    create,
    update,
    remove,
    chartData,
  };
};
