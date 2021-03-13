const later = require('@breejs/later')
const { Notification } = require('electron')
const log = require('electron-log')
later.date.localTime()

class Reminder {
  constructor (stored, executor) {
    this.executor = executor
    this.stored = stored
    this.timer = null
    this.parsed = null
    this._parse()
    this._schedule()
  }

  _parse () {
    if (this.stored.type === 'cron') {
      this.parsed = later.parse.cron(this.stored.interval)
      if (this.parsed.error >= 0) {
        log.error(`Error parsing '${this.stored.name}' at character ${this.parsed.error + 1} of '${this.stored.interval}'`)
      } else {
        log.info(`Succesfully parsed '${this.stored.name}' as '${this.stored.interval}'`)
      }
    } else if (this.stored.type === 'repeat' || this.stored.type === 'once') {
      this.parsed = later.parse.text(this.stored.interval)
      if (this.parsed.error >= 0) {
        log.error(`Error parsing '${this.stored.name}' at character ${this.parsed.error + 1} of '${this.stored.interval}'`)
      } else {
        log.info(`Succesfully parsed '${this.stored.name}' as '${this.stored.interval}'`)
      }
    } else {
      log.error(`Can't parse ${this.stored}. Must have 'type' of 'once', 'repeat' or 'cron'.`)
    }
  }

  _schedule () {
    const toExecute = () => { this._notify() }
    if (this.stored.type === 'once') {
      this.timer = later.setTimeout(toExecute, this.parsed)
    } else {
      this.timer = later.setInterval(toExecute, this.parsed)
    }
  }

  _notify () {
    new Notification({
      title: this.stored.title,
      body: this.stored.body
    }).show()
    log.info(`Notified about '${this.stored.name}'`)
    if (!this.stored.keep && this.stored.type === 'once') {
      this._removeReminder()
    }
  }

  clearTimer () {
    this.timer.clear()
  }

  _removeReminder () {
    this.executor.removeReminderByName(this.stored.name)
  }

  get name () {
    return this.stored.name
  }

  get forFrontend () {
    return {
      ...this.stored,
      schedules: this.stored.type === 'once'
        ? [later.schedule(this.parsed).next()]
        : later.schedule(this.parsed).next(3)
    }
  }
}

module.exports = Reminder
