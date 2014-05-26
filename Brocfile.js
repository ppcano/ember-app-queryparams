//var mergeTrees = require('./broccoli/broccoli-merge-trees'),
var mergeTrees = require('broccoli-merge-trees'),
    es6Filter = require('broccoli-es6-module-transpiler'),
    defeatureifyFilter = require('broccoli-defeatureify'),
    fs = require('fs'),
    wrapFiles = require('broccoli-wrap'),
    match = require('./broccoli/match'),
    iife = require('./broccoli/iife'),
    append = require('./broccoli/append'),
    concatFilter = require('broccoli-concat'),
    writeFile = require('broccoli-file-creator'),
    removeFile = require('broccoli-file-remover'),
    templateCompiler = require('broccoli-ember-hbs-template-compiler'),
    pickFiles = require('broccoli-static-compiler');


/*
// appendedTrees: Should writeFile trees be used instead of appendFilter with processString??
var iifeStart = writeFile('iife-start', '(function() {');
var iifeStop  = writeFile('iife-stop', '})();');
var globalHandlebars  = writeFile('global-handlebars', "\nwindow.Handlebars = Handlebars\n");
var requireHandlebarsStart = writeFile('require-hs-start', 'function require() {\n');
var requireHandlebarsStop  = writeFile('require-hs-stop', 'return Handlebars;}\n');
*/


// --- create HandlebarsPrecompiler
var inlineTemplatePrecompiler = require('./app/submodules/ember.js/lib/broccoli-ember-inline-template-precompiler');
var generateTemplateCompiler  = require('./app/submodules/ember.js/lib/broccoli-ember-template-compiler-generator');

//setup handlebars which is required for ember-template-compiler
var handlebars = match('app', 'vendor/ember/handlebars-v1.3.0.js');
handlebars = append(handlebars, {before: "function require() {\n", after: "return Handlebars;}\n"});


var templateCompilerTree = pickFiles('app/submodules/ember.js/packages_es6/ember-handlebars-compiler/lib', {
  files: ['main.js'],
  srcDir: '/',
  destDir: '/'
});
var templateCompilerFile = 'ember-template-compiler.js';
templateCompilerTree = generateTemplateCompiler(templateCompilerTree, { srcFile: 'main.js'});
templateCompilerTree = mergeTrees([templateCompilerTree, handlebars]);
templateCompilerTree = concatFilter(templateCompilerTree, {inputFiles: ['**/*.js'], outputFile: '/'+templateCompilerFile});



var runningTest = process.env.RUNNING_TEST === 'true';





// pickFiles
var app = match('app/app', '**/*.js');
var emberData = match('app/submodules/data/packages', '*/lib/**/*.js');
var emberResolver = match('app/submodules/ember-jj-abrams-resolver/packages', '*/lib/core.js');
var emberVendoredPackages = match('app/submodules/ember.js/packages', '{backburner,metamorph,route-recognizer,router,rsvp}/lib/main.js');
var vendoredPackages = match('app/vendor/packages', '*.js');
var templates = match('app/templates', '**/*.handlebars');
var emberMain = match('app/shims', 'ember.js');




// --- templates
templates = templateCompiler(templates, {module: true});
templates = es6Filter(templates, {moduleName: function(filePath) {
                      return filePath.replace(/.js$/, '');
}});

// emberModules
var emberModules = ['container','ember-application','ember-handlebars-compiler','ember-handlebars','ember-metal','ember-routing','ember-runtime','ember-views'];
emberModules.push('ember-extension-support');
emberModules.push('ember-debug');
if (runningTest) emberModules.push('ember-testing');
emberModules = match('app', "submodules/ember.js/packages_es6/{"+emberModules.join(',')+"}/lib/**/*.js");
emberModules = es6Filter(emberModules, { moduleName: function(filePath) {
                    return filePath.replace('app/submodules/ember.js/packages_es6/','')
                                   .replace('lib/','')
                                   .replace(/.js$/, '')
                                   .replace(/\/main$/, '');
}});



var defeatureifyOptions = JSON.parse(fs.readFileSync('ember_features.json', 'utf8').toString());
defeatureifyOptions = {
  enabled:           defeatureifyOptions.features,
  debugStatements:   defeatureifyOptions.debugStatements,
  namespace:         defeatureifyOptions.namespace,
  enableStripDebug:  defeatureifyOptions.stripDebug
};

emberModules = defeatureifyFilter(emberModules, defeatureifyOptions);


emberModules = mergeTrees([emberModules, templateCompilerTree]);
emberModules = inlineTemplatePrecompiler(emberModules);
emberModules = removeFile(emberModules, {srcFile: templateCompilerFile});


// handlebarsRuntime
var handlebarsRuntime = match('app', 'vendor/ember/handlebars.runtime-v1.3.0.js');
handlebarsRuntime = append(handlebarsRuntime, {after: "\nwindow.Handlebars = Handlebars\n"});
handlebarsRuntime = iife(handlebarsRuntime);

// app
app = es6Filter(app, { moduleName: function(filePath) {
                    return filePath.replace('app/app', 'app')
                                   .replace('lib/','')
                                   .replace(/.js$/, '')
                                   .replace(/\/main$/, '');
}});


// emberData
emberData = es6Filter(emberData, { moduleName: function(filePath) {
  return filePath.replace('app/submodules/data/packages/','')
                 .replace(/.js$/, '')
}});


// compose and build app.js
var trees = [app, emberData, emberResolver, emberVendoredPackages, emberMain, emberModules, handlebarsRuntime, vendoredPackages, templates];

// ember-qunit

if ( runningTest ) {

  var emberQunit = match('app/submodules/ember-qunit/lib', '**/*.js');
  emberQunit = es6Filter(emberQunit, { transpilerOptions: {compatFix: true},
                                       moduleName: function(filePath) {
                                         return filePath.replace('app/submodules/', '')
                                           .replace('lib/','')
                                           .replace(/.js$/, '');
                                           //.replace(/\/main$/, '');  #issue: https://github.com/rpflorence/ember-qunit/issues/42 
                                   }  
  });

  trees.push(emberQunit);

  var testsUtils = match('app/tests/lib', '**/*.js');
  testsUtils = es6Filter(testsUtils, {moduleName: function(filePath) {
                                         return filePath.replace('app/tests/', '')
                                           .replace('lib/','')
                                           .replace(/.js$/, '')
                                           .replace(/\/main$/, '');  
                                     }});

  trees.push(testsUtils);

  var emberTests = match('app', 'tests/tests/**/*_test.js');
  emberTests = concatFilter(emberTests, {inputFiles: ['**/*.js'], outputFile:'/tests.js'});


}
trees = mergeTrees(trees)
trees = concatFilter(trees, {inputFiles: ['**/*.js'],outputFile:'/tmp.js'});
trees = iife(trees);

trees = mergeTrees([trees, match('app', 'submodules/ember.js/packages/loader/lib/main.js')]);
trees = concatFilter(trees, {inputFiles: ['**/*.js'],outputFile:'/app.js'});

trees = pickFiles(trees, {
  srcDir: '/',
  files: ['app.js'],
  destDir: '/source/' });

//styles
var styles = match('styles', '**/*.css');
styles = concatFilter(styles, {inputFiles: ['**/*.css'],outputFile:'/app.css'});

styles = pickFiles(styles, {
  srcDir: '/',
  files: ['app.css'],
  destDir: '/source/' });


if ( runningTest ) {

  var publicFiles = pickFiles('app', {
    srcDir: '/tests/public',
    files: ['*'],
    destDir: '/' });

  trees = [publicFiles, trees, styles, emberTests];

} else {

  var index = pickFiles('server', {
    srcDir: '/',
    files: ['index.html'],
    destDir: '/' });

  trees = [index, trees, styles];
  
}

module.exports = mergeTrees(trees);
