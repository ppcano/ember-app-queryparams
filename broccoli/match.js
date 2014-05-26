var PickFiles = require('broccoli-static-compiler');


module.exports = Match
Match.prototype = Object.create(PickFiles.prototype)
Match.prototype.constructor = Match

function Match(tree, match) {
  
  // If tree is empty, liveReload fails and `failed to stat` warning
  if (!(this instanceof Match)) return new Match(tree, match)
  this.inputTree = tree
  this.inputFiles = null;
  this.options = {
    srcDir: '/',
    files: [match],
    destDir: tree
  }
}
