Reef.debug(true)
document.body.classList.add(window.api.platform())

const store = new Reef.Store({
  data: {
    store: {},
    isGeneralVisible: true
  },
  setters: {
    initPreferencesStore: (props) => {
      props.store = window.api.store.all()
    },
    updateValue: (props, key, value) => {
      props[key] = value
    },
    updateStoreValue: (props, key, value) => {
      window.api.store.set(key, value)
      props.store[key] = value
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
          <input type="checkbox" value="openAtLogin" id="openAtLogin" reef-checked="${props.store.openAtLogin}">
          <label for="openAtLogin">Start LaterOn automatically when loggin in</label>
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

store.do('initPreferencesStore')

document.addEventListener('click', function (event) {
  if (event.target.closest('button') && event.target.closest('button').matches('.visibility')) {
    store.do('updateValue', `is${event.target.closest('button').dataset.name}Visible`, !store.get('storeValue', `is${event.target.closest('button').dataset.name}Visible`))
  }
})

document.addEventListener('input', function (event) {
  if (event.target.closest('div').matches('.preference')) {
    if (event.target.type === 'checkbox') {
      store.do('updateStoreValue', event.target.value, event.target.checked)
    }
  }
})
