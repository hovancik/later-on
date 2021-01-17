const chai = require('chai')
const AppIcon = require('../appIcon')

chai.should()

describe('appIcon', function () {
  it('trayIconFileName works on macOS', function () {
    const params = {
      platform: 'darwin'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('trayMac.png')
  })

  it('trayIconFileName works on Linux', function () {
    const params = {
      platform: 'linux'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })

  it('trayIconFileName works on Windows', function () {
    const params = {
      platform: 'win32'
    }
    const appIcon = new AppIcon(params)
    appIcon.trayIconFileName.should.equal('tray.png')
  })
})
