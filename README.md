# vue3-sfc-loader
Vue3 Single File Component loader

Quick example ...
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

      // mandatory
      moduleCache: {
        vue: Vue, // mandatory
      },

      // mandatory
      getFile(url) {

        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },

      // mandatory
      addStyle(styleStr) {

        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },

      // optional
      log(type, ...args) {

        console.log(type, ...args);
      },

      // optional
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

      // optional
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
