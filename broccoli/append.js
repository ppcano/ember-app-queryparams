
// we could use writeFile 
var BroccoliFilter = require('broccoli-filter');
var fs = require('fs');


module.exports = Append;
Append.prototype = Object.create(BroccoliFilter.prototype);
Append.prototype.constructor = Append;

function Append (inputTree, options) {
  if (!(this instanceof Append)) {
    return new Append(inputTree, options);
  }
  this.inputTree = inputTree;
  this.options = options || {};

  if (this.options.extensions != null) this.extensions = this.options.extensions
  if (this.options.targetExtension != null) this.targetExtension = this.options.targetExtension

  this.before = options.before;
  this.after = options.after;

}

Append.prototype.extensions = ['js']


Append.prototype.processString = function (fileContents, filePath) {

  var result = '';

  if ( this.before ) result += this.before;
  result += fileContents;
  if ( this.after ) result += this.after;

  return result;
};
