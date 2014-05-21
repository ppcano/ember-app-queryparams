var AppendFilter = require('./append');

module.exports = IIFE;
IIFE.prototype = Object.create(AppendFilter.prototype);
IIFE.prototype.constructor = IIFE;

function IIFE (inputTree, options) {
  if (!(this instanceof IIFE)) {
    return new IIFE(inputTree, options);
  }
  this.inputTree = inputTree;
  this.options = options || {};

  if (this.options.extensions != null) this.extensions = this.options.extensions
  if (this.options.targetExtension != null) this.targetExtension = this.options.targetExtension

  this.before = '(function() {\n';
  this.after = '\n})();\n';
}
