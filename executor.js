const later = require('@breejs/later')
const log = require('electron-log')
const Reminder = require('./reminder')
later.date.localTime()

class Executor {
  constructor (store) {
    this.store = store
    this.reminders = []
  }

  planSchedules () {
    for (const item of this.store.get('reminders')) {
      this.reminders.push(new Reminder(item, this))
    }
  }

  removeReminderByName (name) {
    const index = this.store.get('reminders').findIndex(rem => rem.name === name)
    this.removeReminder(index)
  }

  removeReminder (index) {
    const storedReminders = this.store.get('reminders')
    const removed = storedReminders.splice(index, 1)
    this.store.set('reminders', storedReminders)
    this.reminders[index].clearTimer()
    this.reminders.splice(index, 1)
    log.info(`Removed '${removed[0].name}'`)
    return index
  }

  updateReminder (index, data) {
    const storedReminders = this.store.get('reminders')
    if (storedReminders[index] !== data.name) {
      this.reminders[index].clearTimer()
    }
    const newReminder = {
      name: data.name,
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
    log.info(`Updated '${newReminder.name}' (${JSON.stringify(newReminder)})`)
    return this.reminders[index].forFrontend
  }

  addReminder (data) {
    const storedReminders = this.store.get('reminders')
    const newReminder = {
      name: data.name,
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
    this.reminders.push(new Reminder(newReminder, this))
    log.info(`Added '${newReminder.name}' (${JSON.stringify(newReminder)})`)
    return this.reminders.slice(-1).pop().forFrontend
  }

  get forFrontend () {
    return this.reminders.map((item) => {
      return item.forFrontend
    })
  }
}

module.exports = Executor
