const route = {
  path: '/contacts',
  name: 'Contacts',
  component: () => import('./Contacts.vue')
}

const viewContactRoute = {
  path: '/contacts/:id',
  name: 'View Contact',
  component: () => import('./ViewContact.vue'),
  meta: {
    parentRoute: { name: 'Contacts' },
    hidden: true
  }
}

const usePlugin = (router) => {
  router.addRoute(route)
  router.addRoute(viewContactRoute)
  return route
}

export default usePlugin
