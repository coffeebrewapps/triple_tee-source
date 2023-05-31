export function initPlugins(router, dataStore, uploader) {
  const plugins = import.meta.glob('@/plugins/**/index.js', { import: 'default', eager: true });

  Object.entries(plugins).forEach(([plugin, usePlugin]) => {
    usePlugin(router, dataStore, uploader);
    console.log(`Installed plugin ${plugin}`);
  });
}
