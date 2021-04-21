const {
  app,
  shell,
  Menu,
  Tray,
  BrowserWindow,
  ipcMain
} = require('electron')
const path = require('path')
const log = require('electron-log')
const Store = require('electron-store')
const {
  v4: uuidv4
} = require('uuid')
const Executor = require('./executor')
const AppIcon = require('./appIcon')
let tray = null
let store
let laterOnWindow = null
let executor

app.whenReady().then(() => {
  const schema = {
    reminders: {
      type: 'array',
      default: [{
        uuid: uuidv4(),
        type: 'once',
        interval: 'every 10 seconds',
        keep: true,
        title: 'Welcome to LaterOn - The reminder app!',
        body: 'Learn more at https://LaterOn.app.'
      }]
    }
  }

  const migrations = {
    '0.0.4': store => {
      const reminders = store.get('reminders')
      for (const item of reminders) {
        delete item.name
        item.uuid = uuidv4()
      }
      store.set('reminders', reminders)
      store.delete('old')
    }
  }

  store = new Store({
    schema,
    migrations
  })
  executor = new Executor(store)
  executor.planSchedules()
})

function trayIconPath () {
  const params = {
    platform: process.platform
  }
  const trayIconFileName = new AppIcon(params).trayIconFileName
  return path.join(__dirname, '/images/app-icons/', trayIconFileName)
}

function windowIconPath () {
  const params = {
    platform: process.platform
  }
  const windowIconFileName = new AppIcon(params).windowIconFileName
  return path.join(__dirname, '/images/app-icons', windowIconFileName)
}

app.whenReady().then(() => {
  tray = new Tray(trayIconPath())
  const contextMenu = Menu.buildFromTemplate([{
    label: 'LaterOn - The reminder app',
    enabled: false
  }, {
    type: 'separator'
  }, {
    label: 'Reminders',
    click: function () {
      showRemindersWindow()
    }
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
  }])
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

function showRemindersWindow () {
  if (laterOnWindow) {
    laterOnWindow.show()
    return
  }
  const modalPath = path.join('file://', __dirname, '/later-on.html')
  laterOnWindow = new BrowserWindow({
    icon: windowIconPath(),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  laterOnWindow.loadURL(modalPath)
  laterOnWindow.webContents.on('did-finish-load', () => {
    laterOnWindow.webContents.send('initReminders', executor.forFrontend)
  })
  // laterOnWindow.toggleDevTools()
  if (laterOnWindow) {
    laterOnWindow.on('closed', () => {
      laterOnWindow = null
    })
  }
}

app.on('window-all-closed', function () {
  // do nothing, so app wont get closed
})

ipcMain.handle('remove-reminder', async (event, index) => {
  return await executor.removeReminder(index)
})

ipcMain.handle('update-reminder', async (event, index, input) => {
  return await executor.updateReminder(index, input)
})

ipcMain.handle('add-reminder', async (event, input) => {
  return await executor.addReminder(input)
})

ipcMain.handle('validate-interval', (event, input) => {
  const later = require('@breejs/later')
  later.date.localTime()
  let parsed, error
  if (input.type === 'cron') {
    parsed = later.parse.cron(input.interval)
    if (later.schedule(parsed).next(3).length > 0) {
      error = -1
    } else {
      error = 0
    }
  } else {
    parsed = later.parse.text(input.interval)
  }

  if (typeof(error) === 'undefined') {
    error = parsed.error
  }

  if (input.interval === '') {
    error = 0
  }

  return {
    error: error,
    schedules: error === -1 ?
      (input.type === 'once' ? [later.schedule(parsed).next()] :
        later.schedule(parsed).next(3)) : 0
  }
})
