<script setup>
import DataPage from '@/components/DataPage.vue';

import { useFormatter } from '@/utils/formatter';
import { useSystemConfigsStore } from '@/stores/systemConfigs';

const {
  parseTagFormatSync,
} = useFormatter();
const systemConfigsStore = useSystemConfigsStore();
const systemConfigs = systemConfigsStore.getSystemConfigs();

const fieldsLayout = [
  { category: 'md', name: 'md' },
  { description: 'lg' },
  { textColor: 'md', backgroundColor: 'md' },
];

const dataFields = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
    listable: true,
    viewable: true,
    creatable: false,
    updatable: false,
    sortable: true,
  },
  {
    key: 'category',
    type: 'text',
    label: 'Category',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
    filterable: true,
    sortable: true,
  },
  {
    key: 'name',
    type: 'text',
    label: 'Name',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: false,
  },
  {
    key: 'description',
    type: 'text',
    label: 'Description',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'textColor',
    type: 'text',
    label: 'Text Color',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'backgroundColor',
    type: 'text',
    label: 'Background Color',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
];

const filters = {
  initData: {},
  layout: [
    { category: 'md' },
  ],
};

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

function formattedTag(row) {
  return parseTagFormatSync(systemConfigs.tagFormat, row);
}

function tagStyle(row) {
  return `color: ${row.textColor}; background-color: ${row.backgroundColor};`;
}
</script>

<template>
  <DataPage
    model-class="tags"
    data-type="Tags"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #[`data-col.category`]="{ row }">
      <span
        class="tag inline"
        :style="tagStyle(row)"
      >
        {{ formattedTag(row) }}
      </span>
    </template>
  </DataPage>
</template>
