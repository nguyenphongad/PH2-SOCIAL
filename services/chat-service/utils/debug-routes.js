const express = require('express');

/**
 * Tạo endpoint để liệt kê tất cả các routes đã đăng ký
 * @param {express.Application} app - Express application
 */
function setupDebugRoutes(app) {
  app.get('/debug/routes', (req, res) => {
    const routes = [];

    // Lấy tất cả routes từ app._router.stack
    function print(path, layer) {
      if (layer.route) {
        // Routes có routepath và method
        const methods = Object.keys(layer.route.methods)
          .filter(method => layer.route.methods[method])
          .map(method => method.toUpperCase());
        
        routes.push({
          path: path + layer.route.path,
          methods: methods,
          middleware: layer.route.stack.map(s => s.name || 'anonymous')
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        // Router middleware
        layer.handle.stack.forEach(stackItem => {
          print(path + (layer.regexp.source === "^\\/?(?=\\/|$)" ? '' : layer.regexp.source.replace(/\\\//g, '/').replace(/\^|\\|\$|\?|\=|\|/g, '')), stackItem);
        });
      } else if (layer.name !== 'expressInit' && layer.name !== 'query' && layer.name !== 'bound dispatch') {
        // Middleware khác
        if (layer.regexp && layer.regexp.source !== "^\\/?(?=\\/|$)") {
          routes.push({
            path: path + layer.regexp.source.replace(/\\\//g, '/').replace(/\^|\\|\$|\?|\=|\|/g, ''),
            middleware: [layer.name || 'anonymous']
          });
        }
      }
    }

    app._router.stack.forEach(layer => {
      print('', layer);
    });

    res.json({
      registeredRoutes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
  });
}

module.exports = setupDebugRoutes;
