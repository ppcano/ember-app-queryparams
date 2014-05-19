var AppendFilter = require('./append');

module.exports = Filter;
Filter.prototype = Object.create(AppendFilter.prototype);
Filter.prototype.constructor = Filter;

function Filter (inputTree, options) {
  if (!(this instanceof Filter)) {
    return new Filter(inputTree, options);
  }
  this.inputTree = inputTree;
  this.options = options || {};

  if (this.options.extensions != null) this.extensions = this.options.extensions
  if (this.options.targetExtension != null) this.targetExtension = this.options.targetExtension

  this.before = '(function() {\n';
  this.after = '\n})();\n';
}
