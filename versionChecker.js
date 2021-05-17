const fetch = require('node-fetch')
const log = require('electron-log')

class VersionChecker {
  constructor (current) {
    this.latest = ''
    this.current = current
    this.url = ''
  }

  start () {
    this._latest()
    setInterval(() => {
      this._latest()
    }, 24 * 60 * 60 * 1000)
  }

  async _latest () {
    const response = await fetch(
      'https://api.github.com/repos/hovancik/later-on/releases/latest', {
        method: 'GET',
        headers: {
          'User-Agent': 'hovancik/later-on'
        },
        mode: 'cors',
        cache: 'default'
      }
    )
    const body = await response.json()
    this.latest = body.tag_name
    this.url = body.html_url
    log.info(`Checking for new version (local: v${this.current}, remote: ${this.latest})`)
  }
}

module.exports = VersionChecker
