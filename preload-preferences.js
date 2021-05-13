const {
  contextBridge
} = require('electron')
const Store = require('electron-store')
const store = new Store()

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    platform: () => {
      return process.platform
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
