<script setup>
import { computed } from 'vue';
import { useValidations } from '@/utils/validations';
import DataPage from '@/components/DataPage.vue';

const { notEarlierThan, greaterThanOrEqual } = useValidations();

const props = defineProps({
  contactId: {
    type: String,
    default: null,
  },
});

const fieldsLayout = [
  { description: 'lg' },
  { effectiveStart: 'md', effectiveEnd: 'md' },
  { rateType: 'md', unitCost: 'md', unit: 'md' },
  { includeTags: 'lg', excludeTags: 'lg' },
  { contactId: 'lg' },
];

const dataFields = computed(() => {
  return [
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
      key: 'description',
      type: 'text',
      label: 'Description',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
    },
    {
      key: 'effectiveStart',
      type: 'datetime',
      label: 'Effective Start',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
      filterable: true,
      sortable: true,
    },
    {
      key: 'effectiveEnd',
      type: 'datetime',
      label: 'Effective End',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: true,
      filterable: true,
      sortable: true,
    },
    {
      key: 'rateType',
      type: 'enum',
      label: 'Rate Type',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'unit',
      type: 'enum',
      label: 'Unit',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'unitCost',
      type: 'number',
      label: 'Unit Cost',
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
    },
    {
      key: 'includeTags',
      type: 'multiSelect',
      label: 'Include Tags',
      isTags: true,
      reference: { label: tagLabel },
      listable: false,
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
      listable: false,
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
      key: 'contactId',
      type: 'singleSelect',
      label: 'Contact',
      reference: { label: contactLabel },
      defaultValue: () => { return props.contactId; },
      listable: true,
      viewable: true,
      creatable: true,
      updatable: false,
      filterable: true,
      options: {
        server: true,
        pagination: true,
        modelClass: 'contacts',
        value: recordValue,
        label: contactLabel,
      },
    },
  ];
});

const tableStyle = {
  oneline: true,
  showHeader: false,
  highlightField: 'description',
};

const validations = {
  create: {
    unitCost: [
      (record) => { return greaterThanOrEqual(record, 'unitCost', 0); },
    ],
    effectiveEnd: [
      validateEffectiveEnd,
    ],
  },
};

const filters = computed(() => {
  const initData = {};

  if (props.contactId) {
    initData.contactId = [{ value: props.contactId }];
  }

  initData.effectiveStart = {
    startTime: null,
    endTime: null,
  };

  initData.effectiveEnd = {
    startTime: null,
    endTime: null,
  };

  return {
    initData,
    layout: [
      { effectiveStart: 'md' },
      { effectiveEnd: 'md' },
      { includeTags: 'lg', excludeTags: 'lg' },
      { contactId: 'lg' },
    ],
  };
});

function validateEffectiveEnd(record) {
  return notEarlierThan(record, 'effectiveEnd', 'effectiveStart');
}

function recordValue(record) {
  return record.id;
}

function tagLabel(record) {
  return `${record.category}:${record.name}`;
}

function contactLabel(record) {
  return record.name;
}
</script>

<template>
  <DataPage
    model-class="billing_configs"
    data-type="Billing Configs"
    :fullscreen="true"
    :fields-layout="fieldsLayout"
    :data-fields="dataFields"
    :validations="validations"
    :filters="filters"
    :table-style="tableStyle"
  >
    <template #[`highlight.description`]="{ formattedValue }">
      {{ formattedValue }}
    </template>

    <template #[`data-col.unitCost`]="{ row, formattedValue, inputValue }">
      Charging
      <strong>{{ formattedValue }}</strong>
      per
      <strong>{{ inputValue('unit', row) }}</strong>
    </template>
  </DataPage>
</template>
