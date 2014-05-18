var BroccoliFilter = require('broccoli-filter'),
    path = require('path'),
    Promise = require('rsvp').Promise,
    fs = require('fs');


Filter.prototype = Object.create(BroccoliFilter.prototype);
Filter.prototype.constructor = Filter;

function Filter (inputTree, options) {
  if (!(this instanceof Filter)) return new Filter(inputTree, options);

  options = options || {};
  this.inputTree = inputTree;
  this.templateName = options.templateName;
  this.compilerPath = options.compilerPath || 'ember-template-compiler.js';
}

Filter.prototype.extensions = ['handlebars', 'hbs']

Filter.prototype._precompileTemplate = function (templateName, data) {
  
  //is this.inputTree.tmpDestDir public api?
  var compilerPath = path.join(this.inputTree.tmpDestDir, this.compilerPath);
  var compiler = require(path.resolve(compilerPath));
  var precompiledData = compiler.precompile(data).toString();

  return "\nEmber.TEMPLATES['"+templateName+"'] = Ember.Handlebars.template("+precompiledData+");\n"
}



Filter.prototype.processString = function (fileContents, filePath) {

  return this._precompileTemplate(this.templateName(filePath), fileContents);  

};

module.exports = Filter;
