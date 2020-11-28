const fs = require('fs');
let content = fs.readFileSync(0, 'utf-8');

const delimiters = ['<!---', '-->'];

const entries = content.split(new RegExp(delimiters[0] + '([^]*?)' + delimiters[1], 'g'));

const fctList = entries
.filter((v, i) => i % 2)
.map(code => ctx => (function() { return eval(code) }).call(ctx) );

for ( let i = 0; i < entries.length; i += 2 )
	for ( const apply of fctList )
		entries[i] = apply(entries[i])

const result = entries.map((e, i) => i % 2 ? delimiters[0] + e + delimiters[1] : e).join('');

fs.writeFileSync(1, result);


/*

example:
-------

file.md:
| ...
| <body>
|   <div id="app"></div>
|   <script src="https://unpkg.com/vue@next"></script>
|   <script src="https://pugjs.org/js/pug.js"></script>
|   <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@latest/dist/vue3-sfc-loader.js"></script>
| ...
| 
| <!---
| 
|   const versionObj = require('semver').parse(require(process.cwd() + '/package.json').version);
|   this.replace(/(\/vue3-sfc-loader@)(.*?)(\/)/g, `$1^${ versionObj.major }.${ versionObj.minor }$3`);
| 
| -->

> node ./build/evalHtmlComments.js < README.md > README.md

result:
|   ...
|   <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@^0.2/dist/vue3-sfc-loader.js"></script>
|   ...

*/
