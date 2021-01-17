const { app, shell, Menu, Tray } = require('electron')
const path = require('path')
const log = require('electron-log')
const Store = require('electron-store')
const Executor = require('./executor')
const AppIcon = require('./appIcon')
let tray = null
let store

app.whenReady().then(() => {
  const schema = {
    reminders: {
      type: 'array',
      default: [
        {
          name: 'later-on',
          once: 'every 10 seconds',
          keep: true,
          title: 'Welcome to LaterOn!',
          body: 'Add your own reminders by editing config file. Learn more at https://LaterOn.app.'
        }
      ]
    }
  }

  store = new Store({ schema })
  const executor = new Executor(store)
  executor.planSchedules()
})

function trayIconPath () {
  const params = {
    platform: process.platform
  }
  const trayIconFileName = new AppIcon(params).trayIconFileName
  return path.join(__dirname, '/images/app-icons/', trayIconFileName)
}

app.whenReady().then(() => {
  tray = new Tray(trayIconPath())
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'LaterOn',
      enabled: false
    }, {
      type: 'separator'
    }, {
      label: 'Open config.json',
      click: function () {
        shell.openPath(store.path)
      }
    }, {
      label: 'Open log',
      click: function () {
        shell.openPath(log.transports.file.getFile().path)
      }
    }, {
      type: 'separator'
    }, {
      label: 'Quit LaterOn',
      role: 'quit',
      click: function () {
        app.quit()
      }
    }
  ])
  tray.setToolTip('LaterOn - The reminder app')
  tray.setContextMenu(contextMenu)
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.on('window-all-closed', function () {
  // do nothing, so app wont get closed
})
