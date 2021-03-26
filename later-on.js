Reef.debug(true)

const store = new Reef.Store({
  data: {
    reminders: [],
    newReminder: {
      type: 'repeat',
      validation: '',
      canSubmit: false
    }
  },
  setters: {
    initReminders: function (props, reminders) {
      reminders.forEach((item, index) => {
        const defaults = {
          editing: false,
          editingType: item.type,
          validation: '',
          canSubmit: true
        }
        props.reminders[index] = Object.assign(item, defaults)
      })
    },
    removeReminder: function (props, index) {
      props.reminders.splice(index, 1)
    },
    updateReminder: function (props, index, reminder) {
      const defaults = {
        editing: false,
        editingType: reminder.type,
        validation: '',
        canSubmit: true
      }
      props.reminders[index] = Object.assign(reminder, defaults)
    },
    updateValue: function (props, index, name, value) {
      if (name === 'editing') {
        props.reminders[index].editing = !props.reminders[index].editing
      } else {
        props.reminders[index][name] = value
      }
    },
    cancelNew: function (props) {
      props.newReminder = {
        type: 'repeat',
        validation: '',
        canSubmit: false
      }
    },
    updateNewValue: function (props, name, value) {
      props.newReminder[name] = value
    },
    addReminder: function (props, reminder) {
      const defaults = {
        editing: false,
        editingType: reminder.type,
        validation: '',
        canSubmit: true
      }
      props.reminders.push(Object.assign(reminder, defaults))
    }
  },
  getters: {
    reminder: function (props, index) {
      return props.reminders[index]
    }
  }
})

const reminders = new Reef('#reminders', {
  store: store,
  allowHTML: true,
  template: function (props) {
    return (
      props.reminders.map((reminder, index) => {
        return `
          <div class='box' data-index="${index}">
            <nav class="level">
              <div class="level-left">
                <div class="level-item">
                  <span class="title">${reminder.name}</span>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item buttons">
                  <button class="button is-light is-small is-info edit">
                    <span>Edit</span>
                    <span class="icon is-small">
                      <i class="fas fa-edit"></i>
                    </span>
                  </button>
                  <button class="button is-light is-small is-danger remove">
                    <span>Remove</span>
                    <span class="icon is-small">
                      <i class="fas fa-trash-alt"></i>
                    </span>
                  </button>
                </div>
              </div>
            </nav>
            ${reminder.editing
              ? `
                  <form class="edit">
                    <input type="text" name="oldname" value="${reminder.name}" hidden>
                    <div class="field">
                      <label class="label" for="name">Name</label>
                      <div class="control">
                        <input class="input" type="text" name="name" reef-default-value="${reminder.name}" placeholder="Unique name">
                      </div>
                    </div>
                    <div class="field">
                      <label class="label">Notification title</label>
                      <div class="control">
                        <input class="input" name="title" type="text" reef-default-value="${reminder.title}" placeholder="Notification title">
                      </div>
                    </div>
                    <div class="field">
                      <label class="label">Notification body</label>
                      <div class="control">
                        <input class="input" name="body" type="text" reef-default-value="${reminder.body}" placeholder="Notification body">
                      </div>
                    </div>
                    <div class="field">
                      <label class="label">Type</label>
                      <div class="control">
                        <div class="select">
                          <select name="type">
                            <option ${reminder.type === 'repeat' ? 'reef-default-selected' : ''}>repeat</option>
                            <option ${reminder.type === 'once' ? 'reef-default-selected' : ''}>once</option>
                            <option ${reminder.type === 'cron' ? 'reef-default-selected' : ''}>cron</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div class="field">
                    ${reminder.editingType === 'once'
                      ? `<label class="checkbox">
                          <input type="checkbox" name="keep" ${reminder.keep ? 'reef-default-checked' : ''} >
                          Don't remove after the notification.
                        </label>`
                      : ''
                    }
                    </div>
                    <div class="field">
                      <label class="label">Interval</label>
                      <div class="control">
                        <input class="input" name="interval" type="text" reef-default-value="${reminder.interval}" placeholder="Interval">
                      </div>
                    </div>
                    <div class="field">
                      <p class="help validation">${reminder.validation}</p>
                    </div>
                    <div class="field is-grouped">
                      <div class="control">
                        <a class="button is-link submit update" ${reminder.canSubmit ? '' : 'disabled'}>Submit</a>
                      </div>
                      <div class="control">
                        <button class="button is-link is-light edit">Cancel</button>
                      </div>
                    </div>
                  </form>
                `
              : `
                <article class='message is-info'>
                  <div class='message-body'>
                    <strong>${reminder.title}</strong><br/>
                    ${reminder.body}
                  </div>
                </article>
                <article class='icon-text'>
                  <span class='icon'>
                    <i class='fas fa-bell'></i>
                  </span>
                  ${reminder.schedules.map((t) => {
                  return `
                  <span class='icon'>
                    <i class='fas fa-arrow-right'></i>
                  </span>
                  <span>${new Date(t).toLocaleString()}</span>
                  `
                  }).join('')}
                </article>
                <article>
                  <span class='icon'>
                    <i class='fas fa-sync-alt'></i>
                  </span>
                  <strong>${reminder.type}</strong>
                  ${reminder.interval}
                  ${reminder.keep ? '<span class="tag is-info is-light">Keep</span>' : ''}
                </article>
              `
            }
          </div>
        `
      }).join('')
    )
  }
})

reminders.render()

document.addEventListener('click', function (event) {
  if (event.target.closest('button') && event.target.closest('button').matches('.remove')) {
    event.preventDefault()
    const confirmation = confirm('Are you sure you want to remove this reminder?')
    if (confirmation) {
      const dataset = event.target.closest('.box').dataset
      window.api.removeReminder(dataset.index, (index) => {
        store.do('removeReminder', index)
      })
    }
  }

  if (event.target.closest('button') && event.target.closest('button').matches('.edit')) {
    event.preventDefault()
    const dataset = event.target.closest('.box').dataset
    store.do('updateValue', dataset.index, 'editing', '')
  }

  if (event.target.matches('.submit.update')) {
    event.preventDefault()
    const dataset = event.target.closest('.box').dataset
    const form = event.target.closest('form')
    const data = new FormData(form)
    const formObj = Object.fromEntries(data)
    const confirmation = confirm('Are you sure you want to update this reminder?')
    if (confirmation) {
      window.api.updateReminder(dataset.index, formObj, (reminder) => {
        store.do('updateReminder', dataset.index, reminder)
      })
    }
  }
}, false)

document.addEventListener('input', function (event) {
  if (event.target.closest('form').matches('.edit')) {
    const index = event.target.closest('.box').dataset.index
    const form = event.target.closest('.box').querySelector('form')
    const formData = new FormData(form)
    const input = Object.fromEntries(formData)

    if (event.target.name === 'type') {
      store.do('updateValue', index, 'editingType', event.target.value)
    }

    window.api.validateInterval(input, (data) => {
      if (data.error === -1 && data.canUseName) {
        store.do('updateValue', index, 'canSubmit', true)
        store.do('updateValue', index, 'validation', data.schedules.map((t) => {
          return `
            <span class='icon'>
              <i class='fas fa-arrow-right'></i>
            </span>
            <span>${new Date(t).toLocaleString()}</span>
            `
        }).join(''))
      } else {
        store.do('updateValue', index, 'canSubmit', false)
        store.do('updateValue', index, 'validation', `<span class='icon'>
          <i class='fas fa-exclamation-circle'></i></span>
          ${data.error >= 0 ? `Error at interval: ${data.error}` : ''}
          ${data.error >= 0 && !data.canUseName ? ', ' : ''}
          ${!data.canUseName ? 'Error at name: please, choose another' : ''}
          `)
      }
    })
  }
}, false)

window.api.receive('initReminders', (data) => {
  store.do('initReminders', data)
})

const newReminder = new Reef('#new', {
  store: store,
  allowHTML: true,
  template: function (props) {
    const newReminder = props.newReminder
    return `<div class='box'>
      <div class='content'>
        <h2 class="title">Add new Reminder</h2>
        <form class="new">
          <input type="text" name="oldname" value="\`" hidden>
          <div class="field">
            <label class="label" for="name">Name</label>
            <div class="control">
              <input class="input" type="text" name="name" placeholder="Unique name">
            </div>
          </div>
          <div class="field">
            <label class="label">Notification title</label>
            <div class="control">
              <input class="input" name="title" type="text" placeholder="Notification title">
            </div>
          </div>
          <div class="field">
            <label class="label">Notification body</label>
            <div class="control">
              <input class="input" name="body" type="text" placeholder="Notification body">
            </div>
          </div>
          <div class="field">
            <label class="label">Type</label>
            <div class="control">
              <div class="select">
                <select name="type">
                  <option>repeat</option>
                  <option>once</option>
                  <option>cron</option>
                </select>
              </div>
            </div>
          </div>
          <div class="field">
          ${newReminder.type === 'once'
            ? `<label class="checkbox">
                <input type="checkbox" name="keep">
                Don't remove after the notification.
              </label>`
            : ''
          }
          </div>
          <div class="field">
            <label class="label">Interval</label>
            <div class="control">
              <input class="input" name="interval" type="text" placeholder="Interval">
            </div>
          </div>
          <div class="field">
            <p class="help validation">${newReminder.validation}</p>
          </div>
          <div class="field is-grouped">
            <div class="control">
              <a class="button is-link submit new" ${newReminder.canSubmit ? '' : 'disabled'}>Submit</a>
            </div>
            <div class="control">
              <a class="button is-link is-light cancel new">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    </div>`
  }
})

newReminder.render()

document.addEventListener('click', function (event) {
  if (event.target.matches('.cancel.new')) {
    store.do('cancelNew')
    event.target.closest('form').reset()
  }

  if (event.target.matches('.submit.new')) {
    const form = event.target.closest('form')
    const data = new FormData(form)
    const formObj = Object.fromEntries(data)
    const confirmation = confirm('Are you sure you want to add this reminder?')
    if (confirmation) {
      window.api.addReminder(formObj, (reminder) => {
        store.do('addReminder', reminder)
        store.do('cancelNew')
        event.target.closest('form').reset()
      })
    }
  }
})

document.addEventListener('input', function (event) {
  if (event.target.closest('form').matches('.new')) {
    const form = event.target.closest('form')
    const formData = new FormData(form)
    const input = Object.fromEntries(formData)

    store.do('updateNewValue', event.target.name, event.target.value)

    window.api.validateInterval(input, (data) => {
      if (data.error === -1 && data.canUseName) {
        store.do('updateNewValue', 'canSubmit', true)
        store.do('updateNewValue', 'validation', data.schedules.map((t) => {
          return `
            <span class='icon'>
              <i class='fas fa-arrow-right'></i>
            </span>
            <span>${new Date(t).toLocaleString()}</span>
            `
        }).join(''))
      } else {
        store.do('updateNewValue', 'canSubmit', false)
        store.do('updateNewValue', 'validation', `<span class='icon'>
          <i class='fas fa-exclamation-circle'></i></span>
          ${data.error >= 0 ? `Error at interval: ${data.error}` : ''}
          ${data.error >= 0 && !data.canUseName ? ', ' : ''}
          ${!data.canUseName ? 'Error at name: please, choose another' : ''}
          `)
      }
    })
  }
}, false)
