const { createApp } = require('./lib/index.js');

const app = createApp();

module.exports = (req, res) => {
  app(req, res);
};
