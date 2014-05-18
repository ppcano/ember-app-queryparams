var mergeTrees = require('broccoli-merge-trees'),
    es6Filter = require('broccoli-es6-module-transpiler'),
    defeatureifyFilter = require('broccoli-defeatureify'),
    fs = require('fs'),
    wrapFiles = require('broccoli-wrap'),
    match = require('./broccoli/match'),
    iife = require('./broccoli/iife'),
    append = require('./broccoli/append'),
    concatFilter = require('./broccoli/obsolete/concat'),
    concatTreeFilter = require('broccoli-concat'),
    removeFile = require('broccoli-file-remover'),
    pickFiles = require('broccoli-static-compiler');





// --- create HandlebarsPrecompiler
var templatePrecompiler = require('./broccoli/ember-template-precompiler');
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



var runningTest = process.env.RUNNING_TEST === 'true';


// pickFiles
var app = match('app', 'app/**/*.js');
var emberData = match('app', 'submodules/data/packages/*/lib/**/*.js');
var emberResolver = match('app', 'submodules/ember-jj-abrams-resolver/packages/*/lib/core.js');
var emberVendoredPackages = match('app', 'submodules/ember.js/packages/{backburner,metamorph,route-recognizer,router,rsvp}/lib/main.js');
var emberModules = match('app', 'submodules/ember.js/packages_es6/*/lib/**/!(*.amd).js');
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




templates = mergeTrees([templates, templateCompilerTree]);
templates = templatePrecompiler(templates, {templateName: function(filePath) {
  return filePath.replace('app/templates/','')
                 .replace(/\.[^/.]+$/, "");
}});
templates = removeFile(templates, {srcFile: templateCompilerFile});


templates = concatFilter(templates, 'templates.js');
//templates = concatFilter(templates, {inputFiles: ['**/*.handlebars'],outputFile:'/templates.js'});

templates = append(templates, {before: "import Ember from \"ember-metal/core\";\n import \"ember\";"});
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


emberModules = mergeTrees([emberModules, templateCompilerTree]);
emberModules = inlineTemplatePrecompiler(emberModules);
emberModules = removeFile(emberModules, {srcFile: templateCompilerFile});


// handlebarsRuntime
handlebarsRuntime = append(handlebarsRuntime, {after: "\nwindow.Handlebars = Handlebars\n"});
handlebarsRuntime = iife(handlebarsRuntime);

// app
app = es6Filter(app, es6Options);

// emberData
emberData = es6Filter(emberData, { moduleName: function(filePath) {
  return filePath.replace('app/submodules/data/packages/','')
                 .replace(/.js$/, '')
}});


// compose and build app.js
var trees = [app, emberData, emberResolver, emberVendoredPackages, emberMain, emberModules, handlebarsRuntime, jquery, templates];

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
trees = mergeTrees(trees)
trees = concatFilter(trees, 'app.js');
//trees = concatFilter(trees, {inputFiles: ['**/*.js'],outputFile:'/app.js'});
trees = iife(trees);

trees = mergeTrees([trees, match('app', 'submodules/ember.js/packages/loader/lib/main.js')]);
trees = concatFilter(trees, 'app.js');



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

trees = mergeTrees(trees)
module.exports = trees;
