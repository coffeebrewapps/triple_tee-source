export function useStore({ dataStore, logger }) {
  function notEmpty(value) {
    return !isEmpty(value);
  }

  function isEmpty(value) {
    return Object.is(value, undefined) || Object.is(value, null);
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
        sort.field = 'transactionDate'
      } else {
        sort.field = 'startTime'
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
          if (isEmpty(grouping[groupValue])) {
            grouping[groupValue] = [];
          }
          grouping[groupValue].push(record);
        });
        return grouping;
      }, {});
    } else {
      return data.reduce((grouping, record) => {
        if (notEmpty(record[dateField])) {
          const date = new Date(record[dateField]);
          let groupKey = null;

          if (groupBy === 'day') {
            groupKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          } else if (groupBy === 'month') {
            groupKey = `${date.getFullYear()}-${date.getMonth()}`;
          } else {
            groupKey = date.getFullYear();
          }

          if (isEmpty(grouping[groupKey])) {
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

  function chartData(modelClass, id) {
    const chartResult = dataStore.view('chart_configs', id, {});

    if (!chartResult) {
      return chartResult;
    }

    const { dataSource, scaleUnit, groupBy, startDate, endDate, includeTags } = chartResult.record;

    const dataFilters = formatDataFilters({ dataSource, startDate, endDate, includeTags });
    const sortFilters = formatSortFilters({ dataSource, groupBy });
    const dataResult = dataStore.list(dataSource, { sort: sortFilters, filters: dataFilters, include: ['tags'] });

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
    chartData,
  };
}
