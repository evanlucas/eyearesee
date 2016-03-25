
# delegate-dom

  Low-level event delegation library.

## Install

    $ npm install delegate-dom

## Example

```js
var delegate = require('delegate')

fn = delegate.on(document.body, 'ul li a', 'click', function (e) {
  delegate.off(document.body, 'click', fn);
})
```

## License

  MIT
