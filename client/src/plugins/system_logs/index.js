const route = {
  path: '/system_logs',
  name: 'System Logs',
  component: () => import('@/plugins/system_logs/LogsPage.vue'),
  meta: {
    hidden: true,
  },
};

const usePlugin = (router, dataStore, uploader, logger) => {
  router.addRoute(route);

  function tailLog() {
    return new Promise((resolve, reject) => {
      resolve({
        data: {
          text: () => {
            return new Promise((textResolve, textReject) => {
              try {
                const logs = logger.tailLog();
                textResolve(logs);
              } catch (error) {
                textReject(error);
              }
            });
          },
        }
      });
    });
  }

  dataStore.registerFunction('logs', 'downloadStream', 'downloadStream', tailLog);
};

export default usePlugin;
