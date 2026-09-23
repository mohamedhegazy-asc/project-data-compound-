// Vercel Serverless Function entry point
// All /api/* requests are routed here via vercel.json rewrites
// Express handles routing based on the original request URL

const app = require('../server/server');

module.exports = app;
