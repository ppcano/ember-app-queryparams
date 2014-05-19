/*
var inlineTemplatePrecompiler = require('./app/submodules/ember.js/lib/broccoli-ember-inline-template-precompiler');
var generateTemplateCompiler  = require('./app/submodules/ember.js/lib/broccoli-ember-template-compiler-generator');

//setup handlebars which is required for ember-template-compiler
var handlebars = match('app', 'vendor/handlebars-v1.3.0.js');
handlebars = append(handlebars, {before: "function require() {\n", after: "return Handlebars;}\n"});


var templateCompilerTree = pickFiles('app/submodules/ember.js/packages_es6/ember-handlebars-compiler/lib', {
  files: ['main.js'],
  srcDir: '/',
  destDir: '/'
});
var templateCompilerFile = 'ember-template-compiler.js';

templateCompilerTree = generateTemplateCompiler(templateCompilerTree, { srcFile: 'main.js'});
templateCompilerTree = mergeTrees([templateCompilerTree, handlebars]);
templateCompilerTree = concatFilter(templateCompilerTree, templateCompilerFile);
templates = mergeTrees([templates, templateCompilerTree]);
templates = templatePrecompiler(templates, {templateName: function(filePath) {
  return filePath.replace('app/templates/','')
                 .replace(/\.[^/.]+$/, "");
}});
templates = removeFile(templates, {srcFile: templateCompilerFile});


templates = concatFilter(templates, 'templates.js');
templates = append(templates, {before: "import Ember from \"ember-metal/core\";\n import \"ember\";"});

var BroccoliFilter = require('broccoli-filter'),
    path = require('path'),
    Promise = require('rsvp').Promise,
    fs = require('fs');
*/

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
