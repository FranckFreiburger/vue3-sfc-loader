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
  <script src="https://cdn.jsdelivr.net/gh/FranckFreiburger/vue3-sfc-loader@main/dist/vue3-sfc-loader.js"></script>
  <script>

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


### Try it

  https://codepen.io/franckfreiburger/project/editor/AqPyBr


## API

  [loadModule](docs/README.md#loadmodule)


## Build your own version

  default (`npm run build`):

    `webpack --config ./build/webpack.config.js --mode=production --env targetsBrowsers="> 1%, last 2 versions, Firefox ESR, not dead, not ie 11"`


### targetsBrowsers
  see https://github.com/browserslist/browserslist#queries


## How it works

  `Webpack`( `@vue/compiler-sfc` + `@babel` ) = `vue3-sfc-loader.js`


### More details

  1. load the `.vue` file
  1. parse and compile template, script and style sections (`@vue/compiler-sfc`)
  1. transpile script and compiled template to es5 (`@babel`)
  1. parse scripts for dependencies (`@babel/traverse`)
  1. recursively resolve dependencies
  1. merge all and return the component


### Bundle size
- 1600 Kb minified
- 380 KB bz2


### More complete example

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/gh/FranckFreiburger/vue3-sfc-loader@main/dist/vue3-sfc-loader.js"></script>

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
