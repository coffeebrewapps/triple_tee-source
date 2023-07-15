import { defineComponent } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import {
  TBar,
  THorizontalBar
} from 'coffeebrew-vue-components';
import { useDataAccess } from '../../src/utils/dataAccess.js';
import HomeView from '../../src/views/HomeView.vue';

const configsData = {
  1: {
    id: '1',
    description: 'Hours by Activity',
    chartType: 'hbar',
    dataSource: 'work_logs',
    scaleUnit: 'hour',
    scaleValue: 10,
    groupBy: 'category',
    includeTags: ['3', '4'],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 2,
    active: true,
  },
  2: {
    id: '2',
    description: 'Revenue by Month',
    chartType: 'vbar',
    dataSource: 'transactions',
    scaleUnit: 'dollar',
    scaleValue: 1000,
    groupBy: 'month',
    includeTags: [],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 3,
    active: true,
  },
  3: {
    id: '3',
    description: 'Hours by Month',
    chartType: 'vbar',
    dataSource: 'work_logs',
    scaleUnit: 'hour',
    scaleValue: 10,
    groupBy: 'month',
    includeTags: [],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 2,
    active: true,
  },
  4: {
    id: '4',
    description: 'Revenue by Company',
    chartType: 'hbar',
    dataSource: 'transactions',
    scaleUnit: 'dollar',
    scaleValue: 1000,
    groupBy: 'category',
    includeTags: [],
    excludeTags: [],
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    displayOrder: 1,
    active: true,
  },
};

const chartData = {
  1: [
    {
      key: 'Testing',
      total: 4,
    },
    {
      key: 'Implementation',
      total: 14,
    },
  ],
  2: [
    {
      key: '2023-Mar',
      total: 972.68,
    },
    {
      key: '2023-Jun',
      total: 1083.63,
    },
    {
      key: '2023-Sep',
      total: 3768.99,
    },
    {
      key: '2023-Nov',
      total: -39.72,
    },
    {
      key: '2023-Dec',
      total: -69.59,
    },
  ],
  3: [],
  4: [
    {
      key: 'company-abc',
      total: 972.68,
    },
    {
      key: 'company-xyz',
      total: 1083.63,
    },
    {
      key: 'company-acme',
      total: -69.59,
    },
  ],
};

vi.mock('../../src/utils/dataAccess.js');

const MockTHorizontalBar = defineComponent({
  props: {
    config: {
      type: Object,
      default() {},
    },
    data: {
      type: Array,
      default() {},
    },
  },
  setup() {
  },
  template: '<div class="hbar"></div>',
});

const MockTBar = defineComponent({
  props: {
    config: {
      type: Object,
      default() {},
    },
    data: {
      type: Array,
      default() {},
    },
  },
  setup() {
  },
  template: '<div class="vbar"></div>',
});

const listRecords = vi.fn((modelClass) => {
  return new Promise((resolve, reject) => {
    resolve({
      data: Object.values(configsData),
    });
  });
});

const viewRecord = vi.fn((modelClass, id, params, { path }) => {
  return new Promise((resolve, reject) => {
    if (path === 'data') {
      resolve(chartData[id]);
    } else {
      resolve(configsData[id]);
    }
  });
});

beforeEach(async() => {
  setActivePinia(createPinia());

  vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
    return {
      getPropertyValue: (prop) => {
        if (prop === '--color-text') {
          return '#fff';
        } else {
          return '#000';
        }
      },
    };
  });

  useDataAccess.mockImplementation(() => {
    return {
      list: listRecords,
      view: viewRecord,
    };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HomeView.vue', () => {
  test('when charts not available should display No chart data', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        list: vi.fn((modelClass) => {
          return new Promise((resolve, reject) => {
            resolve({ data: [] });
          });
        }),
        view: vi.fn((modelClass, id, params, { path }) => {
          return new Promise((resolve, reject) => {
            resolve([]);
          });
        }),
      };
    });

    const wrapper = await mount(HomeView, {
      global: {
        stubs: {
          TBar: MockTBar,
          THorizontalBar: MockTHorizontalBar,
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();
    expect(pageContainer.html()).toContain('No chart data.');

    const vBarComp = pageContainer.findComponent(TBar);
    expect(vBarComp.exists()).toBeFalsy();

    const hBarComp = pageContainer.findComponent(THorizontalBar);
    expect(hBarComp.exists()).toBeFalsy();
  });

  test('when charts available should display charts', async() => {
    const wrapper = await mount(HomeView, {
      global: {
        stubs: {
          TBar: MockTBar,
          THorizontalBar: MockTHorizontalBar,
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();

    // should render in display order
    const charts = pageContainer.findAll('.chart');
    expect(charts.length).toBe(3);

    expect(charts[0].html()).toContain('hbar');
    expect(charts[1].html()).toContain('hbar');
    expect(charts[2].html()).toContain('vbar');

    const revenueByMonthComp = charts[2].getComponent(TBar);
    expect(revenueByMonthComp.props().config).toEqual({
      title: 'Revenue by Month',
      colors: {
        highlightColor: '#fff',
        lineColor: '#000',
      },
      yScale: 1000,
      yAxisLabel: 'Dollar',
      xAxisLabel: 'Month',
    });

    expect(revenueByMonthComp.props().data).toEqual([
      {
        xValue: '2023-Mar',
        yValue: 972.68,
      },
      {
        xValue: '2023-Jun',
        yValue: 1083.63,
      },
      {
        xValue: '2023-Sep',
        yValue: 3768.99,
      },
      {
        xValue: '2023-Nov',
        yValue: -39.72,
      },
      {
        xValue: '2023-Dec',
        yValue: -69.59,
      },
    ]);

    const revenueByCompanyComp = charts[0].getComponent(THorizontalBar);
    expect(revenueByCompanyComp.props().config).toEqual({
      title: 'Revenue by Company',
      colors: {
        highlightColor: '#fff',
        lineColor: '#000',
      },
      xScale: 1000,
      xAxisLabel: 'Dollar',
      yAxisLabel: 'Category',
    });

    expect(revenueByCompanyComp.props().data).toEqual([
      {
        yValue: 'company-abc',
        xValue: 972.68,
      },
      {
        yValue: 'company-xyz',
        xValue: 1083.63,
      },
      {
        yValue: 'company-acme',
        xValue: -69.59,
      },
    ]);

    const hoursByActivityComp = charts[1].getComponent(THorizontalBar);
    expect(hoursByActivityComp.props().config).toEqual({
      title: 'Hours by Activity',
      colors: {
        highlightColor: '#fff',
        lineColor: '#000',
      },
      xScale: 10,
      xAxisLabel: 'Hour',
      yAxisLabel: 'Category',
    });

    expect(hoursByActivityComp.props().data).toEqual([
      {
        yValue: 'Testing',
        xValue: 4,
      },
      {
        yValue: 'Implementation',
        xValue: 14,
      },
    ]);
  });

  test('when fetch chart configs returns failure should display No chart data', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        list: vi.fn((modelClass) => {
          return new Promise((resolve, reject) => {
            reject(new Error('modelNotFound'));
          });
        }),
        view: viewRecord,
      };
    });

    const wrapper = await mount(HomeView, {
      global: {
        stubs: {
          TBar: MockTBar,
          THorizontalBar: MockTHorizontalBar,
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    expect(pageContainer.exists()).toBeTruthy();
    expect(pageContainer.html()).toContain('No chart data.');
  });

  test('when fetch chart data returns failure should not display chart', async() => {
    useDataAccess.mockImplementation(() => {
      return {
        list: listRecords,
        view: vi.fn((modelClass, id, params, { path }) => {
          return new Promise((resolve, reject) => {
            if (path === 'data') {
              if (id === '4') {
                reject(new Error('notFound'));
              } else {
                resolve(chartData[id]);
              }
            } else {
              resolve(configsData[id]);
            }
          });
        }),
      };
    });

    const wrapper = await mount(HomeView, {
      global: {
        stubs: {
          TBar: MockTBar,
          THorizontalBar: MockTHorizontalBar,
        },
      },
    });

    await flushPromises();

    const pageContainer = wrapper.get('.page-container');
    const charts = pageContainer.findAll('.chart');
    expect(charts.length).toBe(2);

    expect(charts[0].html()).toContain('hbar');
    expect(charts[1].html()).toContain('vbar');

    const revenueByCompanyComp = charts[0].getComponent(THorizontalBar);
    expect(revenueByCompanyComp.props().config).toEqual(expect.objectContaining({
      title: 'Hours by Activity',
    }));

    const revenueByMonthComp = charts[1].getComponent(TBar);
    expect(revenueByMonthComp.props().config).toEqual(expect.objectContaining({
      title: 'Revenue by Month',
    }));
  });
});
