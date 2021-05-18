Reef.debug(true)
document.body.classList.add(window.api.debugInfo().platform)

const store = new Reef.Store({
  data: {
    isGeneralVisible: true,
    isAboutVisible: true,
    isDebugVisible: false,
    currentAppVersion: '',
    latestAppVersion: '',
    latestAppUrl: '',
    ...window.api.debugInfo()
  },
  setters: {
    updateValue: (props, key, value) => {
      props[key] = value
    },
    updateStoreValue: (props, key, value) => {
      window.api.store.set(key, value)
      props[key] = value
    }
  },
  getters: {
    storeValue: (props, key) => {
      return props[key]
    }
  }
})

const preferences = new Reef('#preferences', {
  store: store,
  allowHTML: true,
  template: function (props) {
    return (
      `
      <div class='box'>
        <nav class="level">
          <div class="level-left">
            <h2 class="title is-4 has-text-link">
              <span class="icon-text">
                <span class="icon">
                  <i class="fas fa-cog"></i>
                </span>
                <span>General</span>
              </span>
            </h2>
          </div>
          <div class="level-right">
            ${props.isGeneralVisible
              ? `<button class="button is-light is-small is-white visibility"
                  data-name="General">
                  <span>Hide</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-up"></i>
                  </span>
                </button>`
              : `<button class="button is-light is-small is-white visibility"
                  data-name="General">
                  <span>Show</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-down"></i>
                  </span>
                </button>`
            }
          </div>
        </nav>
      ${props.isGeneralVisible
        ? `
        <div class="linux-hidden preference">
          <input type="checkbox" value="openAtLogin" id="openAtLogin" reef-checked="${props.openAtLogin}">
          <label for="openAtLogin">Start LaterOn automatically when loggin in</label>
        </div>
        <div class="preference">
          <input type="checkbox" class="negative" value="monitorDnd" id="monitorDnd" reef-checked="${!props.monitorDnd}">
          <label for="monitorDnd">Show reminders even in Do Not Disturb mode</label>
        </div>
          `
        : ''
      }
      </div>
      <div class='box'>
        <nav class="level">
          <div class="level-left">
            <h2 class="title is-4 has-text-link">
              <span class="icon-text">
                <span class="icon">
                  <i class="fas fa-info"></i>
                </span>
                <span>About</span>
              </span>
            </h2>
          </div>
          <div class="level-right">
            ${props.isAboutVisible
              ? `<button class="button is-light is-small is-white visibility"
                  data-name="About">
                  <span>Hide</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-up"></i>
                  </span>
                </button>`
              : `<button class="button is-light is-small is-white visibility"
                  data-name="About">
                  <span>Show</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-down"></i>
                  </span>
                </button>`
            }
          </div>
        </nav>
      ${props.isAboutVisible
        ? `
        <div>
          <p class="is-size-5">
            LaterOn ${props.currentAppVersion}
          </p>
          <p>
            Latest version:
            <a href="${props.latestAppUrl}">
              ${props.latestAppVersion}
            </a>
          </p>
        </div>
          `
        : ''
      }
      </div>
      <div class='box'>
        <nav class="level">
          <div class="level-left">
            <h2 class="title is-4 has-text-link">
              <span class="icon-text">
                <span class="icon">
                  <i class="fas fa-code"></i>
                </span>
                <span>Debug</span>
              </span>
            </h2>
          </div>
          <div class="level-right">
            ${props.isDebugVisible
              ? `<button class="button is-light is-small is-white visibility"
                  data-name="Debug">
                  <span>Hide</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-up"></i>
                  </span>
                </button>`
              : `<button class="button is-light is-small is-white visibility"
                  data-name="Debug">
                  <span>Show</span>
                  <span class="icon is-small">
                    <i class="fas fa-chevron-down"></i>
                  </span>
                </button>`
            }
          </div>
        </nav>
      ${props.isDebugVisible
        ? `
        <div>
          <p>
            <strong>LaterOn:</strong> ${props.currentAppVersion},
            <strong>OS:</strong> ${props.platform} ${props.arch} ${props.platformVersion},
            <strong>Node:</strong> ${props.node},
            <strong>Electron:</strong> ${props.electron},
            <strong>Chrome:</strong> ${props.chrome}
          </p>
          <p>
            <strong>Logs file:</strong> <a data-path="${props.logsFile}">${props.logsFile}</a><br/>
            <strong>Preferences file:</strong> <a data-path="${props.preferencesFile}">${props.preferencesFile}</a>
          </p>
        </div>
          `
        : ''
      }
      </div>
      `
    )
  }
})

preferences.render()

initAsyncData()

async function initAsyncData () {
  const prefs = await window.api.store.all()
  Object.keys(prefs).forEach((key, _) => {
    store.do('updateValue', key, prefs[key])
  })
  const version = await window.api.currentAppVersion()
  store.do('updateValue', 'currentAppVersion', version)
  const latest = await window.api.latestAppVersion()
  store.do('updateValue', 'latestAppVersion', latest)
  const url = await window.api.latestAppUrl()
  store.do('updateValue', 'latestAppUrl', url)
}

document.addEventListener('click', function (event) {
  if (event.target.closest('button') && event.target.closest('button').matches('.visibility')) {
    store.do('updateValue', `is${event.target.closest('button').dataset.name}Visible`, !store.get('storeValue', `is${event.target.closest('button').dataset.name}Visible`))
  }
  if (event.target.nodeName === 'A' && event.target.dataset.path !== '') {
    event.preventDefault()
    window.api.openPath(event.target.dataset.path)
    return
  }
  if (event.target.nodeName === 'A' && event.target.href !== '') {
    event.preventDefault()
    window.api.openExternal(event.target.href)
  }
})

document.addEventListener('input', function (event) {
  if (event.target.closest('div').matches('.preference')) {
    if (event.target.type === 'checkbox') {
      if (event.target.matches('.negative')) {
        store.do('updateStoreValue', event.target.value, !event.target.checked)
      } else {
        store.do('updateStoreValue', event.target.value, event.target.checked)
      }
    }
  }
})
