'use strict'

const colors = [
  'green', 'red', 'yellow', 'blue', 'purple', 'orange'
, 'green1', 'red1', 'yellow1', 'blue1', 'purple1', 'orange1'
, 'green2', 'red2', 'yellow2', 'blue2', 'purple2', 'orange2'
, 'green3', 'red3', 'yellow3', 'blue3', 'purple3', 'orange3'
, 'green4', 'red4', 'yellow4', 'blue4', 'purple4', 'orange4'
, 'green5', 'red5', 'yellow5', 'blue5', 'purple5', 'orange5'
]

exports.colors = colors

exports.nextColor = function nextColor() {
  const color = colors.shift()
  colors.push(color)
  return color
}
