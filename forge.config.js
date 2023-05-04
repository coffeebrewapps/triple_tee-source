module.exports = {
  packagerConfig: {
    ignore: [
      '^/client$',
      '^/node_modules$',
      '^/public$',
      '^/server$',
      '^/.tool-versions',
      '^/server.js',
      '^/yarn.lock'
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
