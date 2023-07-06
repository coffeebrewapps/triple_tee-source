import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TCheckbox,
  TDatePicker,
  TDateRange,
  TDateTimePicker,
  TDateTimeRange,
  TFilePicker,
  TInput,
  TSelect,
  TSelectTable,
  TTextarea,
  TButton
} from 'coffeebrew-vue-components';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import DataForm from '../../src/components/DataForm.vue';

vi.mock('../../src/utils/dataAccess.js');

const MockDatePicker = defineComponent({
  props: {
    modelValue: {
      type: Date,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    alignPickers: {
      type: String,
      default: 'top',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  template: '<div class="date"></div>',
});

const MockDateTimePicker = defineComponent({
  props: {
    modelValue: {
      type: Date,
      default: null,
    },
    displayTime: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    alignPickers: {
      type: String,
      default: 'top',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  template: '<div class="datetime"></div>',
});

const MockDateRange = defineComponent({
  props: {
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  template: '<div class="daterange"></div>',
});

const MockDateTimeRange = defineComponent({
  props: {
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  template: '<div class="datetimerange"></div>',
});

beforeEach(async() => {
  setActivePinia(createPinia());

  useDataAccess.mockImplementation(() => {
    return {
      list: vi.fn((modelClass, { offset, limit }) => {
        return new Promise((resolve, reject) => {
          if (modelClass === 'currencies') {
            const data = [
              {
                id: '1',
                code: 'SGD',
                symbol: '$',
              },
              {
                id: '2',
                code: 'USD',
                symbol: '$',
              },
              {
                id: '3',
                code: 'JPY',
                symbol: 'Y',
              },
              {
                id: '4',
                code: 'GBP',
                symbol: '$',
              },
              {
                id: '5',
                code: 'MYR',
                symbol: 'RM',
              },
              {
                id: '6',
                code: 'CNY',
                symbol: 'Y',
              },
              {
                id: '7',
                code: 'AUD',
                symbol: '$',
              },
              {
                id: '8',
                code: 'CAD',
                symbol: '$',
              },
            ];

            const paginated = data.slice(offset, offset + limit);
            resolve({
              total: paginated.length,
              data: paginated,
            });
          } else if (modelClass === 'tags') {
            const data = [
              {
                id: '1',
                category: 'company',
                name: 'abc',
              },
              {
                id: '2',
                category: 'activity',
                name: 'implementation',
              },
            ];

            const paginated = data.slice(offset, offset + limit);
            resolve({
              total: paginated.length,
              data: paginated,
            });
          } else {
            resolve({ total: 0, data: [] });
          }
        });
      }),
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const schemas = [
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
    key: 'bizType',
    type: 'enum',
    label: 'Business Type',
    options: [
      { value: 'sole', label: 'Sole Proprieter' },
      { value: 'private', label: 'Private Limited' },
    ],
  },
  {
    key: 'country',
    type: 'select',
    label: 'Country',
    options: [
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
      { value: 'SGP', label: 'Singapore' },
      { value: 'USA', label: 'United States of America' },
    ],
  },
  {
    key: 'postcode',
    type: 'number',
    label: 'Postcode',
  },
  {
    key: 'currencyId',
    type: 'singleSelect',
    label: 'Currency',
    options: {
      server: true,
      pagination: true,
      modelClass: 'currencies',
      value: (record) => record.id,
      label: (record) => `${record.code} (${record.symbol})`,
    },
  },
  {
    key: 'logo',
    type: 'file',
    label: 'Logo',
  },
  {
    key: 'description',
    type: 'textarea',
    label: 'Description',
  },
  {
    key: 'establishedDate',
    type: 'date',
    label: 'Est. Date',
  },
  {
    key: 'closureDate',
    type: 'date',
    label: 'Closure Date',
    nullToggleable: true,
  },
  {
    key: 'holidays',
    type: 'daterange',
    label: 'Holidays',
  },
  {
    key: 'registrationValidity',
    type: 'datetimerange',
    label: 'Registration Validity',
  },
  {
    key: 'isActive',
    type: 'boolean',
    label: 'Is Active',
  },
  {
    key: 'createdAt',
    type: 'datetime',
    label: 'Created At',
  },
  {
    key: 'tags',
    type: 'multiSelect',
    label: 'Tags',
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
  { id: 'sm', name: 'md', bizType: 'md' },
  { country: 'lg', postcode: 'md', currencyId: 'md' },
  { logo: 'md' },
  { description: 'md' },
  { establishedDate: 'md', holidays: 'md', closureDate: 'md' },
  { registrationValidity: 'md', isActive: 'md' },
  { createdAt: 'md' },
  { tags: 'lg' },
];

const dataFields = [
  'name',
  'bizType',
  'country',
  'postcode',
  'currencyId',
  'logo',
  'description',
  'registrationValidity',
  'tags',
];

const stubs = {
  TDatePicker: MockDatePicker,
  TDateTimePicker: MockDateTimePicker,
  TDateRange: MockDateRange,
  TDateTimeRange: MockDateTimeRange,
};

const modelValue = {
  id: '1',
  name: 'Your Company',
  bizType: 'sole',
  country: 'SGP',
  postcode: 123124,
  currencyId: ['1'],
  logo: null,
  description: 'The one stop company that provides all-rounded services.',
  establishedDate: new Date('2023-04-12'),
  closureDate: null,
  holidays: {
    startDate: new Date('2023-11-20'),
    endDate: new Date('2023-12-13'),
  },
  registrationValidity: {
    startTime: new Date('2023-04-12T00:00:00.000Z'),
    endTime: new Date('2025-04-11T23:59:59.999Z'),
  },
  isActive: true,
  createdAt: new Date('2023-04-24T12:34:56.234Z'),
  tags: [],
};

describe('DataForm.vue', () => {
  test('should render form with inputs', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    expect(formContainer.exists()).toBeTruthy();

    const formBody = formContainer.get('.body');
    expect(formBody.exists()).toBeTruthy();

    const dataRows = formBody.findAll('.data-row');
    expect(dataRows.length).toBe(8);

    const dataRow1 = dataRows[0];
    const dataRow1Fields = dataRow1.findAll('.data-field');
    expect(dataRow1Fields.length).toBe(3);

    const row1Field1Input = dataRow1Fields[0].get('.field-input');
    expect(row1Field1Input.exists()).toBeTruthy();

    const row1Field1Comp = row1Field1Input.findComponent(TInput);
    expect(row1Field1Comp.exists()).toBeTruthy();

    expect(row1Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: '1',
      type: 'text',
      disabled: true,
      label: 'ID',
      size: 'sm',
      errorMessage: '',
    }));

    const row1Field2Input = dataRow1Fields[1].get('.field-input');
    expect(row1Field2Input.exists()).toBeTruthy();

    const row1Field2Comp = row1Field2Input.findComponent(TInput);
    expect(row1Field2Comp.exists()).toBeTruthy();

    expect(row1Field2Comp.props()).toEqual(expect.objectContaining({
      modelValue: 'Your Company',
      type: 'text',
      disabled: false,
      label: 'Name',
      size: 'md',
      errorMessage: '',
    }));

    await row1Field2Comp.vm.$emit('update:modelValue', 'Coffee Brew Apps');

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        name: 'Coffee Brew Apps',
      }),
    }));

    const row1Field3Input = dataRow1Fields[2].get('.field-input');
    expect(row1Field3Input.exists()).toBeTruthy();

    const row1Field3Comp = row1Field3Input.findComponent(TSelect);
    expect(row1Field3Comp.exists()).toBeTruthy();

    expect(row1Field3Comp.props()).toEqual(expect.objectContaining({
      name: 'bizType',
      modelValue: 'sole',
      options: [
        { value: 'sole', label: 'Sole Proprieter' },
        { value: 'private', label: 'Private Limited' },
      ],
      disabled: false,
      searchable: false,
      label: 'Business Type',
      size: 'md',
      errorMessage: '',
    }));

    await row1Field3Comp.vm.$emit('update:modelValue', 'private');

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        bizType: 'private',
      }),
    }));

    const dataRow2 = dataRows[1];
    const dataRow2Fields = dataRow2.findAll('.data-field');
    expect(dataRow2Fields.length).toBe(3);

    const row2Field1Input = dataRow2Fields[0].get('.field-input');
    expect(row2Field1Input.exists()).toBeTruthy();

    const row2Field1Comp = row2Field1Input.findComponent(TSelect);
    expect(row2Field1Comp.exists()).toBeTruthy();

    expect(row2Field1Comp.props()).toEqual(expect.objectContaining({
      name: 'country',
      modelValue: 'SGP',
      options: [
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
        { value: 'SGP', label: 'Singapore' },
        { value: 'USA', label: 'United States of America' },
      ],
      disabled: false,
      searchable: true,
      label: 'Country',
      size: 'lg',
      errorMessage: '',
    }));

    await row2Field1Comp.vm.$emit('update:modelValue', 'USA');

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        country: 'USA',
      }),
    }));

    const row2Field2Input = dataRow2Fields[1].get('.field-input');
    expect(row2Field2Input.exists()).toBeTruthy();

    const row2Field2Comp = row2Field2Input.findComponent(TInput);
    expect(row2Field2Comp.exists()).toBeTruthy();

    expect(row2Field2Comp.props()).toEqual(expect.objectContaining({
      modelValue: 123124,
      type: 'number',
      disabled: false,
      label: 'Postcode',
      size: 'md',
      errorMessage: '',
    }));

    await row2Field2Comp.vm.$emit('update:modelValue', 124345);

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        postcode: 124345,
      }),
    }));

    const row2Field3Input = dataRow2Fields[2].get('.field-input');
    expect(row2Field3Input.exists()).toBeTruthy();

    const row2Field3Comp = row2Field3Input.findComponent(TSelectTable);
    expect(row2Field3Comp.exists()).toBeTruthy();

    expect(row2Field3Comp.props()).toEqual(expect.objectContaining({
      name: 'currencyId',
      modelValue: ['1'],
      disabled: false,
      label: 'Currency',
      multiple: false,
      options: [
        { value: '1', label: 'SGD ($)' },
        { value: '2', label: 'USD ($)' },
        { value: '3', label: 'JPY (Y)' },
        { value: '4', label: 'GBP ($)' },
        { value: '5', label: 'MYR (RM)' },
      ],
      optionsLength: 5,
      optionsLoading: false,
      pagination: {
        client: false,
        limit: 5,
        offset: 0,
      },
      size: 'md',
      errorMessage: '',
    }));

    await row2Field3Comp.vm.$emit('update:modelValue', ['2']);

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        currencyId: ['2'],
      }),
    }));

    const dataRow3 = dataRows[2];
    const dataRow3Fields = dataRow3.findAll('.data-field');
    expect(dataRow3Fields.length).toBe(1);

    const row3Field1Input = dataRow3Fields[0].get('.field-input');
    expect(row3Field1Input.exists()).toBeTruthy();

    const row3Field1Comp = row3Field1Input.findComponent(TFilePicker);
    expect(row3Field1Comp.exists()).toBeTruthy();

    expect(row3Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: null,
      disabled: false,
      label: 'Logo',
      size: 'md',
      errorMessage: '',
    }));

    const dataRow4 = dataRows[3];
    const dataRow4Fields = dataRow4.findAll('.data-field');
    expect(dataRow4Fields.length).toBe(1);

    const row4Field1Input = dataRow4Fields[0].get('.field-input');
    expect(row4Field1Input.exists()).toBeTruthy();

    const row4Field1Comp = row4Field1Input.findComponent(TTextarea);
    expect(row4Field1Comp.exists()).toBeTruthy();

    expect(row4Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: 'The one stop company that provides all-rounded services.',
      disabled: false,
      label: 'Description',
      errorMessage: '',
    }));

    await row4Field1Comp.vm.$emit('update:modelValue', 'The one-stop company that provides a variety of services.');

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        description: 'The one-stop company that provides a variety of services.',
      }),
    }));

    const dataRow5 = dataRows[4];
    const dataRow5Fields = dataRow5.findAll('.data-field');
    expect(dataRow5Fields.length).toBe(3);

    const row5Field1Input = dataRow5Fields[0].get('.field-input');
    expect(row5Field1Input.exists()).toBeTruthy();

    const row5Field1Comp = row5Field1Input.findComponent(TDatePicker);
    expect(row5Field1Comp.exists()).toBeTruthy();

    expect(row5Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: new Date('2023-04-12'),
      disabled: true,
      label: 'Est. Date',
      alignPickers: 'top',
      errorMessage: '',
    }));

    await row5Field1Comp.vm.$emit('update:modelValue', new Date('2023-05-24'));

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        establishedDate: new Date('2023-05-24'),
      }),
    }));

    const row5Field2Input = dataRow5Fields[1].get('.field-input');
    expect(row5Field2Input.exists()).toBeTruthy();

    const row5Field2Comp = row5Field2Input.findComponent(TDateRange);
    expect(row5Field2Comp.exists()).toBeTruthy();

    expect(row5Field2Comp.props()).toEqual(expect.objectContaining({
      startDate: new Date('2023-11-20'),
      endDate: new Date('2023-12-13'),
      disabled: true,
      label: 'Holidays',
      errorMessage: '',
    }));

    await row5Field2Comp.vm.$emit('update:startDate', new Date('2023-12-23'));
    await row5Field2Comp.vm.$emit('update:endDate', new Date('2024-03-21'));

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        holidays: {
          startDate: new Date('2023-12-23'),
          endDate: new Date('2024-03-21'),
        },
      }),
    }));

    const row5Field3Input = dataRow5Fields[2].get('.field-input');
    expect(row5Field3Input.exists()).toBeTruthy();

    expect(row5Field3Input.findComponent(TDatePicker).exists()).toBeFalsy();

    const row5Field3NullToggle = dataRow5Fields[2].get('.field-toggle');
    expect(row5Field3NullToggle.exists()).toBeTruthy();

    const row5Field3NullToggleCheckboxComp = row5Field3NullToggle.getComponent(TCheckbox);
    expect(row5Field3NullToggleCheckboxComp.exists()).toBeTruthy();

    expect(row5Field3NullToggleCheckboxComp.props()).toEqual(expect.objectContaining({
      modelValue: false,
    }));

    await row5Field3NullToggleCheckboxComp.vm.$emit('update:modelValue', true);

    await flushPromises();

    const row5Field3Comp = row5Field3Input.findComponent(TDatePicker);
    expect(row5Field3Comp.exists()).toBeTruthy();
    expect(row5Field3Comp.props()).toEqual(expect.objectContaining({
      modelValue: null,
      disabled: true,
      label: 'Closure Date',
      alignPickers: 'top',
      errorMessage: '',
    }));

    await row5Field3Comp.vm.$emit('update:modelValue', new Date('2025-03-24T23:59:59.999Z'));

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        closureDate: new Date('2025-03-24T23:59:59.999Z'),
      }),
    }));

    await row5Field3NullToggleCheckboxComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(row5Field3Input.findComponent(TDatePicker).exists()).toBeFalsy();

    const dataRow6 = dataRows[5];
    const dataRow6Fields = dataRow6.findAll('.data-field');
    expect(dataRow6Fields.length).toBe(2);

    const row6Field1Input = dataRow6Fields[0].get('.field-input');
    expect(row6Field1Input.exists()).toBeTruthy();

    const row6Field1Comp = row6Field1Input.findComponent(TDateTimeRange);
    expect(row6Field1Comp.exists()).toBeTruthy();

    expect(row6Field1Comp.props()).toEqual(expect.objectContaining({
      startTime: new Date('2023-04-12T00:00:00.000Z'),
      endTime: new Date('2025-04-11T23:59:59.999Z'),
      disabled: false,
      label: 'Registration Validity',
      errorMessage: '',
    }));

    await row6Field1Comp.vm.$emit('update:startTime', new Date('2023-04-27T00:00:00.000Z'));
    await row6Field1Comp.vm.$emit('update:endTime', new Date('2025-05-26T23:59:59.999Z'));

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        registrationValidity: {
          startTime: new Date('2023-04-27T00:00:00.000Z'),
          endTime: new Date('2025-05-26T23:59:59.999Z'),
        },
      }),
    }));

    const row6Field2Input = dataRow6Fields[1].get('.field-input');
    expect(row6Field2Input.exists()).toBeTruthy();

    const row6Field2Comp = row6Field2Input.findComponent(TCheckbox);
    expect(row6Field2Comp.exists()).toBeTruthy();

    expect(row6Field2Comp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      disabled: true,
      label: 'Is Active',
      errorMessage: '',
    }));

    await row6Field2Comp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        isActive: false,
      }),
    }));

    const dataRow7 = dataRows[6];
    const dataRow7Fields = dataRow7.findAll('.data-field');
    expect(dataRow7Fields.length).toBe(1);

    const row7Field1Input = dataRow7Fields[0].get('.field-input');
    expect(row7Field1Input.exists()).toBeTruthy();

    const row7Field1Comp = row7Field1Input.findComponent(TDateTimePicker);
    expect(row7Field1Comp.exists()).toBeTruthy();

    expect(row7Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: new Date('2023-04-24T12:34:56.234Z'),
      disabled: true,
      label: 'Created At',
      displayTime: true,
      alignPickers: 'top',
      errorMessage: '',
    }));

    await row7Field1Comp.vm.$emit('update:modelValue', new Date('2023-05-12T23:12:35.352Z'));

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        createdAt: new Date('2023-05-12T23:12:35.352Z'),
      }),
    }));

    const dataRow8 = dataRows[7];
    const dataRow8Fields = dataRow8.findAll('.data-field');
    expect(dataRow8Fields.length).toBe(1);

    const row8Field1Input = dataRow8Fields[0].get('.field-input');
    expect(row8Field1Input.exists()).toBeTruthy();

    const row8Field1Comp = row8Field1Input.findComponent(TSelectTable);
    expect(row8Field1Comp.exists()).toBeTruthy();

    expect(row8Field1Comp.props()).toEqual(expect.objectContaining({
      name: 'tags',
      modelValue: [],
      disabled: false,
      label: 'Tags',
      multiple: true,
      options: [
        { value: '1', label: 'company:abc' },
        { value: '2', label: 'activity:implementation' },
      ],
      optionsLength: 2,
      optionsLoading: false,
      pagination: {
        client: false,
        limit: 5,
        offset: 0,
      },
      size: 'lg',
      errorMessage: '',
    }));

    await row8Field1Comp.vm.$emit('update:modelValue', ['1', '2']);

    await flushPromises();

    expect(wrapper.props()).toEqual(expect.objectContaining({
      modelValue: expect.objectContaining({
        tags: ['1', '2'],
      }),
    }));
  });

  test('when given error messages should render in inputs', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {
          name: [{ name: 'required', params: {} }],
          establishedDate: [{ name: 'pastDate', params: {} }],
        },
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    const formBody = formContainer.get('.body');
    const dataRows = formBody.findAll('.data-row');

    const dataRow1 = dataRows[0];
    const dataRow1Fields = dataRow1.findAll('.data-field');
    const row1Field2Input = dataRow1Fields[1].get('.field-input');
    const row1Field2Comp = row1Field2Input.findComponent(TInput);

    expect(row1Field2Comp.props()).toEqual(expect.objectContaining({
      modelValue: 'Your Company',
      type: 'text',
      disabled: false,
      label: 'Name',
      size: 'md',
      errorMessage: 'Field is required',
    }));

    const dataRow5 = dataRows[4];
    const dataRow5Fields = dataRow5.findAll('.data-field');
    const row5Field1Input = dataRow5Fields[0].get('.field-input');
    const row5Field1Comp = row5Field1Input.findComponent(TDatePicker);

    expect(row5Field1Comp.props()).toEqual(expect.objectContaining({
      modelValue: new Date('2023-04-12'),
      disabled: true,
      label: 'Est. Date',
      alignPickers: 'top',
      errorMessage: 'Must be past date',
    }));
  });

  test('when select table offset change should fetch new data', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    const formBody = formContainer.get('.body');
    const dataRows = formBody.findAll('.data-row');

    const dataRow2 = dataRows[1];
    const dataRow2Fields = dataRow2.findAll('.data-field');
    const row2Field3Input = dataRow2Fields[2].get('.field-input');

    const row2Field3Comp = row2Field3Input.findComponent(TSelectTable);

    expect(row2Field3Comp.props()).toEqual(expect.objectContaining({
      name: 'currencyId',
      modelValue: ['1'],
      disabled: false,
      label: 'Currency',
      multiple: false,
      options: [
        { value: '1', label: 'SGD ($)' },
        { value: '2', label: 'USD ($)' },
        { value: '3', label: 'JPY (Y)' },
        { value: '4', label: 'GBP ($)' },
        { value: '5', label: 'MYR (RM)' },
      ],
      optionsLength: 5,
      optionsLoading: false,
      pagination: {
        client: false,
        limit: 5,
        offset: 0,
      },
      size: 'md',
      errorMessage: '',
    }));

    await row2Field3Comp.vm.$emit('offsetChange', 5);

    await flushPromises();

    expect(row2Field3Comp.props()).toEqual(expect.objectContaining({
      name: 'currencyId',
      modelValue: ['1'],
      disabled: false,
      label: 'Currency',
      multiple: false,
      options: [
        { value: '6', label: 'CNY (Y)' },
        { value: '7', label: 'AUD ($)' },
        { value: '8', label: 'CAD ($)' },
      ],
      optionsLength: 3,
      optionsLoading: false,
      pagination: {
        client: false,
        limit: 5,
        offset: 5,
      },
      size: 'md',
      errorMessage: '',
    }));
  });

  test('when submit data without file should emit data as-is', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: {
          id: '1',
          name: 'Your Company',
        },
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    const actionsContainer = formContainer.get('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      icon: 'fa-solid fa-check',
      value: 'Confirm',
    }));

    await submitButton.trigger('click');

    await flushPromises();

    const submitEvents = wrapper.emitted().submit;
    expect(submitEvents.length).toBe(1);
    expect(submitEvents[0]).toEqual([
      {
        id: '1',
        name: 'Your Company',
        bizType: null,
        country: null,
      },
    ]);
  });

  test('when submit data with file should emit with file data', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: {
          logo: null,
        },
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    const formBody = formContainer.get('.body');
    const dataRows = formBody.findAll('.data-row');

    const dataRow3 = dataRows[2];
    const dataRow3Fields = dataRow3.findAll('.data-field');
    const row3Field1Input = dataRow3Fields[0].get('.field-input');
    const row3Field1Comp = row3Field1Input.findComponent(TFilePicker);

    await row3Field1Comp.vm.$emit(
      'update:modelValue',
      new File(['logo'], 'logo.png', {
        type: 'image/png',
      })
    );

    await flushPromises();

    const actionsContainer = formContainer.get('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      icon: 'fa-solid fa-check',
      value: 'Confirm',
    }));

    await submitButton.trigger('click');

    await flushPromises();

    const submitEvents = wrapper.emitted().submit;
    expect(submitEvents.length).toBe(1);
    expect(submitEvents[0]).toEqual([
      expect.objectContaining({
        logo: expect.anything(),
        bizType: null,
        country: null,
      }),
    ]);
    expect(submitEvents[0][0].logo).toBeInstanceOf(File);
    expect(submitEvents[0][0].logo.name).toBe('logo.png');
  });

  test('when submit data with changed file should emit with new file data', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: {
          logo: new File(['logo'], 'logo.png', {
            type: 'image/png',
          }),
        },
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    const formBody = formContainer.get('.body');
    const dataRows = formBody.findAll('.data-row');

    const dataRow3 = dataRows[2];
    const dataRow3Fields = dataRow3.findAll('.data-field');
    const row3Field1Input = dataRow3Fields[0].get('.field-input');
    const row3Field1Comp = row3Field1Input.findComponent(TFilePicker);

    await row3Field1Comp.vm.$emit(
      'update:modelValue',
      new File(['banner'], 'banner.png', {
        type: 'image/png',
      })
    );

    await flushPromises();

    const actionsContainer = formContainer.get('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      icon: 'fa-solid fa-check',
      value: 'Confirm',
    }));

    await submitButton.trigger('click');

    await flushPromises();

    const submitEvents = wrapper.emitted().submit;
    expect(submitEvents.length).toBe(1);
    expect(submitEvents[0]).toEqual([
      expect.objectContaining({
        logo: expect.anything(),
        bizType: null,
        country: null,
      }),
    ]);
    expect(submitEvents[0][0].logo).toBeInstanceOf(File);
    expect(submitEvents[0][0].logo.name).toBe('banner.png');
  });

  test('when submit data with no change in file should emit same file data', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: {
          logo: new File(['logo'], 'logo.png', {
            type: 'image/png',
          }),
        },
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');

    const actionsContainer = formContainer.get('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      icon: 'fa-solid fa-check',
      value: 'Confirm',
    }));

    await submitButton.trigger('click');

    await flushPromises();

    const submitEvents = wrapper.emitted().submit;
    expect(submitEvents.length).toBe(1);
    expect(submitEvents[0]).toEqual([
      expect.objectContaining({
        logo: expect.anything(),
        bizType: null,
        country: null,
      }),
    ]);
    expect(submitEvents[0][0].logo).toBeInstanceOf(File);
    expect(submitEvents[0][0].logo.name).toBe('logo.png');
  });

  test('when using compact mode should render compact form', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
        compact: true,
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    expect(formContainer.exists()).toBeTruthy();
    expect(formContainer.classes('compact')).toBeTruthy();
  });

  test('when not submittable should not render buttons', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
        submittable: false,
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    expect(formContainer.exists()).toBeTruthy();

    const actionsContainer = formContainer.find('.actions');
    expect(actionsContainer.exists()).toBeFalsy();
  });

  test('when using custom buttons should render custom buttons', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
        confirmButton: {
          type: 'icon',
          icon: 'fa-solid fa-sun',
          value: 'Light',
        },
        cancelButton: {
          type: 'icon',
          icon: 'fa-solid fa-moon',
          value: 'Dark',
        },
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    expect(formContainer.exists()).toBeTruthy();

    const actionsContainer = formContainer.find('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'icon',
      icon: 'fa-solid fa-sun',
      value: 'Light',
    }));

    const cancelButton = buttons[1];
    expect(cancelButton.props()).toEqual(expect.objectContaining({
      buttonType: 'icon',
      icon: 'fa-solid fa-moon',
      value: 'Dark',
    }));

    cancelButton.trigger('click');

    const cancelEvents = wrapper.emitted().cancel;
    expect(cancelEvents.length).toBe(1);
  });

  test('when given null button should not render button', async() => {
    const wrapper = await mount(DataForm, {
      global: {
        stubs,
      },
      props: {
        modelValue: Object.assign({}, modelValue),
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
        confirmButton: {
          type: 'icon',
          icon: 'fa-solid fa-check',
          value: 'Update',
        },
        cancelButton: null,
      },
    });

    await flushPromises();

    const formContainer = wrapper.get('.form');
    expect(formContainer.exists()).toBeTruthy();

    const actionsContainer = formContainer.find('.actions');
    expect(actionsContainer.exists()).toBeTruthy();

    const buttons = actionsContainer.findAllComponents(TButton);
    expect(buttons.length).toBe(1);

    const submitButton = buttons[0];
    expect(submitButton.props()).toEqual(expect.objectContaining({
      buttonType: 'icon',
      icon: 'fa-solid fa-check',
      value: 'Update',
    }));
  });
});
