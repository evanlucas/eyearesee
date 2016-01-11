# eyearesee

[![Build Status](https://travis-ci.org/evanlucas/eyearesee.svg)](https://travis-ci.org/evanlucas/eyearesee)
[![Coverage Status](https://coveralls.io/repos/evanlucas/eyearesee/badge.svg?branch=master&service=github)](https://coveralls.io/github/evanlucas/eyearesee?branch=master)

A WIP IRC client using Electron.

![Screenshot](https://raw.githubusercontent.com/evanlucas/eyearesee/master/screenshot.png)

There is still quite a bit of work to be done.

## To run locally:

```bash
$ git clone git://github.com/evanlucas/eyearesee
$ cd eyearesee
$ npm install
$ npm run dev
```

## Test

```bash
$ npm test
```

## TODO

- Allow creating more than one connection.
- Fix updating connection settings.
- Implement more commands. Basic functionality works though.
- Respect `showEvents` property for connections.
- Better logo
- UI definitely still needs some work (Header, logs, etc).
- Decide if we do really want to show users in private messages.
- Allow having channel properties
- Persist channels so they can be auto joined on re-open.

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
