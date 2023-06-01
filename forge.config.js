module.exports = {
  packagerConfig: {
    ignore: [
      '^/bin$',
      '^/client$',
      '^/data$',
      '^/node_modules$',
      '^/public$',
      '^/server$',
      '^/uploads$',
      '^/.tool-versions',
      '^/yarn-error.log',
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
