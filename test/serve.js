const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const open = require('open');

const app = express();
app.use(serveStatic(path.resolve(__dirname, '../dist')));
app.use(serveStatic(__dirname, { 'index': ['index.html'] } ));

const port = process.env.PORT.trim() || 80;
app.listen(port)

console.log(`http://localhost:${ port }/`);
open(`http://localhost:${ port }/`);
