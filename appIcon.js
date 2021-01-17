// Get path of correct app icon based on different criteria

class AppIcon {
  constructor ({ platform }) {
    this.platform = platform
  }

  get trayIconFileName () {
    if (this.platform === 'darwin') {
      return 'trayMac.png'
    } else {
      return 'tray.png'
    }
  }
}

module.exports = AppIcon
