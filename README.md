# vue3-sfc-loader

Vue3 Single File Component loader.  
Load .vue files dynamically at runtime from your html/js. No node.js environment, no (webpack) build step needed.  


## Key Features

 * Only requires [Vue3 runtime](https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js)
 * Focuses on component compilation. Network, styles injection and cache are up to you (see [example below](#example))
 * Embedded ES6 modules support ( including `import()` )
 * SFC Custom Blocks support
 * Support custom CSS, HTML and Script language, see [pug](docs/examples.md#using-another-template-language-pug) and [stylus](docs/examples.md#using-another-style-language-stylus) examples
 * Properly reports template, style or script errors through the [log callback](docs/api/interfaces/options.md#log)
 * You can [build your own version](#build-your-own-version) and easily customize browsers you need to support


## Example

```html
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js"></script>
  <script>

    const options = {

      moduleCache: {
        vue: Vue
      },

      async getFile(url) {

        const res = await fetch(url);
        if ( !res.ok )
          throw Object.assign(new Error(url+' '+res.statusText), { res });
        return await res.text();
      },

      addStyle(textContent) {

        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
    }

    const { loadModule } = window['vue3-sfc-loader'];

    const app = Vue.createApp({
      components: {
        'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
      },
      template: '<my-component></my-component>'
    });

    app.mount('#app');

  </script>
</body>
</html>
```

### More Examples

  see [examples](docs/examples.md)


## Try It Online <sub>:test_tube:</sub>

  https://codepen.io/franckfreiburger/project/editor/AqPyBr


## Public API documentation <sub>:book:</sub>

  **[loadModule](docs/api/README.md#loadmodule)**(`path`: string, `options`: [Options](docs/api/interfaces/options.md)): Promise\<Module>


## dist/ <sub>:package:</sub>

  [![latest bundle version](https://img.shields.io/npm/v/vue3-sfc-loader?label=version)](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/CHANGELOG.md)
  [![bundle minified size](https://img.shields.io/bundlephobia/min/vue3-sfc-loader?label=min)](#dist)
  [![bundle minified+zip size](https://img.shields.io/bundlephobia/minzip/vue3-sfc-loader?label=min%2Bzip)](#dist)
  [![bundle minified+bz2 size](https://img.shields.io/badge/min%2Bbz2-even%20smaller-blue)](#dist)
  [![Snyk Vulnerabilities for vue3-sfc-loader](https://img.shields.io/snyk/vulnerabilities/github/FranckFreiburger/vue3-sfc-loader)](https://snyk.io/vuln/npm:vue3-sfc-loader)
  [![browser support](https://img.shields.io/github/package-json/browserslist/FranckFreiburger/vue3-sfc-loader)](https://github.com/browserslist/browserslist#query-composition)
  [![compiler-sfc dependency version](https://img.shields.io/github/package-json/dependency-version/FranckFreiburger/vue3-sfc-loader/dev/@vue/compiler-sfc?label=embeds%20%40vue%2Fcompiler-sfc)](https://github.com/vuejs/vue-next/tree/master/packages/compiler-sfc)

  latest minified version at :
  - [jsDelivr](https://www.jsdelivr.com/package/npm/vue3-sfc-loader) CDN: https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js
  - [UNPKG](https://unpkg.com/browse/vue3-sfc-loader/) CDN: https://unpkg.com/vue3-sfc-loader
  - `npm install vue3-sfc-loader` (`./node_modules/vue3-sfc-loader/dist/vue3-sfc-loader.js`)


## Build your own version <sub>:hammer_and_wrench:</sub>

  `webpack --config ./build/webpack.config.js --mode=production --env targetsBrowsers="> 1%, last 2 versions, Firefox ESR, not dead, not ie 11"`

  _see [`package.json`](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/package.json) "build" script_  
  _see [browserslist queries](https://github.com/browserslist/browserslist#queries)_  


## How It Works <sub>:gear:</sub>

  [`vue3-sfc-loader.js`](https://unpkg.com/vue3-sfc-loader/dist/report.html) = `Webpack`( `@vue/compiler-sfc` + `@babel` )


### more details <sub>:mag:</sub>

  1. load the `.vue` file
  1. parse and compile template, script and style sections (`@vue/compiler-sfc`)
  1. transpile script and compiled template to es5 (`@babel`)
  1. parse scripts for dependencies (`@babel/traverse`)
  1. recursively resolve dependencies
  1. merge all and return the component


## Any Questions <sub>:question:</sub>

  <!--  ask here: https://stackoverflow.com/questions/ask?tags=vue3-sfc-loader (see [previous questions](https://stackoverflow.com/questions/tagged/vue3-sfc-loader)) -->
  [:speech_balloon: ask in Discussions tab](https://github.com/FranckFreiburger/vue3-sfc-loader/discussions?discussions_q=category%3AQ%26A)


## Previous version (for vue2)

  see [http-vue-loader](https://github.com/FranckFreiburger/http-vue-loader) <sub>:zzz:</sub>

#

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Load%20.vue%20files%20dynamically%20from%20your%20html%2Fjs%20without%20any%20build%20step%20!&url=https://github.com/FranckFreiburger/vue3-sfc-loader&via=F_Freiburger&hashtags=vue,vue3,developers)
