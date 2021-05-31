const { EventEmitter } = require('events')
const later = require('@breejs/later')
const log = require('electron-log')
const {
  v4: uuidv4
} = require('uuid')
const Reminder = require('./reminder')
const DndManager = require('./dndManager')
later.date.localTime()

class Executor extends EventEmitter {
  constructor (store) {
    super()
    this.store = store
    this.dndManager = new DndManager(store)
    this.reminders = []
  }

  planSchedules () {
    for (const item of this.store.get('reminders')) {
      const rem = new Reminder(item, this)
      rem.on('update-tray', () => this.emit('update-tray'))
      this.reminders.push(rem)
    }
  }

  removeReminderByUuid (uuid) {
    const index = this.store.get('reminders').findIndex(rem => rem.uuid === uuid)
    this.removeReminder(index)
  }

  removeReminder (index) {
    const storedReminders = this.store.get('reminders')
    const removed = storedReminders.splice(index, 1)
    this.store.set('reminders', storedReminders)
    this.reminders[index].clearTimer()
    this.reminders.splice(index, 1)
    log.info(`Removed '${removed[0].uuid}'`)
    this.emit('update-tray')
    return index
  }

  updateReminder (index, data) {
    const storedReminders = this.store.get('reminders')
    if (storedReminders[index] !== data.uuid) {
      this.reminders[index].clearTimer()
    }
    const newReminder = {
      uuid: data.uuid,
      type: data.type,
      interval: data.interval,
      title: data.title,
      body: data.body
    }
    if (data.type === 'once') {
      newReminder.keep = data.keep
    }
    storedReminders[index] = newReminder
    this.store.set('reminders', storedReminders)
    this.reminders[index] = new Reminder(newReminder, this)
    log.info(`Updated '${newReminder.uuid}' (${JSON.stringify(newReminder)})`)
    this.emit('update-tray')
    return this.reminders[index].forFrontend
  }

  addReminder (data) {
    const storedReminders = this.store.get('reminders')
    const newReminder = {
      uuid: uuidv4(),
      type: data.type,
      interval: data.interval,
      title: data.title,
      body: data.body
    }
    if (data.type === 'once') {
      newReminder.keep = data.keep
    }
    storedReminders.push(newReminder)
    this.store.set('reminders', storedReminders)
    const rem = new Reminder(newReminder, this)
    this.reminders.push(rem)
    rem.on('update-tray', () => this.emit('update-tray'))
    log.info(`Added '${newReminder.uuid}' (${JSON.stringify(newReminder)})`)
    this.emit('update-tray')
    return this.reminders.slice(-1).pop().forFrontend
  }

  get forFrontend () {
    return this.reminders.map((item) => {
      return item.forFrontend
    })
  }

  get upcomingReminders () {
    return this.reminders.map((item) => {
      return item.upcomingReminders
    }).flat().sort((a, b) => { return a[2] - b[2] })
      .filter((x) => x[2] > new Date())
  }
}

module.exports = Executor
