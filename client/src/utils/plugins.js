export function initPlugins(router, dataStore, uploader, logger) {
  const plugins = import.meta.glob('@/plugins/**/index.js', { import: 'default', eager: true });

  Object.entries(plugins).forEach(([plugin, usePlugin]) => {
    usePlugin(router, dataStore, uploader, logger);
    logger.log(`Installed plugin`, { plugin });
  });
}
