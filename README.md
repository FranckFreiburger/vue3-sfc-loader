# vue3-sfc-loader
Vue3 Single File Component loader

## Description

Load .vue files directly from your html/js. No node.js environment, no (webpack) build step.


## Example

```html
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js"></script>
  <script>

    const { loadModule } = window['vue3-sfc-loader'];

    const options = {

      moduleCache: {
        vue: Vue
      },

      getFile(url) {

        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },

      addStyle(styleStr) {

        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      }

    }

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


## Try it

  https://codepen.io/franckfreiburger/project/editor/AqPyBr


## dist

  latest minified version:
  - at jsDelivr CDN: https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js
  - at UNPKG CDN: https://unpkg.com/browse/vue3-sfc-loader/dist/vue3-sfc-loader.js


### Bundle size
- \~380 kB minified + bz2
- \~1600 kB minified


## Public API

  **[loadModule](docs/README.md#loadmodule)**(`path`: string, `options`: [Options](docs/interfaces/options.md)): Promise\<Module>


## Build your own version

  `webpack --config ./build/webpack.config.js --mode=production --env targetsBrowsers="> 1%, last 2 versions, Firefox ESR, not dead, not ie 11"`

  _see `package.json` "build" script_


### targetsBrowsers

  see [browserslist queries](https://github.com/browserslist/browserslist#queries)


## How it works

  `Webpack`( `@vue/compiler-sfc` + `@babel` ) = `vue3-sfc-loader.js`


### More details

  1. load the `.vue` file
  1. parse and compile template, script and style sections (`@vue/compiler-sfc`)
  1. transpile script and compiled template to es5 (`@babel`)
  1. parse scripts for dependencies (`@babel/traverse`)
  1. recursively resolve dependencies
  1. merge all and return the component


## Previous version (for vue2)

  see https://github.com/FranckFreiburger/http-vue-loader


## Other examples

### more complete API usage example

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader/dist/vue3-sfc-loader.js"></script>

  <script>

    // window.localStorage.clear();

    const options = {

      moduleCache: {
        vue: Vue,
      },

      getFile(url) {

        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },

      addStyle(styleStr) {

        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },

      log(type, ...args) {

        console.log(type, ...args);
      },

      compiledCache: {
        set(key, str) {

          // naive storage space management
          for (;;) {

            try {

              // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
              window.localStorage.setItem(key, str);
              break;
            } catch(ex) { // handle: Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota

              window.localStorage.removeItem(window.localStorage.key(0));
            }
          }
        },
        get(key) {

          return window.localStorage.getItem(key);
        },
      },

      additionalModuleHandlers: {
        '.json': (source, path, options) => JSON.parse(source),
      }
    }

    // <!--
    const source = `
      <template>
        <div class="example">{{ msg }}</div>
      </template>
      <script>
        export default {
          data () {
            return {
              msg: 'Hello world!'
            }
          }
        }
      </script>

      <style scoped>
        .example {
          color: red;
        }
      </style>
    `;
    // -->


    const { createSFCModule } = window["vue3-sfc-loader"];
    const myComponent = createSFCModule(source, './myComponent.vue', options);

    // ... or by file:
    // const { loadModule } = window["vue3-sfc-loader"];
    // const myComponent = loadModule('./myComponent.vue', options);

    const app = Vue.createApp({
      components: {
        'my-component': Vue.defineAsyncComponent( () => myComponent ),
      },
      template: 'root: <my-component></my-component>'
    });

    app.mount('#app');

  </script>

</body>
</html>
```


### using another template language (pug)

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://pugjs.org/js/pug.js"></script>
  <script src="vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const sfcSontent = `
<template lang="pug">
ul
  each val in ['p', 'u', 'g']
    li= val
</template>
`;
    /* --> */

    const options = {

      moduleCache: {
        vue: Vue,
        pug: require('pug'),
      },

      getFile(url) {

        if ( url === './myPugComponent.vue' )
          return Promise.resolve(sfcSontent);

        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myPugComponent.vue', options))).mount('#app');

  </script>
</body>
</html>

```
