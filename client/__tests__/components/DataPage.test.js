import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import { useSystemConfigsStore } from '../../src/stores/systemConfigs.js';
import { useBannerStore } from '../../src/stores/banner.js';
import { useEventsStore } from '../../src/stores/events.js';
import {
  TTable,
  TAlert,
  TConfirmDialog,
  TDialog,
  TButton
} from 'coffeebrew-vue-components';
import ViewDialog from '../../src/components/ViewDialog.vue';
import FormDialog from '../../src/components/FormDialog.vue';
import DataForm from '../../src/components/DataForm.vue';
import DataPage from '../../src/components/DataPage.vue';

vi.mock('../../src/utils/dataAccess.js');

vi.mock('../../src/stores/banner.js');

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

const tags = {
  1: {
    id: '1',
    category: 'company',
    name: 'abc',
  },
  2: {
    id: '2',
    category: 'company',
    name: 'xyz',
  },
};

const contacts = {
  1: {
    id: '1',
    name: 'Coffee Brew Apps',
    accountNumber: null,
    contactNumber1: '60238463',
    tags: [],
    establishedSince: '2023-03-21',
    createdAt: '2023-02-13T17:42:51.235Z',
  },
  2: {
    id: '2',
    name: 'Company ABC',
    accountNumber: null,
    contactNumber1: null,
    tags: ['1'],
    establishedSince: null,
    createdAt: '2023-03-05T06:15:26.206Z',
    includes: {
      tags: {
        1: tags['1'],
      },
    },
  },
};

const schemas = vi.fn((modelClass) => {
  return new Promise((resolve, reject) => {
    resolve({
      fields: {
        id: {
          type: 'text',
        },
        name: {
          type: 'text',
        },
        accountNumber: {
          type: 'text',
        },
        contactNumber1: {
          type: 'text',
        },
        tags: {
          type: 'array',
          default: [],
        },
        establishedSince: {
          type: 'date',
        },
      },
    });
  });
});

const listRecords = vi.fn((modelClass, params) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      resolve({
        total: Object.keys(contacts).length,
        data: Object.values(contacts),
      });
    } else if (modelClass === 'tags') {
      resolve({
        total: Object.keys(tags).length,
        data: Object.values(tags),
      });
    } else {
      resolve({
        total: 0,
        data: [],
      });
    };
  });
});

const viewRecord = vi.fn((modelClass, id, params) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      resolve(contacts[id]);
    } else {
      resolve({});
    }
  });
});

const createRecord = vi.fn((modelClass, params, multipart) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      if (params.name) {
        resolve(Object.assign({}, params, { id: 3 }));
      } else {
        reject({
          name: ['required'],
        });
      }
    } else {
      resolve({});
    }
  });
});

const updateRecord = vi.fn((modelClass, id, params, suffix, multipart) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      if (params.name) {
        resolve(Object.assign({}, contacts[id], params));
      } else {
        reject({
          name: ['required'],
        });
      }
    } else {
      resolve({});
    }
  });
});

const removeRecord = vi.fn((modelClass, id) => {
  return new Promise((resolve, reject) => {
    if (id === '1') {
      resolve({});
    } else {
      reject({ id: ['isUsed'] });
    }
  });
});

const downloadModel = vi.fn((modelClass) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      resolve({
        filename: 'contacts.json',
        data: {
          total: Object.keys(contacts).length,
          data: Object.values(contacts),
        },
      });
    } else {
      resolve({
        filename: `${modelClass}.json`,
        data: {
          total: 0,
          data: [],
        },
      });
    }
  });
});

const mockDataAccess = {
  schemas,
  list: listRecords,
  view: viewRecord,
  create: createRecord,
  update: updateRecord,
  remove: removeRecord,
  download: downloadModel,
};

const createUrl = vi.fn((blob) => {
  return 'http://localhost/json';
});

const anchorClick = vi.fn();

const flashMessage = vi.fn();

let systemConfigsStore;
let eventsStore;

beforeEach(async() => {
  setActivePinia(createPinia());

  global.window.URL.createObjectURL = createUrl;
  HTMLAnchorElement.prototype.click = anchorClick;

  useBannerStore.mockImplementation(() => {
    return {
      flashMessage,
    };
  });

  systemConfigsStore = useSystemConfigsStore();
  systemConfigsStore.updateSystemConfigs({
    timezone: 'Asia/Singapore',
    tagFormat: '{{ category }}:{{ name }}',
  });

  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
    resolvedOptions: () => ({
      locale: 'en-SG',
    }),
  }));

  eventsStore = useEventsStore();

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2023-04-12T12:34:56.123Z'));

  useDataAccess.mockImplementation(() => {
    return mockDataAccess;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

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
    key: 'name',
    type: 'text',
    label: 'Name',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
    sortable: true,
  },
  {
    key: 'accountNumber',
    type: 'text',
    label: 'Account Number',
    listable: false,
    viewable: true,
    creatable: true,
    updatable: true,
  },
  {
    key: 'contactNumber1',
    type: 'text',
    label: 'Contact Number 1',
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
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
    key: 'establishedSince',
    type: 'date',
    label: 'Est. Since',
    defaultValue: () => { return new Date(); },
    listable: true,
    viewable: true,
    creatable: true,
    updatable: true,
    filterable: true,
  },
  {
    key: 'createdAt',
    type: 'datetime',
    label: 'Created At',
    defaultValue: () => { return new Date(); },
    listable: false,
    viewable: true,
    creatable: false,
    updatable: false,
    filterable: true,
  },
];

const fieldsLayout = [
  { name: 'lg' },
  { accountNumber: 'md' },
  { contactNumber1: 'md' },
  { tags: 'lg' },
  { establishedSince: 'md' },
];

const validations = {
  create: {
    establishedSince: [
      (record) => {
        if (!record.establishedSince) { return; }

        const now = new Date();
        if ((new Date(record.establishedSince)) > now) {
          return {
            name: 'pastDate',
            params: {},
          };
        }
      },
    ],
  },
  update: {
    establishedSince: [
      (record) => {
        if (!record.establishedSince) { return; }

        const now = new Date();
        if ((new Date(record.establishedSince)) > now) {
          return {
            name: 'pastDate',
            params: {},
          };
        }
      },
    ],
  },
};

const stubs = {
  TDatePicker: MockDatePicker,
  TDateTimePicker: MockDateTimePicker,
};

describe('DataPage.vue', () => {
  test('with default props should render data page', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();

    const heading = pageContainer.find('.heading');
    expect(heading.exists()).toBeFalsy();

    const filters = pageContainer.find('.filters');
    expect(filters.exists()).toBeFalsy();

    const sortContainer = pageContainer.find('.sort-container');
    expect(sortContainer.exists()).toBeFalsy();

    const tableComp = pageContainer.getComponent(TTable);
    expect(tableComp.exists()).toBeTruthy();
    expect(tableComp.props()).toEqual(expect.objectContaining({
      name: '',
      headers: [
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
          key: 'name',
          type: 'text',
          label: 'Name',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          sortable: true,
        },
        {
          key: 'contactNumber1',
          type: 'text',
          label: 'Contact Number 1',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'tags',
          type: 'multiSelect',
          label: 'Tags',
          reference: { label: expect.anything() },
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          options: {
            server: true,
            pagination: true,
            modelClass: 'tags',
            value: expect.anything(),
            label: expect.anything(),
          },
        },
        {
          key: 'establishedSince',
          type: 'date',
          label: 'Est. Since',
          defaultValue: expect.anything(),
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
        },
      ],
      data: [
        {
          id: '1',
          name: 'Coffee Brew Apps',
          accountNumber: null,
          contactNumber1: '60238463',
          tags: [],
          establishedSince: '2023-03-21',
          createdAt: '2023-02-13T17:42:51.235Z',
          tagsFormatted: [],
        },
        {
          id: '2',
          name: 'Company ABC',
          accountNumber: null,
          contactNumber1: null,
          tags: ['1'],
          establishedSince: null,
          createdAt: '2023-03-05T06:15:26.206Z',
          includes: {
            tags: {
              1: {
                id: '1',
                category: 'company',
                name: 'abc',
              },
            },
          },
          tagsFormatted: [
            'company:abc',
          ],
        },
      ],
      tableActions: [
        {
          name: 'Create',
          icon: 'fa-solid fa-circle-plus fa-xl',
          click: expect.anything(),
        },
        {
          name: 'Export',
          icon: 'fa-solid fa-file-export',
          click: expect.anything(),
        },
      ],
      actions: [
        {
          name: 'Update',
          icon: 'fa-solid fa-pen-to-square',
          click: expect.anything(),
        },
        {
          name: 'Delete',
          icon: 'fa-solid fa-trash-can',
          click: expect.anything(),
        },
      ],
      rowAction: expect.anything(),
      loading: false,
      pagination: {
        offset: 0,
        limit: 5,
        client: false,
      },
      totalData: 2,
    }));

    const tableHeader = tableComp.get('thead');
    expect(tableHeader.exists()).toBeTruthy();

    const tableCols = tableHeader.findAll('th');
    expect(tableCols.length).toBe(6);

    const idHeader = tableCols[0];
    const idHeaderField = idHeader.get('.header-field');
    expect(idHeaderField.classes()).toContain('sort');
    expect(idHeaderField.classes()).toContain('down');
    expect(idHeaderField.text()).toBe('ID');

    const nameHeader = tableCols[1];
    const nameHeaderField = nameHeader.get('.header-field');
    expect(nameHeaderField.classes()).toContain('sort');
    expect(nameHeaderField.classes()).toContain('reset');
    expect(nameHeaderField.text()).toBe('Name');

    const contactNumberHeader = tableCols[2];
    const contactNumberHeaderField = contactNumberHeader.get('.header-field');
    expect(contactNumberHeaderField.classes()).toContain('nosort');
    expect(contactNumberHeaderField.text()).toBe('Contact Number 1');

    const tagsHeader = tableCols[3];
    const tagsHeaderField = tagsHeader.get('.header-field');
    expect(tagsHeaderField.classes()).toContain('nosort');
    expect(tagsHeaderField.text()).toBe('Tags');

    const establishedHeader = tableCols[4];
    const establishedHeaderField = establishedHeader.get('.header-field');
    expect(establishedHeaderField.classes()).toContain('nosort');
    expect(establishedHeaderField.text()).toBe('Est. Since');

    const tableBody = tableComp.get('tbody');
    expect(tableBody.exists()).toBeTruthy();

    const bodyRows = tableBody.findAll('tr');
    expect(bodyRows.length).toBe(2);

    const row1Cols = bodyRows[0].findAll('td');
    expect(row1Cols.length).toBe(6);

    const row1Id = row1Cols[0];
    expect(row1Id.exists()).toBeTruthy();
    expect(row1Id.text()).toBe('1');

    const row1Name = row1Cols[1];
    expect(row1Name.exists()).toBeTruthy();
    expect(row1Name.text()).toBe('Coffee Brew Apps');

    const row1ContactNumber = row1Cols[2];
    expect(row1ContactNumber.exists()).toBeTruthy();
    expect(row1ContactNumber.text()).toBe('60238463');

    const row1Tags = row1Cols[3];
    expect(row1Tags.exists()).toBeTruthy();
    expect(row1Tags.text()).toBe('--- no value ---');

    const row1Established = row1Cols[4];
    expect(row1Established.exists()).toBeTruthy();
    expect(row1Established.text()).toBe('21/03/2023');

    const row2Cols = bodyRows[1].findAll('td');
    expect(row2Cols.length).toBe(6);

    const row2Id = row2Cols[0];
    expect(row2Id.exists()).toBeTruthy();
    expect(row2Id.text()).toBe('2');

    const row2Name = row2Cols[1];
    expect(row2Name.exists()).toBeTruthy();
    expect(row2Name.text()).toBe('Company ABC');

    const row2ContactNumber = row2Cols[2];
    expect(row2ContactNumber.exists()).toBeTruthy();
    expect(row2ContactNumber.text()).toBe('--- no value ---');

    const row2Tags = row2Cols[3];
    expect(row2Tags.exists()).toBeTruthy();
    expect(row2Tags.text()).toBe('company:abc');

    const row2Established = row2Cols[4];
    expect(row2Established.exists()).toBeTruthy();
    expect(row2Established.text()).toBe('--- no value ---');
  });

  test('when show heading true should render page heading', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        showHeading: true,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();

    const heading = pageContainer.find('.heading');
    expect(heading.exists()).toBeTruthy();
    expect(heading.text()).toBe('Contacts');
  });

  test('with addtional actions should render actions', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        actions: {
          table: {
            importData: {
              name: 'Import',
              icon: 'fa-solid fa-file-import',
              click: async function(data) {
              },
            },
          },
          row: {
            reverseTransaction: {
              name: 'Reverse',
              icon: 'fa-solid fa-rotate-left',
              click: async function(data) {
              },
            },
          },
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    expect(tableActions.exists()).toBeTruthy();

    const actions = tableActions.findAll('.action');
    expect(actions.length).toBe(3);

    const createAction = actions[0];
    expect(createAction.html()).toContain('Create');

    const exportAction = actions[1];
    expect(exportAction.html()).toContain('Export');

    const importAction = actions[2];
    expect(importAction.html()).toContain('Import');

    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    expect(row2ActionIcons.length).toBe(3);

    const updateAction = row2ActionIcons[0];
    expect(updateAction.html()).toContain('fa-pen-to-square');

    const deleteAction = row2ActionIcons[1];
    expect(deleteAction.html()).toContain('fa-trash-can');

    const reverseAction = row2ActionIcons[2];
    expect(reverseAction.html()).toContain('fa-rotate-left');
  });

  test('when click row should render view dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Id = row2Cols[0];

    expect(pageContainer.findComponent(ViewDialog).exists()).toBeFalsy();

    await row2Id.trigger('click');

    await flushPromises();

    const row2ViewDialogComp = pageContainer.findComponent(ViewDialog);
    expect(row2ViewDialogComp.exists()).toBeTruthy();
    expect(row2ViewDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      keys: [
        'id',
        'name',
        'accountNumber',
        'contactNumber1',
        'tags',
        'establishedSince',
        'createdAt',
      ],
      includeKeys: [
        'tags',
      ],
      dataFields: [
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
          key: 'name',
          type: 'text',
          label: 'Name',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          sortable: true,
        },
        {
          key: 'accountNumber',
          type: 'text',
          label: 'Account Number',
          listable: false,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'contactNumber1',
          type: 'text',
          label: 'Contact Number 1',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'tags',
          type: 'multiSelect',
          label: 'Tags',
          reference: { label: expect.anything() },
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          options: {
            server: true,
            pagination: true,
            modelClass: 'tags',
            value: expect.anything(),
            label: expect.anything(),
          },
        },
        {
          key: 'establishedSince',
          type: 'date',
          label: 'Est. Since',
          defaultValue: expect.anything(),
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
        },
        {
          key: 'createdAt',
          type: 'datetime',
          label: 'Created At',
          defaultValue: expect.anything(),
          listable: false,
          viewable: true,
          creatable: false,
          updatable: false,
          filterable: true,
        },
      ],
      record: {
        id: '2',
        name: 'Company ABC',
        accountNumber: null,
        contactNumber1: null,
        tags: ['1'],
        establishedSince: null,
        createdAt: '2023-03-05T06:15:26.206Z',
        includes: {
          tags: {
            1: tags['1'],
          },
        },
      },
      title: 'View Contacts 2',
      inputLabel: expect.anything(),
      inputValue: expect.anything(),
    }));

    await row2ViewDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(pageContainer.findComponent(ViewDialog).exists()).toBeFalsy();
  });

  test('when click row view data access returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        view: vi.fn((modelClass, id, params) => {
          return new Promise((resolve, reject) => {
            reject({
              id: ['notFound'],
            });
          });
        }),
      });
    });

    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Id = row2Cols[0];

    expect(pageContainer.findComponent(TAlert).exists()).toBeFalsy();

    await row2Id.trigger('click');

    await flushPromises();

    const errorAlertComp = pageContainer.findComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "id": [\n        "notFound"\n    ]\n}`,
      width: 800,
      height: 400,
    }));

    await errorAlertComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(pageContainer.findComponent(TAlert).exists()).toBeFalsy();
  });

  test('when click create action should render form dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        validations,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    expect(tableActions.exists()).toBeTruthy();

    const actions = tableActions.findAll('.action');
    expect(actions.length).toBe(2);

    const createAction = actions[0];
    expect(createAction.html()).toContain('Create');

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await createAction.trigger('click', []);

    await flushPromises();

    const createFormDialogComp = pageContainer.findComponent(FormDialog);
    expect(createFormDialogComp.exists()).toBeTruthy();
    expect(createFormDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      schemas: [
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
          key: 'name',
          type: 'text',
          label: 'Name',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          sortable: true,
        },
        {
          key: 'accountNumber',
          type: 'text',
          label: 'Account Number',
          listable: false,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'contactNumber1',
          type: 'text',
          label: 'Contact Number 1',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'tags',
          type: 'multiSelect',
          label: 'Tags',
          reference: { label: expect.anything() },
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          options: {
            server: true,
            pagination: true,
            modelClass: 'tags',
            value: expect.anything(),
            label: expect.anything(),
          },
        },
        {
          key: 'establishedSince',
          type: 'date',
          label: 'Est. Since',
          defaultValue: expect.anything(),
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
        },
        {
          key: 'createdAt',
          type: 'datetime',
          label: 'Created At',
          defaultValue: expect.anything(),
          listable: false,
          viewable: true,
          creatable: false,
          updatable: false,
          filterable: true,
        },
      ],
      fieldsLayout,
      dataFields: [
        'name',
        'accountNumber',
        'contactNumber1',
        'tags',
        'establishedSince',
      ],
      data: {
        id: undefined,
        name: undefined,
        accountNumber: undefined,
        contactNumber1: undefined,
        tags: undefined,
        establishedSince: new Date('2023-04-12T12:34:56.123Z'),
      },
      dialogTitle: 'Create Contacts',
      fullscreen: false,
      errorMessages: {},
    }));

    await createFormDialogComp.vm.$emit('update:data', {
      name: 'Company XYZ',
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-03-31'),
    });

    await createFormDialogComp.vm.$emit('submit', {
      name: 'Company XYZ',
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-03-31'),
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledWith('contacts', expect.objectContaining({
      name: 'Company XYZ',
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-03-31T00:00:00Z'),
    }), false);
  });

  test('when create action validations fail should render error messages', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        validations,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const createAction = actions[0];

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await createAction.trigger('click', []);

    await flushPromises();

    const createFormDialogComp = pageContainer.findComponent(FormDialog);

    await createFormDialogComp.vm.$emit('submit', {
      name: 'Company XYZ',
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-05-31'),
    });

    await flushPromises();

    expect(createRecord).not.toHaveBeenCalledWith();

    expect(createFormDialogComp.props()).toEqual(expect.objectContaining({
      errorMessages: {
        establishedSince: [
          {
            name: 'pastDate',
            params: {},
          },
        ],
      },
    }));

    await createFormDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();
  });

  test('when create data access returns failure should render error messages', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const createAction = actions[0];

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await createAction.trigger('click', []);

    await flushPromises();

    const createFormDialogComp = pageContainer.findComponent(FormDialog);

    await createFormDialogComp.vm.$emit('submit', {
      name: null,
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-05-31'),
    });

    await flushPromises();

    expect(createRecord).toHaveBeenCalledWith('contacts', expect.objectContaining({
      name: null,
      accountNumber: null,
      contactNumber1: null,
      tags: [],
      establishedSince: new Date('2023-05-31'),
    }), false);

    expect(createFormDialogComp.props()).toEqual(expect.objectContaining({
      errorMessages: {
        name: [
          {
            name: 'required',
            params: {},
          },
        ],
      },
    }));
  });

  test('when click export action should render download dialog and click download link', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    expect(tableActions.exists()).toBeTruthy();

    const actions = tableActions.findAll('.action');
    expect(actions.length).toBe(2);

    const exportAction = actions[1];
    expect(exportAction.html()).toContain('Export');

    expect(pageContainer.findComponent(TDialog).exists()).toBeFalsy();

    await exportAction.trigger('click', []);

    await flushPromises();

    expect(downloadModel).toHaveBeenCalledWith('contacts');

    const downloadDialogComp = pageContainer.getComponent(TDialog);
    expect(downloadDialogComp.exists()).toBeTruthy();
    expect(downloadDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Download export file',
    }));

    const downloadAnchor = downloadDialogComp.get('a');
    expect(downloadAnchor.exists()).toBeTruthy();
    expect(downloadAnchor.attributes('download')).toBe('contacts.json');
    expect(downloadAnchor.attributes('href')).toBe('http://localhost/json');

    const buttons = downloadDialogComp.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const downloadButton = buttons[0];
    expect(downloadButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      value: 'Download',
      icon: 'fa-solid fa-file-arrow-down',
    }));

    await downloadButton.vm.$emit('click');

    await flushPromises();

    expect(anchorClick).toHaveBeenCalled();

    expect(pageContainer.findComponent(TDialog).exists()).toBeFalsy();
  });

  test('when click export action should render download dialog and close dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const exportAction = actions[1];

    expect(pageContainer.findComponent(TDialog).exists()).toBeFalsy();

    await exportAction.trigger('click', []);

    await flushPromises();

    expect(downloadModel).toHaveBeenCalledWith('contacts');

    const downloadDialogComp = pageContainer.getComponent(TDialog);
    expect(downloadDialogComp.exists()).toBeTruthy();
    expect(downloadDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Download export file',
    }));

    await downloadDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(downloadDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: false,
    }));
  });

  test('when export action download data access returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        download: vi.fn((modelClass, id, params) => {
          return new Promise((resolve, reject) => {
            reject(new Error('unknown'));
          });
        }),
      });
    });

    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const exportAction = actions[1];

    await exportAction.trigger('click', []);

    await flushPromises();

    const errorAlertComp = pageContainer.findComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: '',
      width: 800,
      height: 400,
    }));
  });

  test('when click export action should render download dialog and click cancel link to close', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const exportAction = actions[1];

    await exportAction.trigger('click', []);

    await flushPromises();

    const downloadDialogComp = pageContainer.getComponent(TDialog);

    const buttons = downloadDialogComp.findAllComponents(TButton);

    const cancelButton = buttons[1];
    expect(cancelButton.props()).toEqual(expect.objectContaining({
      buttonType: 'text',
      value: 'Cancel',
      icon: 'fa-solid fa-xmark',
    }));

    await cancelButton.vm.$emit('click');

    await flushPromises();

    expect(anchorClick).not.toHaveBeenCalled();
    expect(pageContainer.findComponent(TDialog).exists()).toBeFalsy();
  });

  test('when click update action should render form dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    const row2Update = row2ActionIcons[0];
    expect(row2Update.classes()).toContain('fa-pen-to-square');

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await row2Update.trigger('click');

    await flushPromises();

    const row2UpdateFormDialogComp = pageContainer.findComponent(FormDialog);
    expect(row2UpdateFormDialogComp.exists()).toBeTruthy();
    expect(row2UpdateFormDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      schemas: [
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
          key: 'name',
          type: 'text',
          label: 'Name',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          sortable: true,
        },
        {
          key: 'accountNumber',
          type: 'text',
          label: 'Account Number',
          listable: false,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'contactNumber1',
          type: 'text',
          label: 'Contact Number 1',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
        },
        {
          key: 'tags',
          type: 'multiSelect',
          label: 'Tags',
          reference: { label: expect.anything() },
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          options: {
            server: true,
            pagination: true,
            modelClass: 'tags',
            value: expect.anything(),
            label: expect.anything(),
          },
        },
        {
          key: 'establishedSince',
          type: 'date',
          label: 'Est. Since',
          defaultValue: expect.anything(),
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
        },
        {
          key: 'createdAt',
          type: 'datetime',
          label: 'Created At',
          defaultValue: expect.anything(),
          listable: false,
          viewable: true,
          creatable: false,
          updatable: false,
          filterable: true,
        },
      ],
      fieldsLayout,
      dataFields: [
        'name',
        'accountNumber',
        'contactNumber1',
        'tags',
        'establishedSince',
      ],
      data: {
        id: '2',
        name: 'Company ABC',
        accountNumber: null,
        contactNumber1: null,
        tags: [{ value: '1', label: 'company:abc' }],
        establishedSince: new Date('2023-04-12T12:34:56.123Z'),
        createdAt: new Date('2023-03-05T06:15:26.206Z'),
      },
      dialogTitle: 'Update Contacts 2',
      fullscreen: false,
      errorMessages: {},
    }));

    await row2UpdateFormDialogComp.vm.$emit('update:data', {
      id: '2',
      name: 'Company ABC',
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: new Date('2023-03-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    });

    await row2UpdateFormDialogComp.vm.$emit('submit', {
      id: '2',
      name: 'Company ABC',
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: new Date('2023-03-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    });

    await flushPromises();

    expect(updateRecord).toHaveBeenCalledWith('contacts', '2', {
      id: '2',
      name: 'Company ABC',
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: ['1'],
      establishedSince: new Date('2023-03-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    }, {}, false);
  });

  test('when click update action view data access returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        view: vi.fn((modelClass, id, params) => {
          return new Promise((resolve, reject) => {
            reject({
              id: ['notFound'],
            });
          });
        }),
      });
    });

    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    const row2Update = row2ActionIcons[0];

    await row2Update.trigger('click');

    await flushPromises();

    const errorAlertComp = pageContainer.findComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "id": [\n        "notFound"\n    ]\n}`,
      width: 800,
      height: 400,
    }));
  });

  test('when update action validations fail should render error messages', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        validations,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    const row2Update = row2ActionIcons[0];

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await row2Update.trigger('click');

    await flushPromises();

    const row2UpdateFormDialogComp = pageContainer.findComponent(FormDialog);
    expect(row2UpdateFormDialogComp.exists()).toBeTruthy();

    await row2UpdateFormDialogComp.vm.$emit('submit', {
      id: '2',
      name: 'Company ABC',
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: new Date('2023-05-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    });

    await flushPromises();

    expect(updateRecord).not.toHaveBeenCalled();

    expect(row2UpdateFormDialogComp.props()).toEqual(expect.objectContaining({
      errorMessages: {
        establishedSince: [
          {
            name: 'pastDate',
            params: {},
          },
        ],
      },
    }));

    await row2UpdateFormDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();
  });

  test('when update data access returns failure should render error messages', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    const row2Update = row2ActionIcons[0];

    expect(pageContainer.findComponent(FormDialog).exists()).toBeFalsy();

    await row2Update.trigger('click');

    await flushPromises();

    const row2UpdateFormDialogComp = pageContainer.findComponent(FormDialog);
    expect(row2UpdateFormDialogComp.exists()).toBeTruthy();

    await row2UpdateFormDialogComp.vm.$emit('submit', {
      id: '2',
      name: null,
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: new Date('2023-05-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    });

    await flushPromises();

    expect(updateRecord).toHaveBeenCalled('contacts', '2', expect.objectContaining({
      id: '2',
      name: null,
      accountNumber: '342-63462-742',
      contactNumber1: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: new Date('2023-05-12'),
      createdAt: '2023-03-05T06:15:26.206Z',
    }), false);

    expect(row2UpdateFormDialogComp.props()).toEqual(expect.objectContaining({
      errorMessages: {
        name: [
          {
            name: 'required',
            params: {},
          },
        ],
      },
    }));
  });

  test('when click delete action should render delete confirmation dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row1Cols = bodyRows[0].findAll('td');
    const row1Actions = row1Cols[5];
    const row1ActionIcons = row1Actions.findAll('i');
    const row1Delete = row1ActionIcons[1];
    expect(row1Delete.classes()).toContain('fa-trash-can');

    expect(pageContainer.findComponent(TConfirmDialog).exists()).toBeFalsy();

    await row1Delete.trigger('click');

    await flushPromises();

    const secondaryText = '' +
      '{\n' +
      '  "id": "1",\n' +
      '  "name": "Coffee Brew Apps",\n' +
      '  "accountNumber": null,\n' +
      '  "contactNumber1": "60238463",\n' +
      '  "tags": [],\n' +
      '  "establishedSince": "2023-03-21",\n' +
      '  "createdAt": "2023-02-13T17:42:51.235Z"\n' +
      '}';

    let row1DeleteConfirmDialogComp = pageContainer.findComponent(TConfirmDialog);
    expect(row1DeleteConfirmDialogComp.exists()).toBeTruthy();
    expect(row1DeleteConfirmDialogComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Delete Contacts 1',
      primaryText: 'Are you sure you want to delete Contacts 1?',
      secondaryText,
    }));

    await row1DeleteConfirmDialogComp.vm.$emit('cancel');

    await flushPromises();

    expect(pageContainer.findComponent(TConfirmDialog).exists()).toBeFalsy();

    await row1Delete.trigger('click');

    await flushPromises();

    row1DeleteConfirmDialogComp = pageContainer.findComponent(TConfirmDialog);
    expect(row1DeleteConfirmDialogComp.exists()).toBeTruthy();

    await row1DeleteConfirmDialogComp.vm.$emit('confirm');

    await flushPromises();

    expect(removeRecord).toHaveBeenCalledWith('contacts', '1');

    expect(pageContainer.findComponent(TConfirmDialog).exists()).toBeFalsy();

    const row2Cols = bodyRows[1].findAll('td');
    const row2Actions = row2Cols[5];
    const row2ActionIcons = row2Actions.findAll('i');
    const row2Delete = row2ActionIcons[1];

    await row2Delete.trigger('click');

    await flushPromises();

    const row2DeleteConfirmDialogComp = pageContainer.findComponent(TConfirmDialog);

    await row2DeleteConfirmDialogComp.vm.$emit('confirm');

    await flushPromises();

    expect(removeRecord).toHaveBeenCalledWith('contacts', '2');

    const errorAlertComp = pageContainer.findComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `Record is used`,
      width: 800,
      height: 400,
    }));
  });

  test('when click delete action should render delete confirmation dialog and close dialog', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row1Cols = bodyRows[0].findAll('td');
    const row1Actions = row1Cols[5];
    const row1ActionIcons = row1Actions.findAll('i');
    const row1Delete = row1ActionIcons[1];

    expect(pageContainer.findComponent(TConfirmDialog).exists()).toBeFalsy();

    await row1Delete.trigger('click');

    await flushPromises();

    const row1DeleteConfirmDialogComp = pageContainer.findComponent(TConfirmDialog);
    expect(row1DeleteConfirmDialogComp.exists()).toBeTruthy();

    await row1DeleteConfirmDialogComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(pageContainer.findComponent(TConfirmDialog).exists()).toBeFalsy();
  });

  test('when delete action view data access returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        view: vi.fn((modelClass, id, params) => {
          return new Promise((resolve, reject) => {
            reject({
              id: ['notFound'],
            });
          });
        }),
      });
    });

    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');

    const row1Cols = bodyRows[0].findAll('td');
    const row1Actions = row1Cols[5];
    const row1ActionIcons = row1Actions.findAll('i');
    const row1Delete = row1ActionIcons[1];

    await row1Delete.trigger('click');

    await flushPromises();

    const errorAlertComp = pageContainer.findComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "id": [\n        "notFound"\n    ]\n}`,
      width: 800,
      height: 400,
    }));
  });

  test('with filters should render filters', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        filters: {
          initData: {
            name: null,
            tags: [],
            establishedSince: {
              startDate: null,
              endDate: null,
            },
            createdAt: {
              startTime: null,
              endTime: null,
            },
          },
          layout: [
            { name: 'md' },
            { tags: 'lg' },
            { establishedSince: 'lg' },
            { createdAt: 'lg' },
          ],
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    expect(actions.length).toBe(3);

    const filterAction = actions[0];
    expect(filterAction.html()).toContain('Filter');

    const filters = pageContainer.get('.filters');
    expect(filters.exists()).toBeTruthy();

    const filtersForm = filters.getComponent(DataForm);
    expect(filtersForm.exists()).toBeTruthy();
    expect(filtersForm.props()).toEqual(expect.objectContaining({
      modelValue: {
        name: null,
        tags: [],
        establishedSince: {
          startDate: null,
          endDate: null,
        },
        createdAt: {
          startTime: null,
          endTime: null,
        },
      },
      fieldsLayout: [
        { name: 'md' },
        { tags: 'lg' },
        { establishedSince: 'lg' },
        { createdAt: 'lg' },
      ],
      dataFields: [
        'name',
        'tags',
        'establishedSince',
        'createdAt',
      ],
      schemas: [
        {
          key: 'name',
          type: 'text',
          label: 'Name',
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          sortable: true,
        },
        {
          key: 'tags',
          type: 'multiSelect',
          label: 'Tags',
          reference: { label: expect.anything() },
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
          options: {
            server: true,
            pagination: true,
            modelClass: 'tags',
            value: expect.anything(),
            label: expect.anything(),
          },
        },
        {
          key: 'establishedSince',
          type: 'daterange',
          label: 'Est. Since',
          defaultValue: expect.anything(),
          listable: true,
          viewable: true,
          creatable: true,
          updatable: true,
          filterable: true,
        },
        {
          key: 'createdAt',
          type: 'datetimerange',
          label: 'Created At',
          defaultValue: expect.anything(),
          listable: false,
          viewable: true,
          creatable: false,
          updatable: false,
          filterable: true,
        },
      ],
      errorMessages: {},
      confirmButton: {
        type: 'text',
        icon: 'fa-solid fa-check',
        value: 'Update Filters',
      },
      cancelButton: {
        type: 'text',
        icon: 'fa-solid fa-filter-circle-xmark',
        value: 'Reset Filters',
      },
    }));

    expect(filters.classes('collapsed')).toBeTruthy();

    await filterAction.trigger('click');

    await flushPromises();

    expect(filters.classes('expanded')).toBeTruthy();

    await filtersForm.vm.$emit('update:modelValue', {
      name: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: {
        startDate: null,
        endDate: null,
      },
      createdAt: {
        startTime: null,
        endTime: null,
      },
    });

    await filtersForm.vm.$emit('submit', {
      name: null,
      tags: [{ value: '1', label: 'company:abc' }],
      establishedSince: {
        startDate: null,
        endDate: null,
      },
      createdAt: {
        startTime: null,
        endTime: null,
      },
    });

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      filters: {
        tags: ['1'],
      },
    }));

    expect(filters.classes('collapsed')).toBeTruthy();

    await filterAction.trigger('click');

    await flushPromises();

    expect(filters.classes('expanded')).toBeTruthy();

    await filtersForm.vm.$emit('cancel');

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      filters: {},
    }));
  });

  test('when load schemas returns failure should flash error message', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        schemas: vi.fn(() => {
          return new Promise((resolve, reject) => {
            reject(new Error('unknown'));
          });
        }),
      });
    });

    await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    expect(flashMessage).toHaveBeenCalledWith('Error loading schemas!');
  });

  test('when load data returns failure should flash error message', async() => {
    useDataAccess.mockImplementation(() => {
      return Object.assign({}, mockDataAccess, {
        list: vi.fn((modelClass, params) => {
          return new Promise((resolve, reject) => {
            reject(new Error('unknown'));
          });
        }),
      });
    });

    await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    expect(flashMessage).toHaveBeenCalledWith('Error loading data!');
  });

  test('when click close toggle should collapse filters', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        filters: {
          initData: {
            name: null,
            tags: [],
          },
          layout: [
            { name: 'md' },
            { tags: 'lg' },
          ],
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const filterAction = actions[0];
    const filters = pageContainer.get('.filters');

    expect(filters.classes('collapsed')).toBeTruthy();

    await filterAction.trigger('click');

    await flushPromises();

    expect(filters.classes('expanded')).toBeTruthy();

    const toggles = filters.findAll('.toggle');
    const closeToggle = toggles.find(t => t.html().includes('Close'));
    expect(closeToggle.exists()).toBeTruthy();

    await closeToggle.trigger('click');

    await flushPromises();

    expect(filters.classes('collapsed')).toBeTruthy();
  });

  test('when keydown esc should collapse filters', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        filters: {
          initData: {
            name: null,
            tags: [],
          },
          layout: [
            { name: 'md' },
            { tags: 'lg' },
          ],
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');
    const actions = tableActions.findAll('.action');
    const filterAction = actions[0];
    const filters = pageContainer.get('.filters');

    expect(filters.classes('collapsed')).toBeTruthy();

    await filterAction.trigger('click');

    await flushPromises();

    expect(filters.classes('expanded')).toBeTruthy();

    await pageContainer.trigger('keydown.esc');

    await flushPromises();

    expect(filters.classes('collapsed')).toBeTruthy();
  });

  test('when keydown esc should collapse sort', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        tableStyle: {
          oneline: true,
          showHeader: false,
          highlightField: 'name',
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');

    const sortContainer = pageContainer.find('.sort-container');
    expect(sortContainer.exists()).toBeTruthy();
    expect(sortContainer.classes('collapsed')).toBeTruthy();

    const actions = tableActions.findAll('.action');

    const sortAction = actions[0];
    expect(sortAction.html()).toContain('Sort');

    await sortAction.trigger('click');

    await flushPromises();

    expect(sortContainer.classes('expanded')).toBeTruthy();

    await pageContainer.trigger('keydown.esc');

    await flushPromises();

    expect(sortContainer.classes('collapsed')).toBeTruthy();
  });

  test('when toggle sort should refresh data page', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableHeader = tableComp.get('thead');
    const tableCols = tableHeader.findAll('th');

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      sort: {
        field: 'id',
        order: 'asc',
      },
    }));

    const nameHeader = tableCols[1];
    const nameHeaderField = nameHeader.get('.header-field');

    await nameHeaderField.trigger('click');

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 0,
      sort: {
        field: 'name',
        order: 'asc',
      },
    }));

    await nameHeaderField.trigger('click');

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 0,
      sort: {
        field: 'name',
        order: 'desc',
      },
    }));

    const accountNumberHeader = tableCols[2];
    const accountNumberHeaderField = accountNumberHeader.get('.header-field');

    await accountNumberHeaderField.trigger('click');

    await flushPromises();

    expect(listRecords).not.toHaveBeenCalledWith('contacts', expect.objectContaining({
      sort: {
        field: 'accountNumber',
        order: 'asc',
      },
    }));
  });

  test('when table offset change should refresh data page', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 0,
    }));

    await tableComp.vm.$emit('offsetChange', 5);

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 5,
    }));
  });

  test('with oneline table style should render data page without header', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        tableStyle: {
          oneline: true,
          showHeader: false,
          highlightField: 'name',
        },
      },
      slots: {
        'data-col.contactNumber1': `
          <template #data-col.contactNumber1="{ formattedValue }">
            <span v-if="formattedValue">Contact {{ formattedValue }}</span>
          </template>
        `,
        'data-col.tags': `
          <template #data-col.tags="{ formattedValue }">
            <span class="tag" v-for="(tag, i) in formattedValue" :key="i">
              {{ tag }}
            </span>
          </template>
        `,
        'data-col.establishedSince': `
          <template #data-col.establishedSince="{ formattedValue }">
            <span v-if="formattedValue">Established since {{ formattedValue }}</span>
          </template>
        `,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableHeader = tableComp.get('thead');
    const tableCols = tableHeader.findAll('th');
    expect(tableCols.length).toBe(1);
    expect(tableCols[0].text()).toBe('');

    const tableBody = tableComp.get('tbody');
    const bodyRows = tableBody.findAll('tr');
    expect(bodyRows.length).toBe(2);

    const row1Cols = bodyRows[0].findAll('td');
    expect(row1Cols.length).toBe(2);

    const row1Content = row1Cols[0].get('.content-row');
    expect(row1Content.exists()).toBeTruthy();

    const row1Highlight = row1Content.get('.highlight');
    expect(row1Highlight.exists()).toBeTruthy();
    expect(row1Highlight.text()).toBe('Coffee Brew Apps');

    const row1SmallTexts = row1Content.findAll('.small');
    expect(row1SmallTexts.length).toBe(5);

    const row1Id = row1SmallTexts[0];
    expect(row1Id.text()).toBe('');

    const row1Name = row1SmallTexts[1];
    expect(row1Name.text()).toBe('');

    const row1ContactNumber = row1SmallTexts[2];
    expect(row1ContactNumber.text()).toBe('Contact 60238463');

    const row1Tags = row1SmallTexts[3];
    expect(row1Tags.text()).toBe('');

    const row1Established = row1SmallTexts[4];
    expect(row1Established.text()).toBe('Established since 21/03/2023');

    const row2Cols = bodyRows[1].findAll('td');
    expect(row2Cols.length).toBe(2);

    const row2Col = row2Cols[0];
    const row2Content = row2Col.get('.content-row');
    expect(row2Content.exists()).toBeTruthy();

    const row2Highlight = row2Content.get('.highlight');
    expect(row2Highlight.exists()).toBeTruthy();
    expect(row2Highlight.text()).toBe('Company ABC');

    const row2SmallTexts = row2Content.findAll('.small');
    expect(row2SmallTexts.length).toBe(5);

    const row2Id = row2SmallTexts[0];
    expect(row2Id.text()).toBe('');

    const row2Name = row2SmallTexts[1];
    expect(row2Name.text()).toBe('');

    const row2ContactNumber = row2SmallTexts[2];
    expect(row2ContactNumber.text()).toBe('');

    const row2Tags = row2SmallTexts[3];
    const row2RenderedTags = row2Tags.findAll('.tag');
    expect(row2RenderedTags.length).toBe(1);
    expect(row2RenderedTags[0].text()).toBe('company:abc');

    const row2Established = row2SmallTexts[4];
    expect(row2Established.text()).toBe('');

    expect(pageContainer.findComponent(ViewDialog).exists()).toBeFalsy();

    await row2Col.trigger('click');

    await flushPromises();

    const row2ViewDialogComp = pageContainer.findComponent(ViewDialog);
    expect(row2ViewDialogComp.exists()).toBeTruthy();
    expect(row2ViewDialogComp.props()).toEqual(expect.objectContaining({
      record: {
        id: '2',
        name: 'Company ABC',
        accountNumber: null,
        contactNumber1: null,
        tags: ['1'],
        establishedSince: null,
        createdAt: '2023-03-05T06:15:26.206Z',
        includes: {
          tags: {
            1: tags['1'],
          },
        },
      },
      title: 'View Contacts 2',
    }));
  });

  test('with oneline table style should render sort form', async() => {
    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
        tableStyle: {
          oneline: true,
          showHeader: false,
          highlightField: 'name',
        },
      },
      slots: {
        'data-col.contactNumber1': `
          <template #data-col.contactNumber1="{ formattedValue }">
            <span v-if="formattedValue">Contact {{ formattedValue }}</span>
          </template>
        `,
        'data-col.tags': `
          <template #data-col.tags="{ formattedValue }">
            <span class="tag" v-for="(tag, i) in formattedValue" :key="i">
              {{ tag }}
            </span>
          </template>
        `,
        'data-col.establishedSince': `
          <template #data-col.establishedSince="{ formattedValue }">
            <span v-if="formattedValue">Established since {{ formattedValue }}</span>
          </template>
        `,
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const tableComp = pageContainer.getComponent(TTable);
    const tableActions = tableComp.get('.table-actions');

    const sortContainer = pageContainer.find('.sort-container');
    expect(sortContainer.exists()).toBeTruthy();
    expect(sortContainer.classes('collapsed')).toBeTruthy();

    const actions = tableActions.findAll('.action');

    const sortAction = actions[0];
    expect(sortAction.html()).toContain('Sort');

    await sortAction.trigger('click');

    expect(sortContainer.classes('expanded')).toBeTruthy();

    const sortFields = sortContainer.get('.sort-fields');
    expect(sortFields.exists()).toBeTruthy();

    const sortableHeaders = sortFields.findAll('.header-field.sort');
    expect(sortableHeaders.length).toBe(2);

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      sort: {
        field: 'id',
        order: 'asc',
      },
    }));

    const nameHeaderSort = sortableHeaders[1];

    await nameHeaderSort.trigger('click');

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 0,
      sort: {
        field: 'name',
        order: 'asc',
      },
    }));

    await nameHeaderSort.trigger('click');

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      offset: 0,
      sort: {
        field: 'name',
        order: 'desc',
      },
    }));

    const toggle = sortContainer.get('.toggle');
    expect(toggle.exists()).toBeTruthy();

    await toggle.trigger('click');

    expect(sortContainer.classes('collapsed')).toBeTruthy();
  });

  test('when unmount component should unregister events', async() => {
    const registerListener = vi.spyOn(eventsStore, 'registerListener');
    const unregisterListener = vi.spyOn(eventsStore, 'unregisterListener');

    const wrapper = await mount(DataPage, {
      global: {
        stubs,
      },
      props: {
        dataType: 'Contacts',
        modelClass: 'contacts',
        dataFields,
        fieldsLayout,
      },
    });

    await flushPromises();

    expect(registerListener).toHaveBeenCalledWith('loadData', {
      id: 'DataPage-Contacts',
      invoke: expect.anything(),
    });

    await eventsStore.emitEvent('loadData', {
      dataType: 'Contacts',
      filters: {
        name: 'Coffee Brew Apps',
      },
    });

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      filters: expect.objectContaining({
        name: 'Coffee Brew Apps',
      }),
    }));

    await eventsStore.emitEvent('loadData', {
      dataType: 'Contacts',
    });

    await flushPromises();

    expect(listRecords).toHaveBeenCalledWith('contacts', expect.objectContaining({
      filters: {},
    }));

    await eventsStore.emitEvent('loadData', {
      dataType: 'Tags',
      filters: {
        category: 'company',
      },
    });

    await flushPromises();

    expect(listRecords).not.toHaveBeenCalledWith('contacts', expect.objectContaining({
      filters: expect.objectContaining({
        category: 'company',
      }),
    }));

    await wrapper.unmount();

    await flushPromises();

    expect(unregisterListener).toHaveBeenCalledWith('loadData', {
      id: 'DataPage-Contacts',
    });
  });
});
