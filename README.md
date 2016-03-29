# eyearesee

[![Build Status](https://travis-ci.org/evanlucas/eyearesee.svg)](https://travis-ci.org/evanlucas/eyearesee)
[![Coverage Status](https://coveralls.io/repos/evanlucas/eyearesee/badge.svg?branch=master&service=github)](https://coveralls.io/github/evanlucas/eyearesee?branch=master)

A WIP IRC client using Electron.

![Screenshot](https://raw.githubusercontent.com/evanlucas/eyearesee/master/screenshot.png)

There is still quite a bit of work to be done.

**Note: Requires Node.js v5+ to run**

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

## Features

### Custom themes

#### Using a custom theme

To use a custom theme, place a css file in `$HOME/.eyearesee/themes`.
The theme will be picked up after you restart the application. To change
to your new theme, open up the global settings (`cmd+,` on OS X) and
select the theme you wish to enable.

To see the available theme selectors, view
[`client/less/theme.less`](client/less/theme.less)

## TODO

- Better logo
- UI definitely still needs some work (Header, logs, etc).
- Allow having channel properties
- Add Wiki Page for theme selectors
- The login process needs to be better
- The connection settings view needs love.

## Author

Evan Lucas

## License

MIT (See `LICENSE` for more info)
