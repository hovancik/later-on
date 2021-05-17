const {
  contextBridge,
  ipcRenderer,
  shell
} = require('electron')
const Store = require('electron-store')
const log = require('electron-log')
const store = new Store()

contextBridge.exposeInMainWorld(
  'api', {
    debugInfo: () => {
      return {
        platform: process.platform,
        arch: process.arch,
        platformVersion: process.getSystemVersion(),
        chrome: process.versions.chrome,
        node: process.version,
        electron: process.versions.electron,
        preferencesFile: store.path,
        logsFile: log.transports.file.getFile().path.replace('renderer.log', 'main.log')
      }
    },
    currentAppVersion: async () => {
      return await ipcRenderer.invoke('current-app-version')
    },
    latestAppVersion: async () => {
      return await ipcRenderer.invoke('latest-app-version')
    },
    latestAppUrl: async () => {
      return await ipcRenderer.invoke('latest-app-url')
    },
    openExternal: (url) => {
      shell.openExternal(url)
    },
    openPath: (path) => {
      shell.openPath(path)
    },
    store: {
      set: (key, value) => {
        return store.set(key, value)
      },
      get: (key) => {
        return store.get(key)
      },
      all: () => {
        return store.store
      }
    }
  }
)
