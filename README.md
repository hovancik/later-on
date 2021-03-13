# LaterOn [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codecov](https://codecov.io/gh/hovancik/later-on/branch/master/graph/badge.svg)](https://codecov.io/gh/hovancik/later-on)

<img src="later-on.png" align="right" alt="LaterOn logo">

> **The reminder app**

*LaterOn* is a cross-platform [Electron](https://www.electronjs.org/) app that allows you to create custom reminders.

Currently, *LaterOn* is considered an *alpha*-quality software. There's a UI to add/change/remove the reminders, plus menu items in Tray that allow you to open UI, quickly open config file, log file and Quit the app.

Download from [Releases page](https://github.com/hovancik/later-on/releases).

[![Become a Sponsor!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=success)](https://github.com/sponsors/hovancik) [![Become a Patron!](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=Patreon&color=success)](https://www.patreon.com/hovancik)


## Reminders

Reminders appear in a form of a regular OS notification.

<img src="notification.png" alt="LaterOn notification" height="100">

You can set title and body of such a notification and when you would like it to be run.

<img src="reminders.png" alt="LaterOn">

### Config file

You can add new reminders by editing config file (from tray menu) and then restarting *LaterOn* to load the changes done.

Error will not be show if your timings can't be parsed, so you might want to check the log file when making changes via config file.

#### Single run reminders

On the first app run, example reminder gets created: we want to run only once (`"type": "once"`), but don't want to remove it (`"keep": true`) - user should do it manually. It will run ~10s every time after the app gets started (`"interval": "every 10 seconds"`).

```json
{
  "reminders": [
    {
      "name": "later-on",
      "type": "once",
      "interval": "every 10 seconds",
      "keep": true,
      "title": "Welcome to Later On!",
      "body": "Read more at https://lateron.app."
    }
  ]
}
```
We use [this text parser](https://breejs.github.io/later/parsers.html#text) to specify when the reminder should be run.

#### Multiple run reminders

 Let's say you want to reminder yourself to drink water every 2 hours. Specify [your interval](https://breejs.github.io/later/parsers.html#text) via `"type": "repeat"`.

```json
{
  "name": "water",
  "type": "repeat",
  "interval": "every 2 hours",
  "title": "Drink up!",
  "body": "Drink some water. Refill your cup if needed."
}
```

#### Cron reminders
You can also use [cron](https://breejs.github.io/later/parsers.html#cron) synstax, ie. reminder to leave work at 5:15PM:

```json
{
  "name": "leave-work",
  "type": "cron",
  "interval": "15 17 ? * *",
  "title": "Time to go :)",
  "body": "Let's clock out, fill the time-sheets and run! "
}
```

## Credits

[Icon](https://www.flaticon.com/free-icon/ecology_2768313) made by [Freepik](http://www.freepik.com/) from [Flaticon](https://www.flaticon.com/).
