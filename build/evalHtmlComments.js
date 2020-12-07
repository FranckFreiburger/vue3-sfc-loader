const fs = require('fs');

const pathname = process.argv[2];

let content = fs.readFileSync(pathname, 'utf-8');

const delimiters = ['<!---', '--->'];

const regexp = new RegExp(delimiters[0] + '([^]*?)' + delimiters[1], 'g');

const scriptList = [];

let result = content.replace(regexp, function(all, p1) {

	scriptList.push(p1);
	return delimiters[0] + (scriptList.length - 1) + delimiters[1];
});

const fctList = scriptList
.map(code => ctx => (function(ctx) { return eval(code) }).call(null, ctx) );

for ( const fct of fctList )
	result = fct({ wholeContent: result, global });

result = result.replace(regexp, function(all, p1) {

	return delimiters[0] + (scriptList[Number(p1)]) + delimiters[1];
});

fs.writeFileSync(pathname, result);


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
|   ctx.wholeContent.replace(/(\/vue3-sfc-loader@)(.*?)(\/)/g, `$1^${ versionObj.major }.${ versionObj.minor }$3`);
| 
| -->

> node ./build/evalHtmlComments.js README.md

result:
|   ...
|   <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@^0.2/dist/vue3-sfc-loader.js"></script>
|   ...

*/
