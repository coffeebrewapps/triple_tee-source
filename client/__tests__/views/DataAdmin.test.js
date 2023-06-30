import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TAlert,
  TTextarea,
  TSelect,
  TButton
} from 'coffeebrew-vue-components';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import DataAdmin from '../../src/views/DataAdmin.vue';

vi.mock('../../src/utils/dataAccess.js');

beforeEach(async() => {
  setActivePinia(createPinia());

  useDataAccess.mockImplementation(() => {
    return {
      schemas: vi.fn(() => {
        return new Promise((resolve, reject) => {
          resolve([
            'alerts',
            'contacts',
            'tags',
          ]);
        });
      }),
      list: vi.fn((modelClass) => {
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
      }),
      upload: vi.fn((modelClass, data) => {
        return new Promise((resolve, reject) => {
          resolve({
            data,
          });
        });
      }),
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

  test('when schema selected return failure should render error message', async() => {
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
    submitButton.trigger('click');

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
  });
});
