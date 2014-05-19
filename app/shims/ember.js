// copy from ember-cli
(function() {
/* global define, Ember */
define('ember', [], function() {
  "use strict";

  require('ember-metal');
  require('ember-runtime');
  require('ember-handlebars-compiler');
  require('ember-handlebars');
  require('ember-views');
  require('ember-routing');
  require('ember-application');

  var optionals = ['ember-extension-support', 'ember-debug', 'ember-testing'];

  optionals.forEach(function(packageName) {

    if (Ember.__loader.registry[packageName]) {
      console.log('loading: '+ packageName);
      require(packageName);
    } else {
      console.log('not loading: '+ packageName);
    }

  });


  return {
    'default': Ember
  };
});
})();
