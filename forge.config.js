module.exports = {
  packagerConfig: {
    name: 'Triple Tee App',
    executableName: 'triple_tee',
    icon: './icons/icon',
    ignore: [
      '^/bin$',
      '^/client$',
      '^/data$',
      '^/dev$',
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
      config: {
        options: {
          icon: './icons/t3_icon.ico',
        },
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
      config: {
        options: {
          icon: './icons/t3_icon.icns',
        },
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './icons/t3_icon.png',
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
