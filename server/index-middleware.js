var path = require('path');

module.exports = function() {
  return function(req, res, next) {
    var hasHTMLHeader = (req.headers.accept || []).indexOf('text/html') === 0;

    var isSource = /\/source\/(.*)/.test(req.path);
    if (req.method === 'GET' && hasHTMLHeader && !isSource) {
      req.url = '/index.html';
    }

    next();
  };
};
