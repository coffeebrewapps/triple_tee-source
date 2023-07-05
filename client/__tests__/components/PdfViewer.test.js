import { mount, flushPromises } from '@vue/test-utils';
import {
  TButton,
  TProgressBar
} from 'coffeebrew-vue-components';
import { setActivePinia, createPinia } from 'pinia';
import PdfViewer from '../../src/components/PdfViewer.vue';

const anchorClick = vi.fn();

beforeEach(async() => {
  setActivePinia(createPinia());
  HTMLAnchorElement.prototype.click = anchorClick;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const templatePdfData = 'data:application/pdf;base64,';

const downloadLink = 'http://viewpdf/1';

const downloadFile = 'invoice.pdf';

describe('PdfViewer.vue', () => {
  test('when PDF data given should render PDF', async() => {
    const wrapper = await mount(PdfViewer, {
      props: {
        templatePdfData,
        downloadLink,
        downloadFile,
      },
    });

    await flushPromises();

    const viewerContainer = wrapper.get('.viewer-container');
    expect(viewerContainer.exists()).toBeTruthy();

    const viewerContent = viewerContainer.get('.viewer-content');
    expect(viewerContent.exists()).toBeTruthy();

    const progressBarComp = viewerContent.findComponent(TProgressBar);
    expect(progressBarComp.exists()).toBeFalsy();

    const iframe = viewerContent.get('iframe');
    expect(iframe.exists()).toBeTruthy();
    expect(iframe.attributes('src')).toEqual(templatePdfData);
  });

  test('when click on download button should trigger link click', async() => {
    const wrapper = await mount(PdfViewer, {
      props: {
        templatePdfData,
        downloadLink,
        downloadFile,
      },
    });

    await flushPromises();

    const viewerContainer = wrapper.get('.viewer-container');

    const actions = viewerContainer.get('.actions');
    expect(actions.exists()).toBeTruthy();

    const downloadButtonComp = actions.getComponent(TButton);
    expect(downloadButtonComp.exists()).toBeTruthy();

    const downloadAnchor = actions.get('a');
    expect(downloadAnchor.exists()).toBeTruthy();
    expect(downloadAnchor.attributes('download')).toEqual(downloadFile);
    expect(downloadAnchor.attributes('href')).toEqual(downloadLink);

    await downloadButtonComp.vm.$emit('click');

    await flushPromises();

    expect(anchorClick).toHaveBeenCalled();
  });

  test('when PDF data not given should render progress bar', async() => {
    const wrapper = await mount(PdfViewer, {
      props: {
        templatePdfData: null,
        downloadLink,
        downloadFile,
      },
    });

    await flushPromises();

    const viewerContainer = wrapper.get('.viewer-container');
    const viewerContent = viewerContainer.get('.viewer-content');

    const progressBarComp = viewerContent.getComponent(TProgressBar);
    expect(progressBarComp.exists()).toBeTruthy();

    const iframe = viewerContent.find('iframe');
    expect(iframe.exists()).toBeFalsy();
  });
});
