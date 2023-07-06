import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TAlert,
  TTextarea,
  TSelect,
  TButton
} from 'coffeebrew-vue-components';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import { useBannerStore } from '../../src/stores/banner.js';
import DataAdmin from '../../src/views/DataAdmin.vue';

vi.mock('../../src/utils/dataAccess.js');

vi.mock('../../src/stores/banner.js');

const schemas = vi.fn(() => {
  return new Promise((resolve, reject) => {
    resolve([
      'alerts',
      'contacts',
      'tags',
    ]);
  });
});

const listRecords = vi.fn((modelClass) => {
  return new Promise((resolve, reject) => {
    if (modelClass === 'contacts') {
      resolve({
        data: [
          {
            id: '1',
            name: 'Your Company',
          },
        ],
      });
    } else if (modelClass === 'indexes') {
      resolve({
        data: {
          unique: {},
          foreign: {},
          filter: {},
        },
      });
    } else if (modelClass === 'tags') {
      reject({
        root: ['unknown'],
      });
    } else {
      resolve({ data: [] });
    }
  });
});

const uploadRecords = vi.fn((modelClass, data) => {
  return new Promise((resolve, reject) => {
    resolve({
      data,
    });
  });
});

const flashMessage = vi.fn();

beforeEach(async() => {
  setActivePinia(createPinia());

  useDataAccess.mockImplementation(() => {
    return {
      schemas,
      list: listRecords,
      upload: uploadRecords,
    };
  });

  useBannerStore.mockImplementation(() => {
    return {
      flashMessage,
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DataAdmin.vue', () => {
  test('should init form with schemas', async() => {
    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();

    const selectComp = pageContainer.getComponent(TSelect);
    expect(selectComp.exists()).toBeTruthy();

    const selectOptions = selectComp.props().options;
    expect(selectOptions).toEqual([
      { value: 'indexes', label: 'Indexes' },
      { value: 'alerts', label: 'alerts' },
      { value: 'contacts', label: 'contacts' },
      { value: 'tags', label: 'tags' },
    ]);
  });

  test('when schema selected has data should load data', async() => {
    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const textareaComp = pageContainer.getComponent(TTextarea);
    expect(textareaComp.exists()).toBeTruthy();
    expect(textareaComp.props().modelValue).toBe('');

    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('contacts');

    await flushPromises();

    const textareaValue = textareaComp.props().modelValue;
    expect(textareaValue).toEqual(
      '[\n' +
      '    {\n' +
      '        "id": "1",\n' +
      '        "name": "Your Company"\n' +
      '    }\n' +
      ']'
    );
  });

  test('when schema selected has no data should load empty data', async() => {
    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const textareaComp = pageContainer.getComponent(TTextarea);
    expect(textareaComp.exists()).toBeTruthy();
    expect(textareaComp.props().modelValue).toBe('');

    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('alerts');

    await flushPromises();

    const textareaValue = textareaComp.props().modelValue;
    expect(textareaValue).toBe('[]');
  });

  test('when schema selected returns failure should render error alert', async() => {
    const wrapper = await mount(DataAdmin);
    expect(wrapper.vm.errorAlert).toBeFalsy();
    expect(wrapper.vm.errorContent).toBe('');

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const textareaComp = pageContainer.getComponent(TTextarea);
    expect(textareaComp.exists()).toBeTruthy();
    expect(textareaComp.props().modelValue).toBe('');

    expect(pageContainer.findComponent(TAlert).exists()).toBeFalsy();

    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('tags');

    await flushPromises();

    const textareaValue = textareaComp.props().modelValue;
    expect(textareaValue).toBe('');

    const alertComp = pageContainer.findComponent(TAlert);
    expect(alertComp.exists()).toBeTruthy();
    expect(alertComp.props().content).toEqual(
      '{\n' +
      '    "root": [\n' +
      '        "unknown"\n' +
      '    ]\n' +
      '}'
    );

    expect(wrapper.vm.errorAlert).toBeTruthy();
    expect(wrapper.vm.errorContent).toEqual(
      '{\n' +
      '    "root": [\n' +
      '        "unknown"\n' +
      '    ]\n' +
      '}'
    );

    expect(flashMessage).toHaveBeenCalledWith('Error fetching tags data!');
  });

  test('when upload indexes should re-render updated indexes', async() => {
    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const textareaComp = pageContainer.getComponent(TTextarea);
    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('indexes');

    await flushPromises();

    expect(textareaComp.props().modelValue).toEqual(
      '{\n' +
      '    "unique": {},\n' +
      '    "foreign": {},\n' +
      '    "filter": {}\n' +
      '}'
    );

    textareaComp.setValue('{"unique":{"tags":{"category|name":{"company|abc":"1"}}},"foreign":{},"filter":{}}');

    const submitButton = pageContainer.getComponent(TButton);
    expect(submitButton.exists()).toBeTruthy();
    await submitButton.trigger('click');

    await flushPromises();

    const textareaValue = textareaComp.props().modelValue;
    expect(textareaValue).toEqual(
      '{\n' +
      '    "unique": {\n' +
      '        "tags": {\n' +
      '            "category|name": {\n' +
      '                "company|abc": "1"\n' +
      '            }\n' +
      '        }\n' +
      '    },\n' +
      '    "foreign": {},\n' +
      '    "filter": {}\n' +
      '}'
    );

    expect(uploadRecords).toHaveBeenCalledWith('indexes', {
      unique: {
        tags: {
          'category|name': {
            'company|abc': '1',
          },
        },
      },
      foreign: {},
      filter: {},
    });

    expect(flashMessage).toHaveBeenCalledWith('Updated indexes successfully!');
  });

  test('when upload model data should re-render updated model', async() => {
    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const textareaComp = pageContainer.getComponent(TTextarea);
    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('alerts');

    await flushPromises();

    expect(textareaComp.props().modelValue).toBe('[]');

    textareaComp.setValue('[{ "id": "1", "heading": "New payment due", "includes": {} }]');

    const submitButton = pageContainer.getComponent(TButton);
    expect(submitButton.exists()).toBeTruthy();
    await submitButton.trigger('click');

    await flushPromises();

    await selectComp.setValue('alerts');

    await flushPromises();

    expect(uploadRecords).toHaveBeenCalledWith('alerts', {
      1: {
        id: '1',
        heading: 'New payment due',
      },
    });

    expect(flashMessage).toHaveBeenCalledWith('Updated alerts data successfully!');
  });

  test('when fetch model schemas returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        schemas: vi.fn(() => {
          return new Promise((resolve, reject) => {
            reject({ root: ['unknown'] });
          });
        }),
        list: listRecords,
        upload: uploadRecords,
      };
    });

    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();

    const selectComp = pageContainer.getComponent(TSelect);
    expect(selectComp.exists()).toBeTruthy();

    const selectOptions = selectComp.props().options;
    expect(selectOptions).toEqual([
      { value: 'indexes', label: 'Indexes' },
    ]);

    const errorAlertComp = pageContainer.getComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "root": [\n        "unknown"\n    ]\n}`,
    }));

    expect(flashMessage).toHaveBeenCalledWith('Error loading model class options!');

    await errorAlertComp.vm.$emit('update:modelValue', false);

    await flushPromises();

    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: false,
    }));
  });

  test('when upload indexes returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        schemas,
        list: listRecords,
        upload: vi.fn((modelClass, data) => {
          return new Promise((resolve, reject) => {
            reject({ root: ['invalid json'] });
          });
        }),
      };
    });

    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('indexes');

    await flushPromises();

    const submitButton = pageContainer.getComponent(TButton);
    await submitButton.trigger('click');

    await flushPromises();

    const errorAlertComp = pageContainer.getComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "root": [\n        "invalid json"\n    ]\n}`,
    }));

    expect(flashMessage).toHaveBeenCalledWith('Error updating indexes!');
  });

  test('when upload model data returns failure should render error alert', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        schemas,
        list: listRecords,
        upload: vi.fn((modelClass, data) => {
          return new Promise((resolve, reject) => {
            reject({ root: ['invalid json'] });
          });
        }),
      };
    });

    const wrapper = await mount(DataAdmin);

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');

    const selectComp = pageContainer.getComponent(TSelect);
    selectComp.setValue('alerts');

    await flushPromises();

    const submitButton = pageContainer.getComponent(TButton);
    await submitButton.trigger('click');

    await flushPromises();

    const errorAlertComp = pageContainer.getComponent(TAlert);
    expect(errorAlertComp.exists()).toBeTruthy();
    expect(errorAlertComp.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Error',
      content: `{\n    "root": [\n        "invalid json"\n    ]\n}`,
    }));

    expect(flashMessage).toHaveBeenCalledWith('Error updating alerts data!');
  });
});
