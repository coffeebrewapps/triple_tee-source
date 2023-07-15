<script setup>
import { ref, computed, onMounted } from 'vue';
import { useDataAccess } from '@/utils/dataAccess';
import { useLogger } from '@/utils/logger';

import {
  TBar,
  THorizontalBar
} from 'coffeebrew-vue-components';

const dataAccess = useDataAccess();
const logger = useLogger();

const chartData = ref([]);

const highlightColor = computed(() => {
  return window.getComputedStyle(document.documentElement).getPropertyValue('--color-text');
});

const lineColor = computed(() => {
  return window.getComputedStyle(document.documentElement).getPropertyValue('--color-border');
});

const chartColors = computed(() => {
  return {
    highlightColor: highlightColor.value,
    lineColor: lineColor.value,
  };
});

function titleize(val) {
  return `${val[0].toUpperCase()}${val.slice(1)}`;
}

async function loadChartConfigs() {
  await dataAccess
    .list('chart_configs', {})
    .then((result) => {
      const sortedByDisplayOrder = result.data.sort((a, b) => {
        if (a.displayOrder < b.displayOrder) {
          return -1;
        } else if (a.displayOrder > b.displayOrder) {
          return 1;
        } else {
          return 0;
        }
      });

      const promises = sortedByDisplayOrder.map((config) => {
        return new Promise((resolve, reject) => {
          dataAccess
            .view('chart_configs', config.id, {}, { path: 'data' })
            .then((chartResult) => {
              resolve({ config, result: chartResult });
            })
            .catch((error) => {
              logger.error(`Error loading chart configs`, error);
              resolve({ config: {}, result: [] });
            });
        });
      });

      Promise.all(promises)
        .then((results) => {
          chartData.value = [];
          results.forEach(({ config, result }) => {
            if (result.length === 0) { return; }

            const chartConfig = {
              title: config.description,
              colors: chartColors.value,
            };

            const data = [];

            if (config.chartType === 'vbar') {
              chartConfig.yScale = config.scaleValue;
              chartConfig.yAxisLabel = titleize(config.scaleUnit);
              chartConfig.xAxisLabel = titleize(config.groupBy);

              result.forEach((record) => {
                data.push({
                  xValue: record.key,
                  yValue: record.total,
                });
              });
            } else {
              chartConfig.xScale = config.scaleValue;
              chartConfig.xAxisLabel = titleize(config.scaleUnit);
              chartConfig.yAxisLabel = titleize(config.groupBy);

              result.forEach((record) => {
                data.push({
                  yValue: record.key,
                  xValue: record.total,
                });
              });
            }

            chartData.value.push({
              chartType: config.chartType,
              config: chartConfig,
              data,
            });
          });
        });
    })
    .catch((error) => {
      logger.error(`Error listing charts`, error);
    });
}

onMounted(async() => {
  await loadChartConfigs();
});
</script>

<template>
  <div class="page-container">
    <div
      v-if="chartData.length === 0"
    >
      No chart data.
    </div>

    <div
      v-if="chartData.length > 0"
      class="charts"
    >
      <div
        v-for="(chart, i) in chartData"
        :key="i"
        class="chart"
      >
        <TBar
          v-if="chart.chartType === 'vbar' && chart.data.length > 0"
          :config="chart.config"
          :data="chart.data"
        />

        <THorizontalBar
          v-if="chart.chartType === 'hbar' && chart.data.length > 0"
          :config="chart.config"
          :data="chart.data"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  margin: 1rem 0;
  width: 100%;
}

.charts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}
</style>
