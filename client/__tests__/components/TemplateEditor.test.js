import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter } from 'vue-router';
import { Liquid } from 'liquidjs';
import {
  TDialog,
  TButton,
  TProgressBar,
  TTextarea
} from 'coffeebrew-vue-components';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import TabContainer from '../../src/components/TabContainer.vue';
import TemplateEditor from '../../src/components/TemplateEditor.vue';

vi.mock('vue-router', () => {
  return {
    useRouter: vi.fn(),
  };
});

vi.mock('liquidjs', () => {
  return {
    Liquid: vi.fn(),
  };
});

vi.mock('../../src/utils/dataAccess.js');

const addRoute = vi.fn();
const push = vi.fn();

const parseAndRender = vi.fn();

const createUrl = vi.fn((blob) => {
  return 'http://localhost/pdf';
});

beforeEach(async() => {
  setActivePinia(createPinia());

  global.window.URL.createObjectURL = createUrl;

  useDataAccess.mockImplementation(() => {
    return {
      downloadStream: vi.fn((templateType, id, data, { path }) => {
        return new Promise((resolve, reject) => {
          resolve({
            data: '<div class="invoice-container"><div class="id">Invoice ID: 1</div></div>',
          });
        });
      }),
    };
  });

  useRouter.mockImplementation(() => {
    return {
      addRoute,
      currentRoute: {
        value: {
          path: '/document_templates/invoice_templates/1',
          name: 'View Template',
        },
      },
      push,
    };
  });

  Liquid.mockImplementation(() => {
    return {
      parseAndRender,
    };
  });

  parseAndRender.mockImplementation(async() => {
    return new Promise((resolve, reject) => {
      resolve('<div class="invoice-container"><div class="id">Invoice ID: 1</div></div>');
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const contentMarkup = '<div class="invoice-container"></div>';

const contentStyles = '.invoice-container { width: 100%; }';

const data = {
  invoice: {
    id: '1',
    dueDate: '2023-10-31',
  },
};

describe('TemplateEditor.vue', () => {
  test('should render template editor with PDF preview', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    expect(previewTemplate.exists()).toBeTruthy();

    const templateEditor = previewTemplate.get('.template-editor');
    expect(templateEditor.exists()).toBeTruthy();

    const tabContainerComp = templateEditor.getComponent(TabContainer);
    expect(tabContainerComp.exists()).toBeTruthy();
    expect(tabContainerComp.props()).toEqual(expect.objectContaining({
      selectedTab: 0,
    }));

    const tabs = tabContainerComp.findAll('.tab-content');
    expect(tabs.length).toBe(3);

    const contentMarkupTab = tabs[0];
    const markupTextareaComp = contentMarkupTab.getComponent(TTextarea);
    expect(markupTextareaComp.exists()).toBeTruthy();
    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const contentStylesTab = tabs[1];
    const stylesTextareaComp = contentStylesTab.getComponent(TTextarea);
    expect(stylesTextareaComp.exists()).toBeTruthy();
    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const sampleDataTab = tabs[2];
    const sampleDataTextareaComp = sampleDataTab.getComponent(TTextarea);
    expect(sampleDataTextareaComp.exists()).toBeTruthy();
    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '' +
      '{\n' +
      '    "invoice": {\n' +
      '        "id": "1",\n' +
      '        "dueDate": "2023-10-31"\n' +
      '    }\n' +
      '}',
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const previewContainer = previewTemplate.get('.preview-container');
    expect(previewContainer.exists()).toBeTruthy();

    const previewContent = previewContainer.get('.preview-content');
    expect(previewContent.exists()).toBeTruthy();

    const stylesContainer = previewContainer.get('style');
    expect(stylesContainer.exists()).toBeTruthy();
  });

  test('when click on Generate button should render PDF in dialog', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const previewContainer = previewTemplate.get('.preview-container');

    const previewDialog = previewTemplate.getComponent(TDialog);
    expect(previewDialog.exists()).toBeTruthy();
    expect(previewDialog.props()).toEqual(expect.objectContaining({
      modelValue: false,
      title: 'Generating PDF',
    }));

    const buttons = previewContainer.get('.buttons');
    const generateButton = buttons.getComponent(TButton);
    expect(generateButton.exists()).toBeTruthy();

    await generateButton.vm.$emit('click');

    expect(previewDialog.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Generating PDF',
    }));

    const progressBarComp = previewDialog.findComponent(TProgressBar);
    expect(progressBarComp.exists()).toBeTruthy();

    const previewMessage = previewDialog.get('.message');
    expect(previewMessage.exists()).toBeTruthy();
    expect(previewMessage.text()).toBe('Generating PDF...');

    await flushPromises();

    expect(createUrl).toHaveBeenCalledWith(expect.anything());

    expect(addRoute).toHaveBeenCalledWith(expect.objectContaining({
      path: '/document_templates/:templateType/:id/pdf',
      name: 'View Pdf',
      component: expect.anything(),
      props: {
        templatePdfData: 'http://localhost/pdf',
        downloadLink: 'http://localhost/pdf',
        downloadFile: 'invoice_templates_1.pdf',
      },
      meta: {
        parentRoute: { name: 'View Template' },
        hidden: true,
      },
    }));

    expect(push).toHaveBeenCalledWith({
      name: 'View Pdf',
      params: {
        templateType: 'invoice_templates',
        id: '1',
      },
    });

    expect(previewDialog.props()).toEqual(expect.objectContaining({
      modelValue: false,
      title: 'Generating PDF',
    }));
  });

  test('when not disabled should render markup editor buttons', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const templateEditor = previewTemplate.get('.template-editor');
    const tabContainerComp = templateEditor.getComponent(TabContainer);
    const tabs = tabContainerComp.findAll('.tab-content');

    const contentMarkupTab = tabs[0];
    const contentMarkupButtons = contentMarkupTab.findAll('.editor-button');
    expect(contentMarkupButtons.length).toBe(3);

    const markupTextareaComp = contentMarkupTab.getComponent(TTextarea);
    expect(markupTextareaComp.exists()).toBeTruthy();
    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const markupEditButton = contentMarkupButtons[1];
    await markupEditButton.trigger('click');

    await flushPromises();

    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      disabled: false,
    }));

    const markupCancelButton = contentMarkupButtons[0];
    await markupCancelButton.trigger('click');

    await flushPromises();

    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      disabled: true,
    }));

    expect(wrapper.emitted().contentMarkupChange).toBeUndefined();

    await markupEditButton.trigger('click');

    await flushPromises();

    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      disabled: false,
    }));

    const markupConfirmButton = contentMarkupButtons[2];
    await markupConfirmButton.trigger('click');

    await flushPromises();

    expect(markupTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '<div class="invoice-container"></div>',
      disabled: true,
    }));

    const markupChangeEvents = wrapper.emitted().contentMarkupChange;
    expect(markupChangeEvents.length).toBe(1);

    parseAndRender.mockImplementation(async() => {
      return new Promise((resolve, reject) => {
        reject(new Error('invalid template'));
      });
    });

    await markupConfirmButton.trigger('click');

    await flushPromises();

    const previewContainer = previewTemplate.get('.preview-container');
    const previewContent = previewContainer.get('.preview-content');
    expect(previewContent.exists()).toBeTruthy();
    expect(previewContent.classes('error')).toBeTruthy();
    expect(previewContent.text()).toBe('Markup error');
  });

  test('when not disabled should render styles editor buttons', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const templateEditor = previewTemplate.get('.template-editor');
    const tabContainerComp = templateEditor.getComponent(TabContainer);
    const tabs = tabContainerComp.findAll('.tab-content');

    const contentStylesTab = tabs[1];
    const contentStylesButtons = contentStylesTab.findAll('.editor-button');

    const stylesTextareaComp = contentStylesTab.getComponent(TTextarea);
    expect(stylesTextareaComp.exists()).toBeTruthy();
    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const stylesEditButton = contentStylesButtons[1];
    await stylesEditButton.trigger('click');

    await flushPromises();

    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      disabled: false,
    }));

    const stylesCancelButton = contentStylesButtons[0];
    await stylesCancelButton.trigger('click');

    await flushPromises();

    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      disabled: true,
    }));

    expect(wrapper.emitted().contentStylesChange).toBeUndefined();

    await stylesEditButton.trigger('click');

    await flushPromises();

    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      disabled: false,
    }));

    const stylesConfirmButton = contentStylesButtons[2];
    await stylesConfirmButton.trigger('click');

    await flushPromises();

    expect(stylesTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: '.invoice-container { width: 100%; }',
      disabled: true,
    }));

    const stylesChangeEvents = wrapper.emitted().contentStylesChange;
    expect(stylesChangeEvents.length).toBe(1);
  });

  test('when not disabled should render data editor buttons', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const templateEditor = previewTemplate.get('.template-editor');

    const tabContainerComp = templateEditor.getComponent(TabContainer);
    expect(tabContainerComp.props()).toEqual(expect.objectContaining({
      selectedTab: 0,
    }));

    await tabContainerComp.vm.$emit('tabChange', 2);
    expect(tabContainerComp.props()).toEqual(expect.objectContaining({
      selectedTab: 2,
    }));

    const tabs = tabContainerComp.findAll('.tab-content');
    const sampleDataTab = tabs[2];
    const sampleDataButtons = sampleDataTab.findAll('.editor-button');

    const sampleDataTextareaComp = sampleDataTab.getComponent(TTextarea);
    expect(sampleDataTextareaComp.exists()).toBeTruthy();
    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      modelValue: `{\n    "invoice": {\n        "id": "1",\n        "dueDate": "2023-10-31"\n    }\n}`,
      label: '',
      rows: 30,
      disabled: true,
      errorMessage: '',
    }));

    const dataEditButton = sampleDataButtons[1];
    await dataEditButton.trigger('click');

    await flushPromises();

    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      disabled: false,
    }));

    const dataCancelButton = sampleDataButtons[0];
    await dataCancelButton.trigger('click');

    await flushPromises();

    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      disabled: true,
    }));

    expect(wrapper.emitted().sampleDataChange).toBeUndefined();

    await dataEditButton.trigger('click');

    await flushPromises();

    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      disabled: false,
    }));

    const dataConfirmButton = sampleDataButtons[2];
    await dataConfirmButton.trigger('click');

    await flushPromises();

    expect(sampleDataTextareaComp.props()).toEqual(expect.objectContaining({
      disabled: true,
    }));

    const dataChangeEvents = wrapper.emitted().dataChange;
    expect(dataChangeEvents.length).toBe(1);

    parseAndRender.mockImplementation(async() => {
      return new Promise((resolve, reject) => {
        reject(new Error('invalid template'));
      });
    });

    await dataConfirmButton.trigger('click');

    await flushPromises();

    const previewContainer = previewTemplate.get('.preview-container');
    const previewContent = previewContainer.get('.preview-content');
    expect(previewContent.exists()).toBeTruthy();
    expect(previewContent.classes('error')).toBeTruthy();
    expect(previewContent.text()).toBe('Sample data error');
  });

  test('when disabled should not render disabled editor', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: true,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const templateEditor = previewTemplate.get('.template-editor');
    const tabContainerComp = templateEditor.getComponent(TabContainer);
    const tabs = tabContainerComp.findAll('.tab-content');

    const contentMarkupTab = tabs[0];
    const contentMarkupEditor = contentMarkupTab.get('.editor');
    expect(contentMarkupEditor.exists()).toBeTruthy();
    expect(contentMarkupEditor.classes('disabled')).toBeTruthy();
  });

  test('when no sample data should render null parsed markup', async() => {
    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data: null,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    expect(previewTemplate.exists()).toBeTruthy();

    const previewContainer = previewTemplate.get('.preview-container');
    expect(previewContainer.exists()).toBeTruthy();

    const previewContent = previewContainer.get('.preview-content');
    expect(previewContent.exists()).toBeTruthy();
    expect(previewContent.classes('error')).toBeFalsy();
  });

  test('when render preview returns failure should render error message', async() => {
    parseAndRender.mockImplementation(async() => {
      return new Promise((resolve, reject) => {
        reject(new Error('invalid template'));
      });
    });

    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    expect(previewTemplate.exists()).toBeTruthy();

    const templateEditor = previewTemplate.get('.template-editor');
    const tabContainerComp = templateEditor.getComponent(TabContainer);
    const tabs = tabContainerComp.findAll('.tab-content');

    const sampleDataTab = tabs[2];
    const sampleDataButtons = sampleDataTab.findAll('.editor-button');
    expect(sampleDataButtons.length).toBe(3);

    const previewContainer = previewTemplate.get('.preview-container');
    expect(previewContainer.exists()).toBeTruthy();

    const previewContent = previewContainer.get('.preview-content');
    expect(previewContent.exists()).toBeTruthy();
    expect(previewContent.classes('error')).toBeTruthy();
    expect(previewContent.text()).toBe('Render error');
  });

  test('when generate template returns failure should render error message', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        downloadStream: vi.fn((templateType, id, data, { path }) => {
          return new Promise((resolve, reject) => {
            reject(new Error('invalid pdf'));
          });
        }),
      };
    });

    const wrapper = await mount(TemplateEditor, {
      props: {
        id: '1',
        contentMarkup,
        contentStyles,
        disabled: false,
        data,
        errorMessages: {},
        enableGenerate: true,
        templateType: 'invoice_templates',
      },
    });

    await flushPromises();

    const previewTemplate = wrapper.get('.preview-template');
    const previewContainer = previewTemplate.get('.preview-container');

    const buttons = previewContainer.get('.buttons');
    const generateButton = buttons.getComponent(TButton);

    await generateButton.vm.$emit('click');

    await flushPromises();

    expect(createUrl).not.toHaveBeenCalledWith();
    expect(addRoute).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalledWith();

    const previewDialog = previewTemplate.getComponent(TDialog);
    expect(previewDialog.exists()).toBeTruthy();
    expect(previewDialog.props()).toEqual(expect.objectContaining({
      modelValue: true,
      title: 'Generating PDF',
    }));

    const progressBarComp = previewDialog.findComponent(TProgressBar);
    expect(progressBarComp.exists()).toBeFalsy();

    const previewMessage = previewDialog.get('.message');
    expect(previewMessage.exists()).toBeTruthy();
    expect(previewMessage.text()).toBe('Error generating template');
  });
});
