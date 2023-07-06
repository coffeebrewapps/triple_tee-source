import { mount, flushPromises } from '@vue/test-utils';
import {
  TButton,
  TDialog
} from 'coffeebrew-vue-components';
import { setActivePinia, createPinia } from 'pinia';
import { useSystemConfigsStore } from '../../src/stores/systemConfigs.js';
import ViewDialog from '../../src/components/ViewDialog.vue';

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

const record = {
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

const keys = [
  'id',
  'name',
  'accountNumber',
  'country',
  'tags',
  'includeTags',
  'excludeTags',
];

const includeKeys = [
  'country',
  'tags',
  'includeTags',
  'excludeTags',
];

const inputLabel = (field) => {
  return dataFields.find(f => f.key === field).label;
};

const inputValue = (field, record) => {
  return record[field];
};

describe('ViewDialog.vue', () => {
  test('should render view in dialog', async() => {
    const wrapper = await mount(ViewDialog, {
      props: {
        modelValue: true,
        keys,
        record,
        dataFields,
        title: 'View Contact',
        inputLabel,
        inputValue,
        includeKeys,
      },
    });

    await flushPromises();

    const viewDialogComp = wrapper.findComponent(TDialog);
    expect(viewDialogComp.exists()).toBeTruthy();

    expect(viewDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'View Contact',
    }));

    const dataRow = viewDialogComp.get('.data-row');
    expect(dataRow.exists()).toBeTruthy();

    const dataCols = dataRow.findAll('.data-col');
    expect(dataCols.length).toBe(7);

    const idField = dataCols[0];
    expect(idField.exists()).toBeTruthy();
    const idFieldLabel = idField.get('.data-label');
    expect(idFieldLabel.text()).toBe('ID');
    const idFieldValue = idField.get('.data-value');
    expect(idFieldValue.text()).toBe('1');

    const nameField = dataCols[1];
    expect(nameField.exists()).toBeTruthy();
    const nameFieldLabel = nameField.get('.data-label');
    expect(nameFieldLabel.text()).toBe('Name');
    const nameFieldValue = nameField.get('.data-value');
    expect(nameFieldValue.text()).toBe('Your Company');

    const accountNumberField = dataCols[2];
    expect(accountNumberField.exists()).toBeTruthy();
    const accountNumberFieldLabel = accountNumberField.get('.data-label');
    expect(accountNumberFieldLabel.text()).toBe('Account Number');
    const accountNumberFieldValue = accountNumberField.get('.data-value');
    expect(accountNumberFieldValue.text()).toBe('--- no value ---');

    const countryField = dataCols[3];
    expect(countryField.exists()).toBeTruthy();
    const countryFieldLabel = countryField.get('.data-label');
    expect(countryFieldLabel.text()).toBe('Country');
    const countryFieldValue = countryField.get('.data-value');
    expect(countryFieldValue.text()).toBe('SGP');

    const tagsField = dataCols[4];
    expect(tagsField.exists()).toBeTruthy();
    const tagsFieldLabel = tagsField.get('.data-label');
    expect(tagsFieldLabel.text()).toBe('Tags');
    const tagsFieldValue = tagsField.get('.data-value');
    expect(tagsFieldValue.text()).toBe('company:abc');

    const includeTagsField = dataCols[5];
    expect(includeTagsField.exists()).toBeTruthy();
    const includeTagsFieldLabel = includeTagsField.get('.data-label');
    expect(includeTagsFieldLabel.text()).toBe('Include Tags');
    const includeTagsFieldValue = includeTagsField.get('.data-value');
    expect(includeTagsFieldValue.text()).toBe('--- no value ---');

    const excludeTagsField = dataCols[6];
    expect(excludeTagsField.exists()).toBeTruthy();
    const excludeTagsFieldLabel = excludeTagsField.get('.data-label');
    expect(excludeTagsFieldLabel.text()).toBe('Exclude Tags');
    const excludeTagsFieldValue = excludeTagsField.get('.data-value');
    expect(excludeTagsFieldValue.text()).toBe('--- no value ---');
  });

  test('when close button clicked should close dialog', async() => {
    const wrapper = await mount(ViewDialog, {
      props: {
        modelValue: true,
        keys,
        record,
        dataFields,
        title: 'View Contact',
        inputLabel,
        inputValue,
        includeKeys,
      },
    });

    await flushPromises();

    const viewDialogComp = wrapper.findComponent(TDialog);

    const buttonComp = viewDialogComp.getComponent(TButton);
    expect(buttonComp.exists()).toBeTruthy();

    await buttonComp.vm.$emit('click');

    await flushPromises();

    const closeEvents = wrapper.emitted()['update:modelValue'];
    expect(closeEvents.length).toBe(1);
    expect(closeEvents[0]).toEqual([false]);
  });

  test('when close dialog should not render view in dialog', async() => {
    const wrapper = await mount(ViewDialog, {
      props: {
        modelValue: true,
        keys,
        record,
        dataFields,
        title: 'View Contact',
        inputLabel,
        inputValue,
        includeKeys,
      },
    });

    await flushPromises();

    const viewDialogComp = wrapper.findComponent(TDialog);
    expect(viewDialogComp.exists()).toBeTruthy();
    expect(viewDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'View Contact',
    }));

    await viewDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    const closeEvents = wrapper.emitted()['update:modelValue'];
    expect(closeEvents.length).toBe(1);
    expect(closeEvents[0]).toEqual([false]);
  });

  test('when dialog is false should not render view in dialog', async() => {
    const wrapper = await mount(ViewDialog, {
      props: {
        modelValue: false,
        keys,
        record,
        dataFields,
        title: 'View Contact',
        inputLabel,
        inputValue,
        includeKeys,
      },
    });

    await flushPromises();

    const viewDialogComp = wrapper.findComponent(TDialog);
    expect(viewDialogComp.exists()).toBeTruthy();
    expect(viewDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: false,
      title: 'View Contact',
    }));
  });
});
