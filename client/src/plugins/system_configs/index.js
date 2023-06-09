import { useStore } from './store';

const route = {
  path: '/configure',
  name: 'Configure',
  component: () => import('./ConfigurePage.vue'),
  meta: {
    hidden: true,
  },
  children: [
    {
      path: 'sequences',
      name: 'Configure Sequences',
      component: () => import('@/plugins/sequences/SequencesPage.vue'),
      meta: {
        parentRoute: { name: 'Configure' },
        hidden: true,
      },
    },
    {
      path: 'tags',
      name: 'Configure Tags',
      component: () => import('@/plugins/tags/TagsPage.vue'),
      meta: {
        parentRoute: { name: 'Configure' },
        hidden: true,
      },
    },
    {
      path: 'currencies',
      name: 'Configure Currencies',
      component: () => import('@/plugins/currencies/CurrenciesPage.vue'),
      meta: {
        parentRoute: { name: 'Configure' },
        hidden: true,
      },
    },
    {
      path: 'system_configs',
      name: 'Configure System',
      component: () => import('./SystemConfigs.vue'),
      meta: {
        parentRoute: { name: 'Configure' },
        hidden: true,
      },
    },
  ],
};

const usePlugin = ({ router, dataStore }) => {
  const store = useStore({ dataStore });

  router.addRoute(route);

  dataStore.registerFunction('system_configs', 'list', 'latest', store.viewLatestConfig);
  dataStore.registerFunction('system_configs', 'create', 'replace', store.replaceLatestConfig);
};

export default usePlugin;
