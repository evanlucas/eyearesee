'use strict'

const delegate = require('delegate-dom')
const tooltipComponentsByElement = new WeakMap()

// This tooltip class is derived from Bootstrap 3, but modified to not require
// jQuery, which is an expensive dependency we want to eliminate.
// This was taken from Atom

function Tooltip(element, options) {
  this.options = null
  this.enabled = null
  this.timeout = null
  this.hoverState = null
  this.element = null
  this.inState = null

  this._destroyers = []

  if (typeof element === 'string') {
    this.sel = element
    element = document.body
  }

  this.init(element, options)
}

Tooltip.VERSION = '3.3.5'

Tooltip.TRANSITION_DURATION = 150

Tooltip.DEFAULTS = {
  animation: true
, placement: 'top'
, selector: false
, template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow">' +
    '</div><div class="tooltip-inner"></div></div>'
, trigger: 'hover focus'
, title: ''
, delay: 0
, html: false
, container: false
, viewport: {
    selector: 'body'
  , padding: 0
  }
}

Tooltip.prototype.init = function init(element, options) {
  this.enabled = true
  this.element = element
  this.options = this.getOptions(options)
  // this.disposables = new EventKit.CompositeDisposable()

  if (this.options.viewport) {
    if (typeof this.options.viewport === 'function') {
      this.viewport = this.options.viewport.call(this, this.element)
    } else {
      this.viewport = document.querySelector(
        this.options.viewport.selector || this.options.viewport
      )
    }
  }
  this.inState = {click: false, hover: false, focus: false}

  if (this.element instanceof document.constructor && !this.options.selector) {
    throw new Error('`selector` option must be specified when initializing ' +
      'tooltip on the window.document object!')
  }

  const triggers = this.options.trigger.split(' ')

  for (var i = triggers.length; i--;) {
    const trigger = triggers[i]

    if (trigger === 'click') {
      let fn = (e) => {
        this.toggle(e)
      }

      delegate(this.element, this.options.selector, 'click', fn)
      this.onDestroy(() => {
        delegate.off(this.element, this.options.selector, 'click', fn)
      })
    } else if (trigger === 'manual') {
      this.show()
    } else {
      let eventIn, eventOut

      if (trigger === 'hover') {
        if (this.options.selector) {
          eventIn = 'mouseover'
          eventOut = 'mouseout'
        } else {
          eventIn = 'mouseenter'
          eventOut = 'mouseleave'
        }
      } else {
        eventIn = 'focusin'
        eventOut = 'focusout'
      }

      let enterFn = (e) => {
        this.enter(e)
      }
      delegate(this.element, this.options.selector, eventIn, enterFn)

      let leaveFn = (e) => {
        this.leave(e)
      }
      delegate(this.element, this.options.selector, eventOut, leaveFn)

      this.onDestroy(() => {
        delegate.off(this.element, this.options.selector, eventIn, enterFn)
        delegate.off(this.element, this.options.selector, eventOut, leaveFn)
      })
    }
  }

  this.options.selector
    ? (this._options = extend({}, this.options, {
      trigger: 'manual', selector: ''
      }))
    : this.fixTitle()
}

Tooltip.prototype.onDestroy = function onDestroy(cb) {
  this._destroyers.push(cb)
}

Tooltip.prototype.getDefaults = function getDefaults() {
  return Tooltip.DEFAULTS
}

Tooltip.prototype.getOptions = function getOptions(options) {
  options = extend({}, this.getDefaults(), options)

  if (options.delay && typeof options.delay === 'number') {
    options.delay = {
      show: options.delay
    , hide: options.delay
    }
  }

  return options
}

Tooltip.prototype.getDelegateOptions = function getDelegateOptions() {
  var options = {}
  var defaults = this.getDefaults()

  if (this._options) {
    for (const key of Object.getOwnPropertyNames(this._options)) {
      const value = this._options[key]
      if (defaults[key] !== value) options[key] = value
    }
  }

  return options
}

Tooltip.prototype.enter = function enter(event) {
  if (event) {
    if (event.target !== this.element) {
      this.getDelegateComponent(event.target).enter(event)
      return
    }

    this.inState[event.type === 'focusin' ? 'focus' : 'hover'] = true
  }

  if (this.getTooltipElement().classList.contains('in')
    || this.hoverState === 'in') {
    this.hoverState = 'in'
    return
  }

  clearTimeout(this.timeout)

  this.hoverState = 'in'

  if (!this.options.delay || !this.options.delay.show) return this.show()

  this.timeout = setTimeout(function() {
    if (this.hoverState === 'in') this.show()
  }.bind(this), this.options.delay.show)
}

Tooltip.prototype.isInStateTrue = function isInStateTrue() {
  for (var key in this.inState) {
    if (this.inState[key]) return true
  }

  return false
}

Tooltip.prototype.leave = function leave(event) {
  if (event) {
    if (event.target !== this.element) {
      this.getDelegateComponent(event.target).leave(event)
      return
    }

    this.inState[event.type === 'focusout' ? 'focus' : 'hover'] = false
  }

  if (this.isInStateTrue()) return

  clearTimeout(this.timeout)

  this.hoverState = 'out'

  if (!this.options.delay || !this.options.delay.hide) return this.hide()

  this.timeout = setTimeout(function() {
    if (this.hoverState === 'out') this.hide()
  }.bind(this), this.options.delay.hide)
}

Tooltip.prototype.show = function show() {
  if (this.hasContent() && this.enabled) {
    const tip = this.getTooltipElement()

    const tipId = this.getUID('tooltip')

    this.setContent()
    tip.setAttribute('id', tipId)
    this.element.setAttribute('aria-describedby', tipId)

    if (this.options.animation) tip.classList.add('fade')

    let placement = typeof this.options.placement === 'function'
      ? this.options.placement.call(this, tip, this.element)
      : this.options.placement

    const autoToken = /\s?auto?\s?/i
    const autoPlace = autoToken.test(placement)
    if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

    tip.remove()
    tip.style.top = '0px'
    tip.style.left = '0px'
    tip.style.display = 'block'
    tip.classList.add(placement)

    const container = this.options.container
    if (!container || container === 'body') {
      document.body.appendChild(tip)
    } else {
      document.querySelector(container).appendChild(tip)
    }

    const pos = this.element.getBoundingClientRect()
    const actualWidth = tip.offsetWidth
    const actualHeight = tip.offsetHeight

    if (autoPlace) {
      const orgPlacement = placement
      const viewportDim = this.viewport.getBoundingClientRect()

      placement = placement === 'bottom'
        && pos.bottom + actualHeight > viewportDim.bottom
        ? 'top'
        : placement === 'top' && pos.top - actualHeight < viewportDim.top
        ? 'bottom'
        : placement === 'right' && pos.right + actualWidth > viewportDim.width
        ? 'left'
        : placement === 'left' && pos.left - actualWidth < viewportDim.left
        ? 'right'
        : placement

      tip.classList.remove(orgPlacement)
      tip.classList.add(placement)
    }

    const calculatedOffset = this.getCalcOffset(
      placement
    , pos
    , actualWidth
    , actualHeight
    )

    this.applyPlacement(calculatedOffset, placement)

    const prevHoverState = this.hoverState
    this.hoverState = null

    if (prevHoverState === 'out') this.leave()
  }
}

Tooltip.prototype.applyPlacement = function applyPlacement(offset, placement) {
  const tip = this.getTooltipElement()

  const width = tip.offsetWidth
  const height = tip.offsetHeight

  // manually read margins because getBoundingClientRect includes difference
  const computedStyle = window.getComputedStyle(tip)

  const marginTop = parseInt(computedStyle.marginTop, 10)
  const marginLeft = parseInt(computedStyle.marginLeft, 10)

  offset.top += marginTop
  offset.left += marginLeft

  tip.style.top = offset.top + 'px'
  tip.style.left = offset.left + 'px'

  tip.classList.add('in')

  // check to see if placing tip in new offset caused the tip to resize itself
  const actualWidth = tip.offsetWidth
  const actualHeight = tip.offsetHeight

  if (placement === 'top' && actualHeight !== height) {
    offset.top = offset.top + height - actualHeight
  }

  const delta = this.getVPADelta(
    placement
  , offset
  , actualWidth
  , actualHeight
  )

  if (delta.left) offset.left += delta.left
  else offset.top += delta.top

  const isVertical = /top|bottom/.test(placement)
  const arrowDelta = isVertical
    ? delta.left * 2 - width + actualWidth
    : delta.top * 2 - height + actualHeight
  const arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

  tip.style.top = offset.top + 'px'
  tip.style.left = offset.left + 'px'

  this.replaceArrow(arrowDelta, tip[arrowOffsetPosition], isVertical)
}

Tooltip.prototype.replaceArrow = function replaceArrow(delta, dimension, v) {
  const arrow = this.getArrowElement()
  const amount = 50 * (1 - delta / dimension) + '%'

  if (v) {
    arrow.style.left = amount
    arrow.style.top = ''
  } else {
    arrow.style.top = amount
    arrow.style.left = ''
  }
}

Tooltip.prototype.setContent = function setContent() {
  const tip = this.getTooltipElement()
  const title = this.getTitle()

  var inner = tip.querySelector('.tooltip-inner')
  if (this.options.html) {
    inner.innerHTML = title
  } else {
    inner.textContent = title
  }

  tip.classList.remove('fade', 'in', 'top', 'bottom', 'left', 'right')
}

Tooltip.prototype.hide = function hide(callback) {
  this.tip && this.tip.classList.remove('in')

  if (this.hoverState !== 'in') {
    this.tip && this.tip.remove()
  }

  this.element.removeAttribute('aria-describedby')

  callback && callback()

  this.hoverState = null

  return this
}

Tooltip.prototype.fixTitle = function fixTitle() {
  if (this.element.getAttribute('title')
    || typeof this.element.getAttribute('data-original-title') !== 'string') {
    this.element.setAttribute(
      'data-original-title'
    , this.element.getAttribute('title') || ''
    )
    this.element.setAttribute('title', '')
  }
}

Tooltip.prototype.hasContent = function hasContent() {
  return this.getTitle()
}

Tooltip.prototype.getCalcOffset = function getCalcOffset(p, pos, aw, ah) {
  return p === 'bottom'
    ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - aw / 2 }
    : p === 'top'
    ? { top: pos.top - ah, left: pos.left + pos.width / 2 - aw / 2 }
    : p === 'left'
    ? { top: pos.top + pos.height / 2 - ah / 2, left: pos.left - aw }
    :/* p === 'right' */ {
      top: pos.top + pos.height / 2 - ah / 2, left: pos.left + pos.width
    }
}

Tooltip.prototype.getVPADelta = function getVPADelta(p, pos, aw, ah) {
  const delta = { top: 0, left: 0 }
  if (!this.viewport) return delta

  const viewportPadding = this.options.viewport
    && this.options.viewport.padding
    || 0
  const viewportDimensions = this.viewport.getBoundingClientRect()

  if (/right|left/.test(p)) {
    const topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
    const bottomEdgeOffset = pos.top + viewportPadding -
      viewportDimensions.scroll + ah
    if (topEdgeOffset < viewportDimensions.top) { // top overflow
      delta.top = viewportDimensions.top - topEdgeOffset
    } else if (bottomEdgeOffset > viewportDimensions.top +
        viewportDimensions.height) { // bottom overflow
      delta.top = viewportDimensions.top + viewportDimensions.height -
        bottomEdgeOffset
    }
  } else {
    const leftEdgeOffset = pos.left - viewportPadding
    const rightEdgeOffset = pos.left + viewportPadding + aw
    if (leftEdgeOffset < viewportDimensions.left) { // left overflow
      delta.left = viewportDimensions.left - leftEdgeOffset
    } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
      delta.left = viewportDimensions.left + viewportDimensions.width -
        rightEdgeOffset
    }
  }

  return delta
}

Tooltip.prototype.getTitle = function getTitle() {
  const title = this.element.getAttribute('data-original-title')
  if (title) {
    return title
  } else {
    return (typeof this.options.title === 'function')
      ? this.options.title.call(this.element)
      : this.options.title
  }
}

Tooltip.prototype.getUID = function getUID(prefix) {
  do prefix += ~~(Math.random() * 1000000)
  while (document.getElementById(prefix))
  return prefix
}

Tooltip.prototype.getTooltipElement = function getTooltipElement() {
  if (!this.tip) {
    let div = document.createElement('div')
    div.innerHTML = this.options.template
    if (div.children.length !== 1) {
      throw new Error('Tooltip `template` option must consist of exactly 1 ' +
        'top-level element!')
    }
    this.tip = div.firstChild
  }
  return this.tip
}

Tooltip.prototype.getArrowElement = function getArrowElement() {
  this.arrow = this.arrow
    || this.getTooltipElement().querySelector('.tooltip-arrow')
  return this.arrow
}

Tooltip.prototype.enable = function enable() {
  this.enabled = true
}

Tooltip.prototype.disable = function disable() {
  this.enabled = false
}

Tooltip.prototype.toggleEnabled = function toggleEnabled() {
  this.enabled = !this.enabled
}

Tooltip.prototype.toggle = function toggle(event) {
  if (event) {
    if (event.currentTarget !== this.element) {
      this.getDelegateComponent(event.currentTarget).toggle(event)
      return
    }

    this.inState.click = !this.inState.click
    if (this.isInStateTrue()) this.enter()
    else this.leave()
  } else {
    this.getTooltipElement().classList.contains('in')
      ? this.leave()
      : this.enter()
  }
}

Tooltip.prototype.destroy = function destroy() {
  clearTimeout(this.timeout)
  this.tip && this.tip.remove()
  // call the _destroyers
  // they should be cleaning up
  this._destroyers.forEach((fn) => {
    fn()
  })
}

Tooltip.prototype.getDelegateComponent = function getDelegateComponent(el) {
  let component = tooltipComponentsByElement.get(el)
  if (!component) {
    component = new Tooltip(el, this.getDelegateOptions())
    tooltipComponentsByElement.set(el, component)
  }
  return component
}

function extend() {
  const args = new Array(arguments.length)
  for (let i = 0; i < args.length; i++) {
    args[i] = arguments[i]
  }
  const target = args.shift()
  let source = args.shift()
  while (source) {
    for (var key of Object.getOwnPropertyNames(source)) {
      target[key] = source[key]
    }
    source = args.shift()
  }
  return target
}

module.exports = Tooltip
