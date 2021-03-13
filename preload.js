const {
  contextBridge,
  ipcRenderer
} = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ['toMain']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      const validChannels = ['initReminders']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    },
    removeReminder: (index, callback) => {
      ipcRenderer.invoke('remove-reminder', index).then((index) => {
        callback(index)
      })
    },
    updateReminder: (index, input, callback) => {
      ipcRenderer.invoke('update-reminder', index, input).then((reminder) => {
        callback(reminder)
      })
    },
    addReminder: (input, callback) => {
      ipcRenderer.invoke('add-reminder', input).then((reminder) => {
        callback(reminder)
      })
    },
    validateInterval: (input, callback) => {
      ipcRenderer.invoke('validate-interval', input).then((info) => {
        callback(info)
      })
    },
    updateInterval: (type, interval, callback) => {
      ipcRenderer.invoke('validate-interval', type, interval).then((reminders) => {
        callback(reminders)
      })
    }
  }
)
