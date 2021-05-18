const {
  app,
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
const VersionChecker = require('./versionChecker')
let versionChecker = null
let tray = null
let store
let remindersWindow = null
let preferencesWindow = null
let executor

app.whenReady().then(() => {
  const schema = {
    monitorDnd: {
      type: 'boolean',
      default: true
    },
    openAtLogin: {
      type: 'boolean',
      default: false
    },
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
    migrations,
    watch: true
  })
  Store.initRenderer()
  executor = new Executor(store)
  // TODO workaround for https://github.com/sindresorhus/conf/issues/85#issuecomment-840412336
  store.store = Object.assign({}, store.store)

  executor.planSchedules()

  require('events').defaultMaxListeners = 200 // for watching Store changes
  Object.entries(store.store).forEach(([key, _]) => {
    store.onDidChange(key, (newValue, oldValue) => {
      if (key !== 'reminders') {
        log.info(`Setting '${key}' to '${newValue}' (was '${oldValue}')`)
      }
      if (key === 'openAtLogin') {
        app.setLoginItemSettings({
          openAtLogin: store.get('openAtLogin')
        })
      }
      if (key === 'monitorDnd') {
        newValue ? executor.dndManager.start() : executor.dndManager.stop()
      }
    })
  })

  app.setLoginItemSettings({
    openAtLogin: store.get('openAtLogin')
  })

  versionChecker = new VersionChecker(app.getVersion())
  versionChecker.start()
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
  const template = [{
    label: 'LaterOn - The reminder app',
    enabled: false
  }]
  template.push({
    type: 'separator'
  }, {
    label: 'Reminders',
    click: function () {
      showRemindersWindow()
    }
  }, {
    type: 'separator'
  }, {
    label: 'Preferences',
    click: function () {
      showPreferencesWindow()
    }
  }, {
    type: 'separator'
  }, {
    label: 'Quit LaterOn',
    role: 'quit',
    click: function () {
      app.quit()
    }
  })
  const contextMenu = Menu.buildFromTemplate(template)
  tray.setToolTip('LaterOn - The reminder app')
  tray.setContextMenu(contextMenu)
})

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

function showRemindersWindow () {
  if (remindersWindow) {
    remindersWindow.show()
    return
  }
  const modalPath = path.join('file://', __dirname, '/reminders.html')
  remindersWindow = new BrowserWindow({
    icon: windowIconPath(),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-reminders.js')
    }
  })
  remindersWindow.loadURL(modalPath)
  remindersWindow.webContents.on('did-finish-load', () => {
    remindersWindow.webContents.send('initReminders', executor.forFrontend)
  })
  // remindersWindow.toggleDevTools()
  if (remindersWindow) {
    remindersWindow.on('closed', () => {
      remindersWindow = null
    })
  }
}

function showPreferencesWindow () {
  if (preferencesWindow) {
    preferencesWindow.show()
    return
  }
  const modalPath = path.join('file://', __dirname, '/preferences.html')
  preferencesWindow = new BrowserWindow({
    icon: windowIconPath(),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-preferences.js')
    }
  })
  preferencesWindow.loadURL(modalPath)
  if (preferencesWindow) {
    preferencesWindow.on('closed', () => {
      preferencesWindow = null
    })
  }
}

app.on('window-all-closed', function () {
  // do nothing, so app wont get closed
})

ipcMain.handle('current-app-version', async (event) => {
  return await app.getVersion()
})

ipcMain.handle('latest-app-version', async (event) => {
  return await versionChecker.latest
})

ipcMain.handle('latest-app-url', async (event) => {
  return await versionChecker.url
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

  if (typeof (error) === 'undefined') {
    error = parsed.error
  }

  if (input.interval === '') {
    error = 0
  }

  return {
    error: error,
    schedules: error === -1
      ? (input.type === 'once'
          ? [later.schedule(parsed).next()]
          : later.schedule(parsed).next(3))
      : 0
  }
})
