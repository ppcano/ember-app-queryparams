var express    = require('express');
var buildBroccoliWatcher   = require('./build-broccoli-watcher');
var customBroccoliMiddleware      = require('./custom-broccoli-middleware');
var livereloadMiddleware = require('connect-livereload');


var app = module.exports = express();
var port = process.env.PORT || 3000;

app.use(livereloadMiddleware({port: port}));

app.use(customBroccoliMiddleware(buildBroccoliWatcher()));

if (!module.parent) {
  app.listen(port);
  console.log('Started on port: '+port);
}
