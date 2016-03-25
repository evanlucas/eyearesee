module.exports = on;
module.exports.on = on;
module.exports.off = off;

/**
 * Module dependencies.
 */

var matches = require('matches-dom-selector')
  , on = require('dom-event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

function on(el, selector, type, fn, capture){
  return on(el, type, function(e){
    if (matches(e.target || e.srcElement, selector)) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

function off(el, type, fn, capture){
  on.off(el, type, fn, capture);
};
