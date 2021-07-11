# Migration guide from `http-vue-loader` to `vue3-sfc-loader`

First of all, `http-vue-loader` and `vue3-sfc-loader` serves the same need: run `.vue` files client-side without requiring any bundler.


## main differences between `http-vue-loader` and `vue3-sfc-loader`

(vue3-sfc-loader for Vue2, ie. vue3-sfc-loader/dist/vue2-sfc-loader.js)

| |  `http-vue-loader` | `vue3-sfc-loader` |
|-:|:-:|:-:|
| has ES6 support | :x: | :heavy_check_mark: |
| requires only Vue runtime build | :x: | :heavy_check_mark: |
| `fetch` resources asynchronously | :x: | :heavy_check_mark: |
| has full `scoped` style support | :x: | :heavy_check_mark: |
| has JSX support | :x: | :heavy_check_mark: |
| properly reports template, style or script errors | :x: | :heavy_check_mark: |
| supports nested `import`/`require` | :x: | :heavy_check_mark: |
| has a default http requests handler | :heavy_check_mark: | :x: |
| has a default CSS injection handler | :heavy_check_mark: | :x: |
| recommended for production | :x: | :heavy_check_mark: |
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
