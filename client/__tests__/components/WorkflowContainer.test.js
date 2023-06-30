import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TButton
} from 'coffeebrew-vue-components';
import WorkflowContainer from '../../src/components/WorkflowContainer.vue';

beforeEach(async() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

const steps = [
  { title: 'Step 1' },
  { title: 'Step 2' },
  { title: 'Step 3' },
  { title: 'Step 4' },
];

const currentStepNumber = 0;

const slots = {
  'step-0': 'Step 1 Container',
  'step-1': 'Step 2 Container',
  'step-2': 'Step 3 Container',
  'step-3': 'Step 4 Container',
};

describe('WorkflowContainer.vue', () => {
  test('should render step breadcrumbs', async() => {
    const wrapper = await mount(WorkflowContainer, {
      props: {
        steps,
        currentStepNumber,
      },
    });

    await flushPromises();

    const workflowContainer = wrapper.get('.workflow-container');
    expect(workflowContainer.exists()).toBeTruthy();

    const breadcrumbsContainer = workflowContainer.get('.step-breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const breadcrumbs = breadcrumbsContainer.findAll('.step-breadcrumb');
    expect(breadcrumbs.length).toBe(4);

    const step1 = breadcrumbs[0].html();
    expect(step1).toContain('Step 1');
    expect(step1).toContain('active');

    const step2 = breadcrumbs[1].html();
    expect(step2).toContain('Step 2');
    expect(step2).not.toContain('active');

    const step3 = breadcrumbs[2].html();
    expect(step3).toContain('Step 3');
    expect(step3).not.toContain('active');

    const step4 = breadcrumbs[3].html();
    expect(step4).toContain('Step 4');
    expect(step4).not.toContain('active');

    const stepContainers = workflowContainer.findAll('.step-container');
    expect(stepContainers.length).toBe(4);
  });

  test('when first step should render next step button only', async() => {
    const wrapper = await mount(WorkflowContainer, {
      props: {
        steps,
        currentStepNumber,
        slots,
      },
    });

    await flushPromises();

    const workflowContainer = wrapper.get('.workflow-container');
    expect(workflowContainer.exists()).toBeTruthy();

    const breadcrumbsContainer = workflowContainer.get('.step-breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const breadcrumbs = breadcrumbsContainer.findAll('.step-breadcrumb');
    expect(breadcrumbs.length).toBe(4);

    const step1 = breadcrumbs[0].html();
    expect(step1).toContain('Step 1');
    expect(step1).toContain('active');

    const stepContainers = workflowContainer.findAll('.step-container');
    expect(stepContainers.length).toBe(4);

    expect(stepContainers[0].isVisible()).toBeTruthy();
    expect(stepContainers[1].isVisible()).toBeFalsy();
    expect(stepContainers[2].isVisible()).toBeFalsy();
    expect(stepContainers[3].isVisible()).toBeFalsy();

    const actions = workflowContainer.get('.actions');
    expect(actions.exists()).toBeTruthy();

    const buttons = actions.findAllComponents(TButton);
    expect(buttons.length).toBe(1);

    const nextStepButton = buttons[0];
    expect(nextStepButton.props().value).toBe('Next Step');

    await nextStepButton.trigger('click');

    const events = wrapper.emitted().nextStep;
    expect(events.length).toBe(1);
    expect(events[0]).toEqual([1]);
  });

  test('when middle step should render prev and next step buttons', async() => {
    const wrapper = await mount(WorkflowContainer, {
      props: {
        steps,
        currentStepNumber: 1,
      },
    });

    await flushPromises();

    const workflowContainer = wrapper.get('.workflow-container');
    expect(workflowContainer.exists()).toBeTruthy();

    const breadcrumbsContainer = workflowContainer.get('.step-breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const breadcrumbs = breadcrumbsContainer.findAll('.step-breadcrumb');
    expect(breadcrumbs.length).toBe(4);

    const step2 = breadcrumbs[1].html();
    expect(step2).toContain('Step 2');
    expect(step2).toContain('active');

    const stepContainers = workflowContainer.findAll('.step-container');
    expect(stepContainers.length).toBe(4);

    expect(stepContainers[1].isVisible()).toBeTruthy();
    expect(stepContainers[0].isVisible()).toBeFalsy();
    expect(stepContainers[2].isVisible()).toBeFalsy();
    expect(stepContainers[3].isVisible()).toBeFalsy();

    const actions = workflowContainer.get('.actions');
    expect(actions.exists()).toBeTruthy();

    const buttons = actions.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const prevStepButton = buttons[0];
    expect(prevStepButton.props().value).toBe('Prev Step');

    await prevStepButton.trigger('click');

    const prevStepEvents = wrapper.emitted().prevStep;
    expect(prevStepEvents.length).toBe(1);
    expect(prevStepEvents[0]).toEqual([0]);

    const nextStepButton = buttons[1];
    expect(nextStepButton.props().value).toBe('Next Step');

    await nextStepButton.trigger('click');

    const nextStepEvents = wrapper.emitted().nextStep;
    expect(nextStepEvents.length).toBe(1);
    expect(nextStepEvents[0]).toEqual([2]);
  });

  test('when second last step should render prev and submit buttons', async() => {
    const wrapper = await mount(WorkflowContainer, {
      props: {
        steps,
        currentStepNumber: 2,
      },
    });

    await flushPromises();

    const workflowContainer = wrapper.get('.workflow-container');
    expect(workflowContainer.exists()).toBeTruthy();

    const breadcrumbsContainer = workflowContainer.get('.step-breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const breadcrumbs = breadcrumbsContainer.findAll('.step-breadcrumb');
    expect(breadcrumbs.length).toBe(4);

    const step3 = breadcrumbs[2].html();
    expect(step3).toContain('Step 3');
    expect(step3).toContain('active');

    const stepContainers = workflowContainer.findAll('.step-container');
    expect(stepContainers.length).toBe(4);

    expect(stepContainers[2].isVisible()).toBeTruthy();
    expect(stepContainers[0].isVisible()).toBeFalsy();
    expect(stepContainers[1].isVisible()).toBeFalsy();
    expect(stepContainers[3].isVisible()).toBeFalsy();

    const actions = workflowContainer.get('.actions');
    expect(actions.exists()).toBeTruthy();

    const buttons = actions.findAllComponents(TButton);
    expect(buttons.length).toBe(2);

    const prevStepButton = buttons[0];
    expect(prevStepButton.props().value).toBe('Prev Step');

    await prevStepButton.trigger('click');

    const prevStepEvents = wrapper.emitted().prevStep;
    expect(prevStepEvents.length).toBe(1);
    expect(prevStepEvents[0]).toEqual([1]);

    const submitStepButton = buttons[1];
    expect(submitStepButton.props().value).toBe('Submit');

    await submitStepButton.trigger('click');

    const submitStepEvents = wrapper.emitted().submit;
    expect(submitStepEvents.length).toBe(1);
    expect(submitStepEvents[0]).toEqual([]);
  });

  test('when last step should not render button', async() => {
    const wrapper = await mount(WorkflowContainer, {
      props: {
        steps,
        currentStepNumber: 3,
      },
    });

    await flushPromises();

    const workflowContainer = wrapper.get('.workflow-container');
    expect(workflowContainer.exists()).toBeTruthy();

    const breadcrumbsContainer = workflowContainer.get('.step-breadcrumbs');
    expect(breadcrumbsContainer.exists()).toBeTruthy();

    const breadcrumbs = breadcrumbsContainer.findAll('.step-breadcrumb');
    expect(breadcrumbs.length).toBe(4);

    const step4 = breadcrumbs[3].html();
    expect(step4).toContain('Step 4');
    expect(step4).toContain('active');

    const stepContainers = workflowContainer.findAll('.step-container');
    expect(stepContainers.length).toBe(4);

    expect(stepContainers[3].isVisible()).toBeTruthy();
    expect(stepContainers[0].isVisible()).toBeFalsy();
    expect(stepContainers[1].isVisible()).toBeFalsy();
    expect(stepContainers[2].isVisible()).toBeFalsy();

    const actions = workflowContainer.get('.actions');
    expect(actions.exists()).toBeTruthy();

    const buttons = actions.findAllComponents(TButton);
    expect(buttons.length).toBe(0);
  });
});
