/*
 * Simple static express server for the app
 */
const path = require('path');
const express = require('express');
const enforce = require('express-sslify');
const proxy = require('http-proxy-middleware');
const hsts = require('hsts');
const compression = require('compression');

// Intialise app
const app = express();

// Force redirects from 'http' to 'https'
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true, trustXForwardedHostHeader: true }));
}

// Force redirects from old host to new target host
app.use((req, res, next) => {
  console.log({
    reqHeadersHost: req.headers.host,
    redirFromHost: process.env.REDIR_FROM_HOST,
    redirToHost: process.env.REDIR_TO_HOST,
    doesStartWith: req.headers.host.startsWith(process.env.REDIR_FROM_HOST),
  });


  return (req.headers.host.startsWith(process.env.REDIR_FROM_HOST)
    ? res.redirect(`${process.env.REDIR_TO_HOST}${req.url}`)
    : next())
  ;
},
);

// Conditional request proxying
if (process.env.PROXY_API_URL) {
  app.use('/v1/*', proxy({ target: process.env.PROXY_API_URL, changeOrigin: true }));
}

// Set HSTS headers
app.use(hsts({
  maxAge: 60 * 60 * 24 * 365, // 1 year
  includeSubDomains: true,
  preload: true,
}));

// Enable g-zip compression
app.use(compression());

// Serve static files in "build" directory
app.use(express.static(path.join(__dirname, 'build')));

// All unmatched GET requests should serve "index.html"
app.get('/*', express.static(path.join(__dirname, 'build', 'index.html')));

// Start server
app.listen(process.env.PORT || 3000, () => console.log(`Listening on ${process.env.PORT || 3000}`));
