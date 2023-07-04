import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useRouter } from 'vue-router';
import { Liquid } from 'liquidjs';
import {
  TButton
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
    const contentMarkupContent = contentMarkupTab.get('.editor-content');
    expect(contentMarkupContent.exists()).toBeTruthy();
    expect(contentMarkupContent.attributes('contenteditable')).toBe('false');
    expect(contentMarkupContent.text()).toBe(contentMarkup);

    const contentStylesTab = tabs[1];
    const contentStylesContent = contentStylesTab.get('.editor-content');
    expect(contentStylesContent.exists()).toBeTruthy();
    expect(contentStylesContent.attributes('contenteditable')).toBe('false');
    expect(contentStylesContent.text()).toBe(contentStyles);

    const sampleDataTab = tabs[2];
    const sampleDataContent = sampleDataTab.get('.editor-content');
    expect(sampleDataContent.exists()).toBeTruthy();
    expect(sampleDataContent.attributes('contenteditable')).toBe('false');
    expect(sampleDataContent.text()).toBe(
      '{\n' +
      '  "invoice": {\n' +
      '    "id": "1",\n' +
      '    "dueDate": "2023-10-31"\n' +
      '  }\n' +
      '}'
    );

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

    const buttons = previewContainer.get('.buttons');
    const generateButton = buttons.getComponent(TButton);
    expect(generateButton.exists()).toBeTruthy();

    generateButton.vm.$emit('click');

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

    const contentMarkupContent = contentMarkupTab.get('.editor-content');
    expect(contentMarkupContent.attributes('contenteditable')).toBe('false');

    const markupEditButton = contentMarkupButtons[1];
    markupEditButton.trigger('click');

    await flushPromises();

    expect(contentMarkupContent.attributes('contenteditable')).toBe('true');

    const markupCancelButton = contentMarkupButtons[0];
    markupCancelButton.trigger('click');

    await flushPromises();

    expect(contentMarkupContent.attributes('contenteditable')).toBe('false');

    expect(wrapper.emitted().contentMarkupChange).toBeUndefined();

    markupEditButton.trigger('click');

    await flushPromises();

    expect(contentMarkupContent.attributes('contenteditable')).toBe('true');

    const markupConfirmButton = contentMarkupButtons[2];
    markupConfirmButton.trigger('click');

    await flushPromises();

    expect(contentMarkupContent.attributes('contenteditable')).toBe('false');

    const markupChangeEvents = wrapper.emitted().contentMarkupChange;
    expect(markupChangeEvents.length).toBe(1);
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

    const contentStylesContent = contentStylesTab.get('.editor-content');
    expect(contentStylesContent.attributes('contenteditable')).toBe('false');

    const stylesEditButton = contentStylesButtons[1];
    stylesEditButton.trigger('click');

    await flushPromises();

    expect(contentStylesContent.attributes('contenteditable')).toBe('true');

    const stylesCancelButton = contentStylesButtons[0];
    stylesCancelButton.trigger('click');

    await flushPromises();

    expect(contentStylesContent.attributes('contenteditable')).toBe('false');

    expect(wrapper.emitted().contentStylesChange).toBeUndefined();

    stylesEditButton.trigger('click');

    await flushPromises();

    expect(contentStylesContent.attributes('contenteditable')).toBe('true');

    const stylesConfirmButton = contentStylesButtons[2];
    stylesConfirmButton.trigger('click');

    await flushPromises();

    expect(contentStylesContent.attributes('contenteditable')).toBe('false');

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
    const tabs = tabContainerComp.findAll('.tab-content');

    const sampleDataTab = tabs[2];
    const sampleDataButtons = sampleDataTab.findAll('.editor-button');

    const sampleDataContent = sampleDataTab.get('.editor-content');
    expect(sampleDataContent.attributes('contenteditable')).toBe('false');

    const dataEditButton = sampleDataButtons[1];
    dataEditButton.trigger('click');

    await flushPromises();

    expect(sampleDataContent.attributes('contenteditable')).toBe('true');

    const dataCancelButton = sampleDataButtons[0];
    dataCancelButton.trigger('click');

    await flushPromises();

    expect(sampleDataContent.attributes('contenteditable')).toBe('false');

    expect(wrapper.emitted().sampleDataChange).toBeUndefined();

    dataEditButton.trigger('click');

    await flushPromises();

    expect(sampleDataContent.attributes('contenteditable')).toBe('true');

    const dataConfirmButton = sampleDataButtons[2];
    dataConfirmButton.trigger('click');

    await flushPromises();

    expect(sampleDataContent.attributes('contenteditable')).toBe('false');

    const dataChangeEvents = wrapper.emitted().dataChange;
    expect(dataChangeEvents.length).toBe(1);
  });
});
