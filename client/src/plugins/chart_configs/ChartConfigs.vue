<script setup>
import { useValidations } from '@/utils/validations';
import { useFormatter } from '@/utils/formatter';
import { useSystemConfigsStore } from '@/stores/systemConfigs';
import DataPage from '@/components/DataPage.vue';

const { isEmpty, notEarlierThan, greaterThan } = useValidations();
const {
  formatTagSync,
  tagStyle,
} = useFormatter();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

const fieldsLayout = [
  { description: 'md', displayOrder: 'md' },
  { chartType: 'md', dataSource: 'md' },
  { scaleUnit: 'md', scaleValue: 'md', groupBy: 'md' },
  { includeTags: 'md', excludeTags: 'md' },
  { startDate: 'md', endDate: 'md' },
];

function recordValue(record) {
  return record.id;
}

function tagLabel(record) {
  return `${record.category}:${record.name}`;
}

const dataFields = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
    listable: true,
    viewable: false,
    creatable: false,
    updatable: false,
    sortable: true,
  },
  {
    key: 'description',
    type: 'text',
    label: 'Description',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'displayOrder',
    type: 'number',
    label: 'Display Order',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: false,
    sortable: true,
  },
  {
    key: 'chartType',
    type: 'enum',
    label: 'Chart Type',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: false,
    sortable: false,
  },
  {
    key: 'dataSource',
    type: 'enum',
    label: 'Data Source',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: false,
  },
  {
    key: 'scaleUnit',
    type: 'enum',
    label: 'Scale Unit',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: false,
    sortable: false,
  },
  {
    key: 'scaleValue',
    type: 'number',
    label: 'Scale Value',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: false,
    sortable: false,
  },
  {
    key: 'groupBy',
    type: 'enum',
    label: 'Group By',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: false,
    sortable: false,
  },
  {
    key: 'includeTags',
    type: 'multiSelect',
    label: 'Include Tags',
    isTags: true,
    reference: { label: tagLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: recordValue,
      label: tagLabel,
    },
  },
  {
    key: 'excludeTags',
    type: 'multiSelect',
    label: 'Exclude Tags',
    isTags: true,
    reference: { label: tagLabel },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: recordValue,
      label: tagLabel,
    },
  },
  {
    key: 'startDate',
    type: 'date',
    label: 'Start Date',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'endDate',
    type: 'date',
    label: 'End Date',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'displayOrder',
    type: 'number',
    label: 'Display Order',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: false,
    sortable: false,
  },
  {
    key: 'active',
    type: 'boolean',
    label: 'Active',
    listable: true,
    viewable: true,
    creatable: false,
    updatable: true,
    filterable: true,
    sortable: false,
  },
];

function validateEndDate(record) {
  return notEarlierThan(record, 'endDate', 'startDate');
}

function validateScaleValue(record) {
  return greaterThan(record, 'scaleValue', 0);
}

function validateScaleUnit(record) {
  if (isEmpty(record.scaleUnit)) { return; }

  const validValues = {
    transactions: ['dollar'],
    work_logs: ['hour', 'minute', 'second'],
  };

  const sourceValidValues = validValues[record.dataSource];
  if (isEmpty(sourceValidValues)) { return; }

  if (sourceValidValues.includes(record.scaleUnit)) { return; }

  return {
    name: 'invalidEnum',
    params: {
      validValues: sourceValidValues,
    },
  };
}

const validations = {
  create: {
    scaleValue: [
      validateScaleValue,
    ],
    scaleUnit: [
      validateScaleUnit,
    ],
    endDate: [
      validateEndDate,
    ],
  },
  update: {
    scaleValue: [
      validateScaleValue,
    ],
    endDate: [
      validateEndDate,
    ],
  },
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

const chartTypeIcons = {
  hbar: 'fa-solid fa-chart-bar fa-lg',
  vbar: 'fa-solid fa-chart-column fa-lg',
};
</script>

<template>
  <DataPage
    model-class="chart_configs"
    data-type="Chart Configs"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :table-style="tableStyle"
  >
    <template #[`highlight.description`]="{ row, formattedValue }">
      <div class="highlight">
        <i :class="chartTypeIcons[row.chartType]" />

        {{ formattedValue }}

        <span
          v-if="row.active"
          class="tag inline"
        >active</span>

        <span
          v-if="!row.active"
          class="tag inline"
        >inactive</span>
      </div>
    </template>

    <template #[`data-col.dataSource`]="{ formattedValue }">
      Chart Data from <strong>{{ formattedValue }}</strong>
    </template>

    <template #[`data-col.groupBy`]="{ formattedValue }">
      Group by <strong>{{ formattedValue }}</strong>
    </template>

    <template #[`data-col.startDate`]="{ row, formattedValue, inputValue }">
      Date Range <strong>{{ formattedValue }}</strong>
      <span v-if="row.endDate"> - <strong>{{ inputValue('endDate', row) }}</strong></span>
      <span v-if="!row.endDate"> - <strong>present</strong></span>
    </template>

    <template #[`data-col.includeTags`]="{ row, key, rawValue }">
      Include Data from
      <span
        v-for="(tag, t) in rawValue"
        :key="t"
        class="tag inline"
        :style="tagStyle(row, tag, key)"
      >
        {{ formatTagSync(row, tag, key, systemConfigs.tagFormat) }}
      </span>
    </template>
  </DataPage>
</template>

<style scoped>
.highlight {
  display: flex;
  gap: 6px;
  align-items: center;
  font-weight: 900;
}
</style>
