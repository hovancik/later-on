const later = require('@breejs/later')
const { Notification } = require('electron')
const log = require('electron-log')
later.date.localTime()

class Executor {
  constructor (store) {
    this.store = store
    this.reminders = store.get('reminders')
    this.timers = this.reminders.map(reminder => reminder.name)
  }

  planSchedules () {
    for (const reminder of this.reminders) {
      if (reminder.cron) {
        const schedule = later.parse.cron(reminder.cron)
        if (schedule.error >= 0) {
          log.error(`Error parsing ${reminder.name} at character ${schedule.error + 1} of '${reminder.cron}'`)
        } else {
          log.info(`Succesfully parsed ${reminder.name}`)
        }
        this.timers[reminder.name] = later.setInterval(
          () => { this._notify(reminder) }
          , schedule)
      } else if (reminder.repeat) {
        const schedule = later.parse.text(reminder.repeat)
        if (schedule.error >= 0) {
          log.error(`Error parsing ${reminder.name} at character ${schedule.error + 1} of '${reminder.repeat}'`)
        } else {
          log.info(`Succesfully parsed ${reminder.name}`)
        }
        this.timers[reminder.name] = later.setInterval(
          () => { this._notify(reminder) }
          , schedule)
      } else {
        const schedule = later.parse.text(reminder.once)
        if (schedule.error >= 0) {
          log.error(`Error parsing ${reminder.name} at character ${schedule.error + 1} of '${reminder.once}'`)
        } else {
          log.info(`Succesfully parsed ${reminder.name}`)
        }
        this.timers[reminder.name] = later.setTimeout(
          () => { this._notify(reminder) }
          , schedule)
      }
    }
  }

  _notify (reminder) {
    new Notification({
      title: reminder.title,
      body: reminder.body
    }).show()
    log.info(`Notified about ${reminder.name}`)
    if (!reminder.keep && reminder.once) {
      this._removeReminder(reminder)
      log.info(`Removed ${reminder.name}`)
    }
  }

  _removeReminder (reminder) {
    this.store.set('reminders',
      this.store.get('reminders')
        .filter(rem => rem.name !== reminder.name))
  }
}

module.exports = Executor
