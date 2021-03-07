const path = require('path');
const express = require('express');
const open = require('open');

const index = process.env.VUE_VERSION === '2' ? 'vue2.html' : 'vue3.html'

const app = express();
app.use(express.static(path.resolve(__dirname, '../dist')));
app.use(express.static(__dirname, { 'index': [index] } ));

const port = process.env.PORT ? process.env.PORT.trim() : 8080;
app.listen(port)

console.log(`http://localhost:${ port }/`);
open(`http://localhost:${ port }/`);
