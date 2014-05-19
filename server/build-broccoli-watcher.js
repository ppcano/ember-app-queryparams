var broccoli   = require('broccoli');
var Watcher      = require('broccoli/lib/watcher');



module.exports = function() {
  var tree = broccoli.loadBrocfile();
  var builder = new broccoli.Builder(tree);
  process.addListener('exit', function () {
    builder.cleanup();
  });

  var signalsTrapped = false;
  if (!signalsTrapped) {
    // We register these so the 'exit' handler removing temp dirs is called
    process.on('SIGINT', function () {
      process.exit(1);
    });

    process.on('SIGTERM', function () {
      process.exit(1);
    });
    signalsTrapped = true;
  }

  var watcher = new Watcher(builder);
  watcher.on('change', function(results) {
    console.log('chanding...');
  });
  watcher.on('error', function(err) {
    console.log('error...');
    console.log(err);
  });
  return watcher;
}
