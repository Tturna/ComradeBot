const express = require('express');
const webapp = express();

// endpoint for health checks, which keep the Render instance running
webapp.get('/', (_req, res) => {
  res.send('privet');
});

module.exports = webapp;
