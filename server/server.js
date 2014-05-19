var express    = require('express');
var buildBroccoliWatcher   = require('./build-broccoli-watcher');
var broccoliMiddleware      = require('broccoli/lib/middleware');
var indexMiddleware = require('./index-middleware');
var livereloadMiddleware = require('connect-livereload');


var app = module.exports = express();
var port = process.env.PORT || 3000;

app.use(livereloadMiddleware({port: port}));
app.use(indexMiddleware());
app.use(broccoliMiddleware(buildBroccoliWatcher()));

if (!module.parent) {
  app.listen(port);
  console.log('Started on port: '+port);
}
