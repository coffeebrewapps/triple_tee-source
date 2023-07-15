import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useSystemConfigsStore } from '../../src/stores/systemConfigs.js';
import ViewPage from '../../src/components/ViewPage.vue';

let systemConfigsStore;

beforeEach(async() => {
  setActivePinia(createPinia());
  systemConfigsStore = useSystemConfigsStore();
  systemConfigsStore.updateSystemConfigs({
    tagFormat: '{{ category }}:{{ name }}',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const data = {
  id: '1',
  name: 'Your Company',
  accountNumber: null,
  country: 'SGP',
  tags: ['1'],
  includeTags: [],
  excludeTags: null,
  includes: {
    country: {
      1: {
        alpha3Code: 'SGP',
        countryName: 'Singapore',
      },
    },
    tags: {
      1: {
        id: '1',
        category: 'company',
        name: 'abc',
      },
    },
  },
};

const dataFields = [
  {
    key: 'id',
    type: 'text',
    label: 'ID',
  },
  {
    key: 'name',
    type: 'text',
    label: 'Name',
  },
  {
    key: 'accountNumber',
    type: 'text',
    label: 'Account Number',
  },
  {
    key: 'country',
    type: 'singleSelect',
    label: 'Country',
    reference: { label: (record) => record.countryName },
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
    options: {
      server: true,
      pagination: true,
      limit: 250,
      modelClass: 'countries',
      value: (record) => record.alpha3Code,
      label: (record) => record.countryName,
    },
  },
  {
    key: 'tags',
    type: 'multiSelect',
    label: 'Tags',
    reference: { label: (record) => `${record.category}:${record.name}` },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: (record) => record.id,
      label: (record) => `${record.category}:${record.name}`,
    },
  },
  {
    key: 'includeTags',
    type: 'multiSelect',
    label: 'Include Tags',
    reference: { label: (record) => `${record.category}:${record.name}` },
    isTags: true,
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: (record) => record.id,
      label: (record) => `${record.category}:${record.name}`,
    },
  },
  {
    key: 'excludeTags',
    type: 'multiSelect',
    label: 'Exclude Tags',
    reference: { label: (record) => `${record.category}:${record.name}` },
    isTags: true,
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    options: {
      server: true,
      pagination: true,
      modelClass: 'tags',
      value: (record) => record.id,
      label: (record) => `${record.category}:${record.name}`,
    },
  },
];

const fieldsLayout = [
  { id: 'sm', name: 'md' },
  { accountNumber: 'md' },
  { country: 'lg' },
  { tags: 'lg' },
  { includeTags: 'md', excludeTags: 'md' },
];

describe('ViewPage.vue', () => {
  test('should render view in dialog', async() => {
    const wrapper = await mount(ViewPage, {
      props: {
        heading: 'View Contact',
        fieldsLayout,
        dataFields,
        data,
      },
    });

    await flushPromises();

    const viewContainer = wrapper.get('.view-container');
    expect(viewContainer.exists()).toBeTruthy();

    const heading = viewContainer.get('.heading');
    expect(heading.exists()).toBeTruthy();
    expect(heading.text()).toBe('View Contact');

    const detailsContainer = viewContainer.get('.details-container');
    expect(detailsContainer.exists()).toBeTruthy();

    const dataRows = detailsContainer.findAll('.data-row');
    expect(dataRows.length).toBe(5);

    const row1DataFields = dataRows[0].findAll('.data-field');
    expect(row1DataFields.length).toBe(2);

    const idField = row1DataFields[0];
    expect(idField.exists()).toBeTruthy();
    const idFieldLabel = idField.get('.field-label');
    expect(idFieldLabel.text()).toBe('ID');
    const idFieldValue = idField.get('.field-value');
    expect(idFieldValue.text()).toBe('1');

    const nameField = row1DataFields[1];
    expect(nameField.exists()).toBeTruthy();
    const nameFieldLabel = nameField.get('.field-label');
    expect(nameFieldLabel.text()).toBe('Name');
    const nameFieldValue = nameField.get('.field-value');
    expect(nameFieldValue.text()).toBe('Your Company');

    const row2DataFields = dataRows[1].findAll('.data-field');
    expect(row2DataFields.length).toBe(1);

    const accountNumberField = row2DataFields[0];
    expect(accountNumberField.exists()).toBeTruthy();
    const accountNumberFieldLabel = accountNumberField.get('.field-label');
    expect(accountNumberFieldLabel.text()).toBe('Account Number');
    const accountNumberFieldValue = accountNumberField.get('.field-value');
    expect(accountNumberFieldValue.text()).toBe('--- no value ---');

    const row3DataFields = dataRows[2].findAll('.data-field');
    expect(row3DataFields.length).toBe(1);

    const countryField = row3DataFields[0];
    expect(countryField.exists()).toBeTruthy();
    const countryFieldLabel = countryField.get('.field-label');
    expect(countryFieldLabel.text()).toBe('Country');
    const countryFieldValue = countryField.get('.field-value');
    expect(countryFieldValue.text()).toBe('SGP');

    const row4DataFields = dataRows[3].findAll('.data-field');
    expect(row4DataFields.length).toBe(1);

    const tagsField = row4DataFields[0];
    expect(tagsField.exists()).toBeTruthy();
    const tagsFieldLabel = tagsField.get('.field-label');
    expect(tagsFieldLabel.text()).toBe('Tags');
    const tagsFieldValue = tagsField.get('.field-value');
    expect(tagsFieldValue.text()).toBe('company:abc');

    const row5DataFields = dataRows[4].findAll('.data-field');
    expect(row5DataFields.length).toBe(2);

    const includeTagsField = row5DataFields[0];
    expect(includeTagsField.exists()).toBeTruthy();
    const includeTagsFieldLabel = includeTagsField.get('.field-label');
    expect(includeTagsFieldLabel.text()).toBe('Include Tags');
    const includeTagsFieldValue = includeTagsField.get('.field-value');
    expect(includeTagsFieldValue.text()).toBe('--- no value ---');

    const excludeTagsField = row5DataFields[1];
    expect(excludeTagsField.exists()).toBeTruthy();
    const excludeTagsFieldLabel = excludeTagsField.get('.field-label');
    expect(excludeTagsFieldLabel.text()).toBe('Exclude Tags');
    const excludeTagsFieldValue = excludeTagsField.get('.field-value');
    expect(excludeTagsFieldValue.text()).toBe('--- no value ---');
  });
});
