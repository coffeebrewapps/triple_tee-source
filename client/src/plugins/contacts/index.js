import { useStore } from './store';

const route = {
  path: '/contacts',
  name: 'Contacts',
  component: () => import('./ContactsPage.vue'),
};

const viewContactRoute = {
  path: '/contacts/:id',
  name: 'View Contact',
  component: () => import('./ViewContact.vue'),
  meta: {
    parentRoute: { name: 'Contacts' },
    hidden: true,
  },
};

const usePlugin = (router, dataStore, uploader) => {
  const store = useStore(dataStore, uploader);

  router.addRoute(route);
  router.addRoute(viewContactRoute);

  dataStore.registerFunction('contacts', 'create', 'create', store.createWithUpload);
  dataStore.registerFunction('contacts', 'update', 'update', store.updateWithUpload);

  return route;
};

export default usePlugin;
