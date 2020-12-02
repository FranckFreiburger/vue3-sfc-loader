const path = require('path');
const express = require('express');
const open = require('open');

const app = express();
app.use(express.static(path.resolve(__dirname, '../dist')));
app.use(express.static(__dirname, { 'index': ['index.html'] } ));

const port = process.env.PORT.trim() || 80;
app.listen(port)

console.log(`http://localhost:${ port }/`);
open(`http://localhost:${ port }/`);
