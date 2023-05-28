export function initPlugins(router, dataStore) {
  const plugins = import.meta.glob('@/plugins/**/index.js', { import: 'default', eager: true })

  Object.entries(plugins).forEach(([plugin, usePlugin]) => {
    const route = usePlugin(router, dataStore)
    console.log(`Installed plugin ${plugin}`)
  })
}