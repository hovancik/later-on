# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [0.1.0] - 2021-04-22
### Added
- Preferences window
- option to autostart LaterOn on loggin in (MacOS, Windows)
- option to follow Do Not Disturb mode and not show reminders while active
- show version information in Preferences (current and latest version)
- show debug information in Preferences
- show 20 upcoming reminders in tray menu

### Changed
- move 'Open logs' and 'Open config' from tray menu to Preferences -> Debug
- improve UI
- show LaterOn on MacOS's dock

## [0.0.4] - 2021-04-22
### Changed
- removed reminder's name in favor of UUID
- adding new Reminder is first in UI and can be hidden/shown

## [0.0.3] - 2021-03-26
### Fixed
- fix default reminder's notification

### Changed
- improve UI

## [0.0.2] - 2021-03-13
### Added
- UI for adding, removing and updating reminders

### Changed
- new format for saving data in config file

## [0.0.1] - 2021-01-17
### Added
- tray menu to open logs
- tray menu to open config file
- `cron`, `once` and `repeat` reminders

[Unreleased]: https://github.com/hovancik/later-on/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/hovancik/later-on/releases/tag/v0.1.0
[0.0.4]: https://github.com/hovancik/later-on/releases/tag/v0.0.4
[0.0.3]: https://github.com/hovancik/later-on/releases/tag/v0.0.3
[0.0.2]: https://github.com/hovancik/later-on/releases/tag/v0.0.2
[0.0.1]: https://github.com/hovancik/later-on/releases/tag/v0.0.1
