# Migration guide from `http-vue-loader` to `vue3-sfc-loader`

First of all, `http-vue-loader` and `vue3-sfc-loader` serves the same need: run `.vue` files client-side without requiring any bundler.


## main differences between `http-vue-loader` and `vue3-sfc-loader`

(vue3-sfc-loader for Vue2, ie. vue3-sfc-loader/dist/vue2-sfc-loader.js)

| |  `http-vue-loader` | `vue3-sfc-loader` |
|-:|:-:|:-:|
| supports ES6 | no | yes |
| supports Vue runtime-only build | no | yes |
| `fetch` resources asynchronously | no | yes |
| uses native vue CSS compiler | no | yes |
| has JSX support | no | yes |
| properly reports template, style or script errors | no | yes |
| scoped style support | basic | full |
| handle http requests by default | yes | no |
| handle CSS injection by default | yes | no |
| supports nested import/require | no | yes |
| recommended for production | no | yes |
| bundle size (min gz) | 2.7KB | 543KB |


## example from `http-vue-loader` to `vue3-sfc-loader`

#### `http-vue-loader`

```
<html>
  <head>
    <script src="https://unpkg.com/vue"></script>
    <script src="https://unpkg.com/http-vue-loader"></script>
  </head>
  <body>
    <div id="app">
      <my-component></my-component>
    </div>

    <script>
      new Vue({
        el: '#app',
        components: {
          'my-component': httpVueLoader('my-component.vue')
        }
      });
    </script>
  </body>
</html>
```


#### `vue3-sfc-loader`

```
<html>
  <head>
    <script src="https://unpkg.com/vue"></script>
    <script src="https://unpkg.com/vue3-sfc-loader/dist/vue2-sfc-loader.js"></script>
  </head>
  <body>
    <div id="app">
      <my-component></my-component>
    </div>

    <script>

      const { loadModule } = window['vue2-sfc-loader'];

      const options = {
        moduleCache: {
          vue: Vue,
        },
        getFile(filepath) {
          
          fetch(filepath).then(res => {

            if ( !res.ok )
              throw Object.assign(new Error(res.statusText + ' ' + url), { res });
            return {
              getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
            }
          });
        },
        addStyle(textContent) {

          const style = Object.assign(document.createElement('style'), { textContent });
          const ref = document.head.getElementsByTagName('style')[0] || null;
          document.head.insertBefore(style, ref);
        },
      }
      
      new Vue({
        el: '#app',
        components: {
          'my-component': () => loadModule('/my-component.vue', options)
        }
      });
      
    </script>
  </body>
</html>

```
