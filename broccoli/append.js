
// we could use writeFile 
var BroccoliFilter = require('broccoli-filter');
var fs = require('fs');


module.exports = Filter;
Filter.prototype = Object.create(BroccoliFilter.prototype);
Filter.prototype.constructor = Filter;

function Filter (inputTree, options) {
  if (!(this instanceof Filter)) {
    return new Filter(inputTree, options);
  }
  this.inputTree = inputTree;
  this.options = options || {};

  if (this.options.extensions != null) this.extensions = this.options.extensions
  if (this.options.targetExtension != null) this.targetExtension = this.options.targetExtension

  this.before = options.before;
  this.after = options.after;

}

Filter.prototype.extensions = ['js']


Filter.prototype.processString = function (fileContents, filePath) {

  var result = '';

  if ( this.before ) result += this.before;
  result += fileContents;
  if ( this.after ) result += this.after;

  return result;
};
