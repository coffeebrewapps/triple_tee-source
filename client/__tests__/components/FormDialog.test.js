import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import DataForm from '../../src/components/DataForm.vue';
import FormDialog from '../../src/components/FormDialog.vue';

const MockDataForm = defineComponent({
  props: {
    modelValue: {
      type: Object,
      default() {
        return {};
      },
    },
    fieldsLayout: {
      type: Array,
      default() {
        return [];
      },
    },
    dataFields: {
      type: Array,
      default() {
        return [];
      },
    },
    schemas: {
      type: Array,
      default() {
        return [];
      },
    },
    errorMessages: {
      type: Object,
      default() {
        return {};
      },
    },
    compact: {
      type: Boolean,
      default: false,
    },
    submittable: {
      type: Boolean,
      default: true,
    },
    confirmButton: {
      type: Object,
      default() {
        return {
          type: 'text',
          icon: 'fa-solid fa-check',
          value: 'Confirm',
        };
      },
    },
    cancelButton: {
      type: Object,
      default() {
        return {
          type: 'text',
          icon: 'fa-solid fa-xmark',
          value: 'Cancel',
        };
      },
    },
  },
  template: '<div class="form"></div>',
});

beforeEach(async() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

const stubs = {
  DataForm: MockDataForm,
};

const formData = {
  id: '1',
  name: 'Your Company',
};

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
];

const fieldsLayout = [
  { id: 'sm', name: 'md' },
];

const dataFields = [
  'name',
];

describe('FormDialog.vue', () => {
  test('should render form in dialog', async() => {
    const wrapper = await mount(FormDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: true,
        data: formData,
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formDialog = wrapper.get('.form-dialog');
    expect(formDialog.exists()).toBeTruthy();

    const dataFormComp = formDialog.findComponent(DataForm);
    expect(dataFormComp.exists()).toBeTruthy();

    expect(dataFormComp.props()).toEqual(expect.objectContaining({
      modelValue: formData,
      fieldsLayout,
      dataFields,
      schemas,
      errorMessages: {},
    }));
  });

  test('when data form emit submit event should propagate event', async() => {
    const wrapper = await mount(FormDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: true,
        data: formData,
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formDialog = wrapper.get('.form-dialog');
    const dataFormComp = formDialog.findComponent(DataForm);

    await dataFormComp.vm.$emit('submit', Object.assign({}, formData, { name: 'Coffee Brew Apps' }));

    await flushPromises();

    const submitEvents = wrapper.emitted().submit;
    expect(submitEvents.length).toBe(1);
    expect(submitEvents[0]).toEqual([
      {
        id: '1',
        name: 'Coffee Brew Apps',
      },
    ]);
  });

  test('when data form emit cancel event should close dialog', async() => {
    const wrapper = await mount(FormDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: true,
        data: formData,
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formDialog = wrapper.get('.form-dialog');
    const dataFormComp = formDialog.findComponent(DataForm);

    await dataFormComp.vm.$emit('cancel');

    await flushPromises();

    const cancelEvents = wrapper.emitted()['update:modelValue'];
    expect(cancelEvents.length).toBe(1);
    expect(cancelEvents[0]).toEqual([false]);
  });

  test('when given error content should close dialog', async() => {
    const wrapper = await mount(FormDialog, {
      global: {
        stubs,
      },
      props: {
        modelValue: true,
        data: formData,
        schemas,
        fieldsLayout,
        dataFields,
        errorMessages: {},
      },
    });

    await flushPromises();

    const formDialog = wrapper.get('.form-dialog');
    const dataFormComp = formDialog.findComponent(DataForm);

    await dataFormComp.vm.$emit('cancel');

    await flushPromises();

    const cancelEvents = wrapper.emitted()['update:modelValue'];
    expect(cancelEvents.length).toBe(1);
    expect(cancelEvents[0]).toEqual([false]);
  });
});
