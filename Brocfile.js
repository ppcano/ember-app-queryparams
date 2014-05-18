var mergeTrees = require('broccoli-merge-trees'),
    es6Filter = require('broccoli-es6-module-transpiler'),
    //defeatureifyFilter = require('./broccoli/defeatureify'),
    defeatureifyFilter = require('broccoli-defeatureify'),
    fs = require('fs'),
    //replace = require('./broccoli/replace'),
    wrapFiles = require('broccoli-wrap'),
    match = require('./broccoli/match'),
    precompiler = require('./broccoli/precompiler').Filter,
    createPrecompilerModule = require('./broccoli/precompiler').CreatePrecompilerModule,
    iife = require('./broccoli/iife'),
    emberTemplateCompiler = require('./broccoli/ember_template_compiler'),
    append = require('./broccoli/append'),
    concatFilter = require('./broccoli/obsolete/concat'),
    //concatFilter = require('broccoli-concat'),
    pickFiles = require('broccoli-static-compiler');

var runningTest = process.env.RUNNING_TEST === 'true';


// This file creation is only done at the design process
// so live-reloading do not work
var compilerInput = 'app/submodules/ember.js/packages_es6/ember-handlebars-compiler/lib/main.js';
var compilerOutput = 'tmp/ember-handlebars-compiler.js';
emberTemplateCompiler(compilerInput, compilerOutput);

// setup precompiler
handlebarsPath = "app/vendor/handlebars-v1.3.0.js";
precompiler.prototype.module = createPrecompilerModule(compilerOutput, handlebarsPath);


// pickFiles
var app = match('app', 'app/**/*.js');
var emberData = match('app', 'submodules/data/packages/*/lib/**/*.js');
var emberResolver = match('app', 'submodules/ember-jj-abrams-resolver/packages/*/lib/core.js');
var emberAmdLibs = match('app', 'submodules/ember.js/packages_es6/*/lib/**/*.amd.js');
var emberLibs = match('app', 'submodules/ember.js/packages/{rsvp,metamorph}/lib/main.js');
var emberModules = match('app', 'submodules/ember.js/packages_es6/*/lib/**/!(*.amd).js');//https://github.com/isaacs/node-glob/issues/62
var handlebarsRuntime = match('app', 'vendor/handlebars.runtime-v1.3.0.js');
var jquery = match('app', 'vendor/jquery-1.9.1.js');
var templates = match('app', 'templates/**/*.handlebars');


var emberMain = match('app', 'shims/ember.js');


var es6Options = { moduleName: function(filePath) {
                    return filePath.replace('app/app', 'app')
                                   .replace('app/submodules/ember.js/packages/','')
                                   .replace('app/submodules/ember.js/packages_es6/','')
                                   .replace('lib/','')
                                   .replace(/.js$/, '')
                                   .replace(/\/main$/, '');
                  }};




// templates
templates = precompiler(templates, {templateNameGenerator: function(filePath) {
  return filePath.replace('app/templates/','')
                 .replace(/\.[^/.]+$/, "");
}});

templates = concatFilter(templates, 'templates.js');
//templates = concatFilter(templates, {inputFiles: ['**/*.handlebars'],outputFile:'/templates.js'});

templates = append(templates, {before: true, content: "import Ember from \"ember-metal/core\";\n import \"ember\";"});
templates = es6Filter(templates, {moduleName: 'app/templates'});

// emberModules
emberModules = es6Filter(emberModules, es6Options);


var defeatureifyOptions = JSON.parse(fs.readFileSync('ember_features.json', 'utf8').toString());
defeatureifyOptions = {
  enabled:           defeatureifyOptions.features,
  debugStatements:   defeatureifyOptions.debugStatements,
  namespace:         defeatureifyOptions.namespace,
  enableStripDebug:  defeatureifyOptions.stripDebug
};

emberModules = defeatureifyFilter(emberModules, defeatureifyOptions);
emberModules = precompiler(emberModules);

// emberMain
//emberMain = es6Filter(emberMain, es6Options);

// handlebarsRuntime
handlebarsRuntime = append(handlebarsRuntime, {before: false, content: "\nwindow.Handlebars = Handlebars\n"});
handlebarsRuntime = iife(handlebarsRuntime);

// app
app = es6Filter(app, es6Options);

// emberData
emberData = es6Filter(emberData, { moduleName: function(filePath) {
  return filePath.replace('app/submodules/data/packages/','')
                 .replace(/.js$/, '')
}});


// compose and build app.js
var trees = [app, emberData, emberResolver, emberAmdLibs, emberLibs, emberMain, emberModules, handlebarsRuntime, jquery, templates];

// ember-qunit

if ( runningTest ) {

  var emberQunit = match('app', 'submodules/ember-qunit/lib/**/*.js');
  emberQunit = es6Filter(emberQunit, { transpilerOptions: {compatFix: true},
                                       moduleName: function(filePath) {
                                         return filePath.replace('app/submodules/', '')
                                           .replace('lib/','')
                                           .replace(/.js$/, '');
                                           //.replace(/\/main$/, '');  #issue: https://github.com/rpflorence/ember-qunit/issues/42 
                                   }  
  });

  //var emberQunit = match('app', 'submodules/ember-qunit/dist/named-amd/*.js');
  //emberQunit = replace(emberQunit, { match: /\"ember-qunit\"/g, replacement: "\"ember-qunit\/main\"" } );

  trees.push(emberQunit);

  var testsUtils = match('app', 'tests/lib/**/*.js');
  testsUtils = es6Filter(testsUtils, {moduleName: function(filePath) {
                                         return filePath.replace('app/tests/', '')
                                           .replace('lib/','')
                                           .replace(/.js$/, '')
                                           .replace(/\/main$/, '');  
                                     }});

  trees.push(testsUtils);

  var emberTests = match('app', 'tests/tests/**/*_test.js');
  emberTests = concatFilter(emberTests, 'tests.js');
  //emberTests = concatFilter(emberTests, {inputFiles: ['**/*.js'], outputFile:'/tests.js'});


}
trees = new mergeTrees(trees)
trees = concatFilter(trees, 'app.js');
//trees = concatFilter(trees, {inputFiles: ['**/*.js'],outputFile:'/app.js'});
trees = iife(trees);
trees = append(trees, {before: true, path: "app/submodules/ember.js/packages/loader/lib/main.js"});


var publicFiles;

if ( runningTest ) {

  publicFiles = pickFiles('app', {
    srcDir: '/tests/public',
    destDir: '/' });

  trees = [publicFiles, trees, emberTests];

} else {

  publicFiles = pickFiles('broccoli_public', {
    srcDir: '/',
    destDir: '/' });

  trees = [publicFiles, trees]
}

trees = new mergeTrees(trees)
module.exports = trees;
