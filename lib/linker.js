'use strict'

const Autolinker = require('autolinker')
const pullRequestRE = /github\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/([\d\w]+)\/?/
const autolinker = new Autolinker({
  twitter: false
, hashtags: false
, className: 'external-url'
, replaceFn: function(al, match) {
    if (match.getType() === 'url') {
      const url = match.getUrl()
      if (~url.indexOf('github.com')) {
        const tag = al.getTagBuilder().build(match)
        let matches = url.match(pullRequestRE)
        if (!matches)
          return true

        if (matches[3] === 'pull' || matches[3] === 'issues') {
          tag.setInnerHtml(`${matches[1]}/${matches[2]}#${matches[4]}`)
          return tag.toAnchorString()
        } else if (matches[3] === 'commit') {
          let sha = matches[4]
          if (sha.length === 40) {
            sha = sha.substring(0, 8)
          }
          tag.setInnerHtml(`${matches[1]}/${matches[2]}@${sha}`)
          return tag.toAnchorString()
        }
      }
    }
    return true
  }
})
module.exports = function linker(str) {
  return autolinker.link(str)
}
