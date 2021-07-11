<!--toc-->
* [Examples](#examples)
  * [Vue2 basic example](#vue2-basic-example)
  * [using esm version](#using-esm-version)
  * [A more complete API usage example](#a-more-complete-api-usage-example)
  * [Load a Vue component from a string](#load-a-vue-component-from-a-string)
  * [Using another template language (pug)](#using-another-template-language-pug)
  * [Using another style language (stylus)](#using-another-style-language-stylus)
  * [SFC style CSS variable injection (new edition)](#sfc-style-css-variable-injection-new-edition)
  * [import style](#import-style)
  * [Minimalist Hello World example](#minimalist-hello-world-example)
  * [Use `options.loadModule` hook](#use-optionsloadmodule-hook)
  * [Dynamic component (using `:is` Special Attribute)](#dynamic-component-using-is-special-attribute)
  * [Nested components](#nested-components)
  * [Use SFC Custom Blocks for i18n](#use-sfc-custom-blocks-for-i18n)
  * [Use Options.getResource() and process the files (nearly) like webpack does](#use-optionsgetresource-and-process-the-files-nearly-like-webpack-does)
  * [Load SVG dynamically (using `watch()`)](#load-svg-dynamically-using-watch)
  * [Load SVG dynamically (using `async setup()` and `<Suspense>`)](#load-svg-dynamically-using-async-setup-and-suspense)
  * [Use remote components](#use-remote-components)
<!--/toc-->

# Examples

:warning: **beware**, the following examples are sticky to version *<!--version-->0.8.4<!--/version-->*. For your use, you would prefer the [latest version](../README.md#dist)

**Try the examples locally**  
Since most browsers do not allow you to access local filesystem, you can start a small [express](https://expressjs.com/) server to run these examples.  
Run the following commands to start a basic web server on port `8181`:
```sh
npm install express  # or yarn add express
node -e "require('express')().use(require('express').static(__dirname, {index:'index.html'})).listen(8181)"
```

**note:**  
In the following examples, for convenience, we just returns static content as file. In real world, you would probably use something like this :
```javascript
  ...
  async getFile(url) {

    const res = await fetch(url);

    if ( !res.ok ) {

      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    }

    return {
      getContentData: (asBinary) => asBinary ? res.arrayBuffer() : res.text(),
    }

  },
  ...
```


## Vue2 basic example

**note:** Vue2 do not have the `Vue.defineAsyncComponent()` function. Here we mount the app when the main component is ready.

<!--example:source:vue2_basic_example-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue2-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const mainComponent = `
      <template>
        <span>Hello from Vue {{ require('myData').vueVersion }} !</span>
      </template>
    `;
    /* --> */

    const { loadModule, vueVersion } = window['vue2-sfc-loader'];

    const options = {
      moduleCache: {
        vue: Vue,
        myData: {
          vueVersion,
        }
      },
      getFile(url) {

        if ( url === '/main.vue' )
          return Promise.resolve(mainComponent);
      },
      addStyle() { /* unused here */ },
    }

    loadModule('/main.vue', options)
    .then(component => new Vue(component).$mount('#app'));
  </script>
</body>
</html>
```
<!--example:target:vue2_basic_example-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue2-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+mainComponent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++%3Cspan%3EHello+from+Vue+%7B%7B+require('myData').vueVersion+%7D%7D+!%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+%7B+loadModule%2C+vueVersion+%7D+%3D+window%5B'vue2-sfc-loader'%5D%3B%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++myData%3A+%7B%0A++++++++++vueVersion%2C%0A++++++++%7D%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2Fmain.vue'+)%0A++++++++++return+Promise.resolve(mainComponent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B+%2F*+unused+here+*%2F+%7D%2C%0A++++%7D%0A%0A++++loadModule('%2Fmain.vue'%2C+options)%0A++++.then(component+%3D%3E+new+Vue(component).%24mount('%23app'))%3B%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:vue2_basic_example-->
[:top:](#readme)


## using esm version

<!--example:source:esm_version_example-->
```html
<!DOCTYPE html>
<html>
<body>
  <script type="module">

    import * as Vue from 'https://unpkg.com/vue@3/dist/vue.runtime.esm-browser.prod.js'
    import { loadModule } from 'https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.esm.js'

    const options = {
      moduleCache: { vue: Vue },
      getFile: () => `<template>vue3-sfc-loader esm version</template>`,
      addStyle: () => {},
    }
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('file.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:esm_version_example-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+type%3D%22module%22%3E%0A%0A++++import+*+as+Vue+from+'https%3A%2F%2Funpkg.com%2Fvue%403%2Fdist%2Fvue.runtime.esm-browser.prod.js'%0A++++import+%7B+loadModule+%7D+from+'https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.esm.js'%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+()+%3D%3E+%60%3Ctemplate%3Evue3-sfc-loader+esm+version%3C%2Ftemplate%3E%60%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:esm_version_example-->
[:top:](#readme)


## A more complete API usage example

<!--example:source:complete_api-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    const componentSource = /* <!-- */`
      <template>
        <span class="example">{{ msg }}</span>
      </template>
      <script>
        export default {
          data () {
            return {
              msg: 'world!'
            }
          }
        }
      </script>

      <style scoped>
        .example {
          color: red;
        }
      </style>
    `/* --> */;

    const options = {

      moduleCache: {
        vue: Vue,
      },

      async getFile(url) {

        if ( url === '/myComponent.vue' )
          return Promise.resolve(componentSource);

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

      log(type, ...args) {

        console[type](...args);
      },

      compiledCache: {
        set(key, str) {

          // naive storage space management
          for (;;) {

            try {

              // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
              window.localStorage.setItem(key, str);
              break;
            } catch(ex) {

              // handle: Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota

              window.localStorage.removeItem(window.localStorage.key(0));
            }
          }
        },
        get(key) {

          return window.localStorage.getItem(key);
        },
      },

      handleModule(type, source, path, options) {
        
        if ( type === '.json' )
          return JSON.parse(source);
      }
    }

    const { loadModule } = window['vue3-sfc-loader'];
    const myComponent = loadModule('/myComponent.vue', options);

    const app = Vue.createApp({
      components: {
        'my-component': Vue.defineAsyncComponent( () => myComponent ),
      },
      template: 'Hello <my-component></my-component>'
    });

    app.mount('#app');

  </script>

</body>
</html>
```
<!--example:target:complete_api-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+componentSource+%3D+%2F*+%3C!--+*%2F%60%0A++++++%3Ctemplate%3E%0A++++++++%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+red%3B%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%2F*+--%3E+*%2F%3B%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A%0A++++++async+getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(componentSource)%3B%0A%0A++++++++const+res+%3D+await+fetch(url)%3B%0A++++++++if+(+!res.ok+)%0A++++++++++throw+Object.assign(new+Error(url%2B'+'%2Bres.statusText)%2C+%7B+res+%7D)%3B%0A++++++++return+await+res.text()%3B%0A++++++%7D%2C%0A%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A%0A++++++log(type%2C+...args)+%7B%0A%0A++++++++console%5Btype%5D(...args)%3B%0A++++++%7D%2C%0A%0A++++++compiledCache%3A+%7B%0A++++++++set(key%2C+str)+%7B%0A%0A++++++++++%2F%2F+naive+storage+space+management%0A++++++++++for+(%3B%3B)+%7B%0A%0A++++++++++++try+%7B%0A%0A++++++++++++++%2F%2F+doc%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FStorage%0A++++++++++++++window.localStorage.setItem(key%2C+str)%3B%0A++++++++++++++break%3B%0A++++++++++++%7D+catch(ex)+%7B%0A%0A++++++++++++++%2F%2F+handle%3A+Uncaught+DOMException%3A+Failed+to+execute+'setItem'+on+'Storage'%3A+Setting+the+value+of+'XXX'+exceeded+the+quota%0A%0A++++++++++++++window.localStorage.removeItem(window.localStorage.key(0))%3B%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%2C%0A++++++++get(key)+%7B%0A%0A++++++++++return+window.localStorage.getItem(key)%3B%0A++++++++%7D%2C%0A++++++%7D%2C%0A%0A++++++handleModule(type%2C+source%2C+path%2C+options)+%7B%0A++++++++%0A++++++++if+(+type+%3D%3D%3D+'.json'+)%0A++++++++++return+JSON.parse(source)%3B%0A++++++%7D%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++const+myComponent+%3D+loadModule('%2FmyComponent.vue'%2C+options)%3B%0A%0A++++const+app+%3D+Vue.createApp(%7B%0A++++++components%3A+%7B%0A++++++++'my-component'%3A+Vue.defineAsyncComponent(+()+%3D%3E+myComponent+)%2C%0A++++++%7D%2C%0A++++++template%3A+'Hello+%3Cmy-component%3E%3C%2Fmy-component%3E'%0A++++%7D)%3B%0A%0A++++app.mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:complete_api-->
[:top:](#readme)


## Load a Vue component from a string

<!--example:source:cpn_string-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const sfcContent = `
      <template>
        Hello World !
      </template>
    `;
    /* --> */

    const options = {
      moduleCache: {
        vue: Vue,
      },
      getFile(url) {

        if ( url === '/myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle() { /* unused here */ },
    }

    const { loadModule } = window['vue3-sfc-loader'];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/myComponent.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:cpn_string-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+World+!%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B+%2F*+unused+here+*%2F+%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('%2FmyComponent.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:cpn_string-->
[:top:](#readme)


## Using another template language (pug)

<!--example:source:tpl_pug-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://pugjs.org/js/pug.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const sfcContent = `
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

        if ( url === '/myPugComponent.vue' )
          return Promise.resolve(sfcContent);
      },

      addStyle: () => {},
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/myPugComponent.vue', options))).mount('#app');

  </script>
</body>
</html>

```
<!--example:target:tpl_pug-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fpugjs.org%2Fjs%2Fpug.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A%3Ctemplate+lang%3D%22pug%22%3E%0Aul%0A++each+val+in+%5B'p'%2C+'u'%2C+'g'%5D%0A++++li%3D+val%0A%3C%2Ftemplate%3E%0A%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++pug%3A+require('pug')%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2FmyPugComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('%2FmyPugComponent.vue'%2C+options))).mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A)
<!--/example:target:tpl_pug-->
[:top:](#readme)


## Using another style language (stylus)

<!--example:source:style_stylus-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script src="//stylus-lang.com/try/stylus.min.js"></script>
  <script>

    /* <!-- */
    const vueContent = `
      <template>
        Hello <b>World</b> !
      </template>
      <style lang="stylus">
 b
  color red
      </style>
    `;
    /* --> */

    const options = {
      moduleCache: {
        vue: Vue,
        // note: deps() does not work in this bundle of stylus (see https://stylus-lang.com/docs/js.html#deps)
        stylus: source => Object.assign(stylus(source), { deps: () => [] }),
      },
      getFile: () => vueContent,
      addStyle(styleStr) {
        const style = document.createElement('style');
        style.textContent = styleStr;
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
    }

    Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options))).mount(document.body);

  </script>
</body>
</html>

```
<!--example:target:style_stylus-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22%2F%2Fstylus-lang.com%2Ftry%2Fstylus.min.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+vueContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+%3Cb%3EWorld%3C%2Fb%3E+!%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cstyle+lang%3D%22stylus%22%3E%0A+b%0A++color+red%0A++++++%3C%2Fstyle%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++%2F%2F+note%3A+deps()+does+not+work+in+this+bundle+of+stylus+(see+https%3A%2F%2Fstylus-lang.com%2Fdocs%2Fjs.html%23deps)%0A++++++++stylus%3A+source+%3D%3E+Object.assign(stylus(source)%2C+%7B+deps%3A+()+%3D%3E+%5B%5D+%7D)%2C%0A++++++%7D%2C%0A++++++getFile%3A+()+%3D%3E+vueContent%2C%0A++++++addStyle(styleStr)+%7B%0A++++++++const+style+%3D+document.createElement('style')%3B%0A++++++++style.textContent+%3D+styleStr%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A)
<!--/example:target:style_stylus-->
[:top:](#readme)


## SFC style CSS variable injection (new edition)

_see at [vuejs/rfcs](https://github.com/vuejs/rfcs/pull/231)_

<!--example:source:rfc_231-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>
    /* <!-- */
    const sfcContent = `
      <template>
        Hello <span class="example">{{ msg }}</span>
      </template>
      <script>
        export default {
          data () {
            return {
              msg: 'world!',
              color: 'blue',
            }
          }
        }
      </script>
      <style scoped>
        .example {
          color: v-bind('color')
        }
      </style>
    `;
    /* --> */

    const options = {
      moduleCache: {
        vue: Vue,
      },
      getFile(url) {

        if ( url === '/myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle(textContent) {

        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/myComponent.vue', options))).mount('#app');
  </script>
</body>
</html>
```
<!--example:target:rfc_231-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%2C%0A++++++++++++++color%3A+'blue'%2C%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+v-bind('color')%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('%2FmyComponent.vue'%2C+options))).mount('%23app')%3B%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:rfc_231-->
[:top:](#readme)


## import style

<!--example:source:import_style-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const config = {
      files: {
        '/style.css': `
          .styled { color: red }
        `,
        '/main.vue': `
          <template>
            <span class="styled">hello</span> world
          </template>
          <script>
            import './style.css'
            export default {
            }
          </script>
        `,
      }
    };
    /* --> */

    const options = {
      moduleCache: { vue: Vue },
      getFile: url => config.files[url],
      addStyle(textContent) {

        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
      handleModule: async function (type, getContentData, path, options) { 
        switch (type) { 
          case '.css':
            options.addStyle(await getContentData(false));
            return null;
        } 
      },
    }

    Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('/main.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:import_style-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+config+%3D+%7B%0A++++++files%3A+%7B%0A++++++++'%2Fstyle.css'%3A+%60%0A++++++++++.styled+%7B+color%3A+red+%7D%0A++++++++%60%2C%0A++++++++'%2Fmain.vue'%3A+%60%0A++++++++++%3Ctemplate%3E%0A++++++++++++%3Cspan+class%3D%22styled%22%3Ehello%3C%2Fspan%3E+world%0A++++++++++%3C%2Ftemplate%3E%0A++++++++++%3Cscript%3E%0A++++++++++++import+'.%2Fstyle.css'%0A++++++++++++export+default+%7B%0A++++++++++++%7D%0A++++++++++%3C%2Fscript%3E%0A++++++++%60%2C%0A++++++%7D%0A++++%7D%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++++handleModule%3A+async+function+(type%2C+getContentData%2C+path%2C+options)+%7B+%0A++++++++switch+(type)+%7B+%0A++++++++++case+'.css'%3A%0A++++++++++++options.addStyle(await+getContentData(false))%3B%0A++++++++++++return+null%3B%0A++++++++%7D+%0A++++++%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:import_style-->
[:top:](#readme)


## Minimalist Hello World example

<!--example:source:minimalist_example-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    const options = {
      moduleCache: { vue: Vue },
      getFile: () => `<template>Hello World !</template>`,
      addStyle: () => {},
    }
    Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:minimalist_example-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+()+%3D%3E+%60%3Ctemplate%3EHello+World+!%3C%2Ftemplate%3E%60%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:minimalist_example-->
[:top:](#readme)



## Use `options.loadModule` hook

<!--example:source:options_loadModule-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const sfcContent = `
      <template>
        Hello World !
      </template>
    `;
    /* --> */

    const options = {
      moduleCache: { vue: Vue },
      async loadModule(path) {

        // (TBD)

      },
      getFile(url) {

        if ( url === '/myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle() { /* unused here */ },
    }

    const { loadModule } = window['vue3-sfc-loader'];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/myComponent.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:options_loadModule-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+World+!%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++async+loadModule(path)+%7B%0A%0A++++++++%2F%2F+(TBD)%0A%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B+%2F*+unused+here+*%2F+%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('%2FmyComponent.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:options_loadModule-->
[:top:](#readme)



## Dynamic component (using `:is` Special Attribute)

In the following example we use a trick to preserve reactivity through the `Vue.defineAsyncComponent()` call (see the following [discussion](https://github.com/FranckFreiburger/vue3-sfc-loader/discussions/6))

<!--example:source:dynamic_component-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    const options = {

      moduleCache: {
        vue: Vue,
      },

      getFile(url) {

        return ({
          '/a.vue': `
            <template>
              <i> a </i>
            </template>
          `,
          '/b.vue': `
            <template>
              <b> b </b>
            </template>
          `,
        })[url] || Promise.reject( new Error(res.statusText) );
      },

      addStyle() { /* unused here */ },
    }

    const { loadModule } = window["vue3-sfc-loader"];

    const app = Vue.createApp({
      template: `
        <button
          @click="currentComponent = currentComponent === 'a' ? 'b' : 'a'"
        >toggle</button>
        dynamic component: <component :is="comp"></component>
      `,
      computed: {
        comp() {

          const currentComponent = this.currentComponent; // the trick is here
          return Vue.defineAsyncComponent( () => loadModule(`/${ currentComponent }.vue`, options) );

          // or, equivalently, use Function.prototype.bind function like this:
          // return Vue.defineAsyncComponent( (url => loadModule(url, options)).bind(null, `/${ this.currentComponent }.vue`) );
        }
      },
      data() {
        return {
          currentComponent: 'a',
        }
      }
    });

    app.mount('#app');

  </script>
</body>
</html>
```
<!--example:target:dynamic_component-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++return+(%7B%0A++++++++++'%2Fa.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++%3Ci%3E+a+%3C%2Fi%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++%60%2C%0A++++++++++'%2Fb.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++%3Cb%3E+b+%3C%2Fb%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++%60%2C%0A++++++++%7D)%5Burl%5D+%7C%7C+Promise.reject(+new+Error(res.statusText)+)%3B%0A++++++%7D%2C%0A%0A++++++addStyle()+%7B+%2F*+unused+here+*%2F+%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A%0A++++const+app+%3D+Vue.createApp(%7B%0A++++++template%3A+%60%0A++++++++%3Cbutton%0A++++++++++%40click%3D%22currentComponent+%3D+currentComponent+%3D%3D%3D+'a'+%3F+'b'+%3A+'a'%22%0A++++++++%3Etoggle%3C%2Fbutton%3E%0A++++++++dynamic+component%3A+%3Ccomponent+%3Ais%3D%22comp%22%3E%3C%2Fcomponent%3E%0A++++++%60%2C%0A++++++computed%3A+%7B%0A++++++++comp()+%7B%0A%0A++++++++++const+currentComponent+%3D+this.currentComponent%3B+%2F%2F+the+trick+is+here%0A++++++++++return+Vue.defineAsyncComponent(+()+%3D%3E+loadModule(%60%2F%24%7B+currentComponent+%7D.vue%60%2C+options)+)%3B%0A%0A++++++++++%2F%2F+or%2C+equivalently%2C+use+Function.prototype.bind+function+like+this%3A%0A++++++++++%2F%2F+return+Vue.defineAsyncComponent(+(url+%3D%3E+loadModule(url%2C+options)).bind(null%2C+%60%2F%24%7B+this.currentComponent+%7D.vue%60)+)%3B%0A++++++++%7D%0A++++++%7D%2C%0A++++++data()+%7B%0A++++++++return+%7B%0A++++++++++currentComponent%3A+'a'%2C%0A++++++++%7D%0A++++++%7D%0A++++%7D)%3B%0A%0A++++app.mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:dynamic_component-->
[:top:](#readme)




## Nested components

<!--example:source:nested_components-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const config = {
      files: {
        '/main.vue': `
            <template>
                <foo/>
            </template>
            <script>
                import foo from './foo.vue'

                export default {
                    components: {
                        foo,
                    },
                    created() {
                        console.log('main created')
                    },
                    mounted() {
                        console.log('main mounted')
                    }
                }
            </script>
        `,

        '/foo.vue': `
            <template>
                <bar/>
            </template>
            <script>
                import bar from './bar.vue'

                export default {
                    components: {
                        bar,
                    },
                    created() {
                        console.log('foo created')
                    },
                    mounted() {
                        console.log('foo mounted')
                    }
                }
            </script>
        `,

        '/bar.vue': `
            <template>
                end
            </template>
            <script>

                export default {
                    components: {
                    },
                    created() {
                        console.log('bar created')
                    },
                    mounted() {
                        console.log('bar mounted')
                    }
                }
            </script>
        `
      }
    };
    /* --> */


    const options = {
      moduleCache: { vue: Vue },
      getFile: url => config.files[url],
      addStyle: () => {},
    }

    Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('/main.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:nested_components-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+config+%3D+%7B%0A++++++files%3A+%7B%0A++++++++'%2Fmain.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cfoo%2F%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A++++++++++++++++import+foo+from+'.%2Ffoo.vue'%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++++++foo%2C%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('main+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('main+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%2C%0A%0A++++++++'%2Ffoo.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cbar%2F%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A++++++++++++++++import+bar+from+'.%2Fbar.vue'%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++++++bar%2C%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('foo+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('foo+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%2C%0A%0A++++++++'%2Fbar.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++end%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('bar+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('bar+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%0A++++++%7D%0A++++%7D%3B%0A++++%2F*+--%3E+*%2F%0A%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:nested_components-->

[:top:](#readme)




## Use SFC Custom Blocks for i18n

<!--example:source:custom_block_i18n-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://unpkg.com/vue-i18n@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const config = {
      files: {
        '/component.vue': `
          <template>
            {{ $t('hello') }}
          </template>
          <i18n>
          {
            "en": {
              "hello": "hello world!"
            },
            "ja": {
              "hello": "こんにちは、世界！"
            }
          }
          </i18n>
       `
      }
    };
    /* --> */

    const i18n = VueI18n.createI18n();

    const options = {
      moduleCache: { vue: Vue },
      getFile: url => config.files[url],
      addStyle: () => {},
      customBlockHandler(block, filename, options) {

        if ( block.type !== 'i18n' )
          return

        const messages = JSON.parse(block.content);
        for ( let locale in messages )
          i18n.global.mergeLocaleMessage(locale, messages[locale]);
      }
    }

    const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('/component.vue', options)));

    app.use(i18n);

    app.mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:custom_block_i18n-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue-i18n%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+config+%3D+%7B%0A++++++files%3A+%7B%0A++++++++'%2Fcomponent.vue'%3A+%60%0A++++++++++%3Ctemplate%3E%0A++++++++++++%7B%7B+%24t('hello')+%7D%7D%0A++++++++++%3C%2Ftemplate%3E%0A++++++++++%3Ci18n%3E%0A++++++++++%7B%0A++++++++++++%22en%22%3A+%7B%0A++++++++++++++%22hello%22%3A+%22hello+world!%22%0A++++++++++++%7D%2C%0A++++++++++++%22ja%22%3A+%7B%0A++++++++++++++%22hello%22%3A+%22%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF%E3%80%81%E4%B8%96%E7%95%8C%EF%BC%81%22%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++++%3C%2Fi18n%3E%0A+++++++%60%0A++++++%7D%0A++++%7D%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+i18n+%3D+VueI18n.createI18n()%3B%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++++customBlockHandler(block%2C+filename%2C+options)+%7B%0A%0A++++++++if+(+block.type+!%3D%3D+'i18n'+)%0A++++++++++return%0A%0A++++++++const+messages+%3D+JSON.parse(block.content)%3B%0A++++++++for+(+let+locale+in+messages+)%0A++++++++++i18n.global.mergeLocaleMessage(locale%2C+messages%5Blocale%5D)%3B%0A++++++%7D%0A++++%7D%0A%0A++++const+app+%3D+Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fcomponent.vue'%2C+options)))%3B%0A%0A++++app.use(i18n)%3B%0A%0A++++app.mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:custom_block_i18n-->

[:top:](#readme)


## Use Options.getResource() and process the files (nearly) like webpack does

<!--example:source:getResource_loaders-->
```html
<!DOCTYPE html>
<html>
<body>
<script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
<script>

  const config = {
    files: {
      '/main.vue': {
        getContentData: () => /* <!-- */`
          <template>
            <pre><b>'url!./circle.svg' -> </b>{{ require('url!./circle.svg') }}</pre>
            <img width="50" height="50" src="~url!./circle.svg" />
            <pre><b>'file!./circle.svg' -> </b>{{ require('file!./circle.svg') }}</pre>
            <img width="50" height="50" src="~file!./circle.svg" /> <br><i>(image failed to load, this is expected since there is nothing behind this url)</i>
          </template>
        `/* --> */,
        type: '.vue',
      },
      '/circle.svg': {
        getContentData: () => /* <!-- */`
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" />
          </svg>
        `/* --> */,
        type: '.svg',
      }
    }
  };
  
  const options = {
    moduleCache: {
      'vue': Vue,
      'file!'(content, path, type, options) {

        return String(new URL(path, window.location));
      },
      'url!'(content, path, type, options) {

        if ( type === '.svg' )
          return `data:image/svg+xml;base64,${ btoa(content) }`;

        throw new Error(`${ type } not handled by url!`);
      },
    },
    handleModule(type, getContentData, path, options) {

      switch (type) {
        case '.svg': return getContentData(false);
        default: return undefined; // let vue3-sfc-loader handle this
      }
    },
    getFile(url, options) {

      return config.files[url] || (() => { throw new Error('404 ' + url) })();
    },
    getResource({ refPath, relPath }, options) {

      const { moduleCache, pathResolve, getFile } = options;

      // split relPath into loaders[] and file path (eg. 'foo!bar!file.ext' => ['file.ext', 'bar!', 'foo!'])
      const [ resourceRelPath, ...loaders ] = relPath.match(/([^!]+!)|[^!]+$/g).reverse();

      // helper function: process a content through the loaders
      const processContentThroughLoaders = (content, path, type, options) => {
        
        return loaders.reduce((content, loader) => {

          return moduleCache[loader](content, path, type, options);
        }, content);
      }

      // get the actual path of the file
      const path = pathResolve({ refPath, relPath: resourceRelPath });

      // the resource id must be unique in its path context
      const id = loaders.join('') + path;

      return {
        id,
        path,
        async getContent() {

          const { getContentData, type } = await getFile(path);
          return {
            getContentData: async (asBinary) => processContentThroughLoaders(await getContentData(asBinary), path, type, options),
            type,
          };
        }
      };
    },
    addStyle() { /* unused here */ },
  }

  const { loadModule } = window['vue3-sfc-loader'];
  Vue.createApp(Vue.defineAsyncComponent(() => loadModule('/main.vue', options))).mount(document.body);

</script>
</body>
</html>
```
<!--example:target:getResource_loaders-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A%3Cscript%3E%0A%0A++const+config+%3D+%7B%0A++++files%3A+%7B%0A++++++'%2Fmain.vue'%3A+%7B%0A++++++++getContentData%3A+()+%3D%3E+%2F*+%3C!--+*%2F%60%0A++++++++++%3Ctemplate%3E%0A++++++++++++%3Cpre%3E%3Cb%3E'url!.%2Fcircle.svg'+-%3E+%3C%2Fb%3E%7B%7B+require('url!.%2Fcircle.svg')+%7D%7D%3C%2Fpre%3E%0A++++++++++++%3Cimg+width%3D%2250%22+height%3D%2250%22+src%3D%22~url!.%2Fcircle.svg%22+%2F%3E%0A++++++++++++%3Cpre%3E%3Cb%3E'file!.%2Fcircle.svg'+-%3E+%3C%2Fb%3E%7B%7B+require('file!.%2Fcircle.svg')+%7D%7D%3C%2Fpre%3E%0A++++++++++++%3Cimg+width%3D%2250%22+height%3D%2250%22+src%3D%22~file!.%2Fcircle.svg%22+%2F%3E+%3Cbr%3E%3Ci%3E(image+failed+to+load%2C+this+is+expected+since+there+is+nothing+behind+this+url)%3C%2Fi%3E%0A++++++++++%3C%2Ftemplate%3E%0A++++++++%60%2F*+--%3E+*%2F%2C%0A++++++++type%3A+'.vue'%2C%0A++++++%7D%2C%0A++++++'%2Fcircle.svg'%3A+%7B%0A++++++++getContentData%3A+()+%3D%3E+%2F*+%3C!--+*%2F%60%0A++++++++++%3Csvg+viewBox%3D%220+0+100+100%22+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A++++++++++++%3Ccircle+cx%3D%2250%22+cy%3D%2250%22+r%3D%2250%22+%2F%3E%0A++++++++++%3C%2Fsvg%3E%0A++++++++%60%2F*+--%3E+*%2F%2C%0A++++++++type%3A+'.svg'%2C%0A++++++%7D%0A++++%7D%0A++%7D%3B%0A++%0A++const+options+%3D+%7B%0A++++moduleCache%3A+%7B%0A++++++'vue'%3A+Vue%2C%0A++++++'file!'(content%2C+path%2C+type%2C+options)+%7B%0A%0A++++++++return+String(new+URL(path%2C+window.location))%3B%0A++++++%7D%2C%0A++++++'url!'(content%2C+path%2C+type%2C+options)+%7B%0A%0A++++++++if+(+type+%3D%3D%3D+'.svg'+)%0A++++++++++return+%60data%3Aimage%2Fsvg%2Bxml%3Bbase64%2C%24%7B+btoa(content)+%7D%60%3B%0A%0A++++++++throw+new+Error(%60%24%7B+type+%7D+not+handled+by+url!%60)%3B%0A++++++%7D%2C%0A++++%7D%2C%0A++++handleModule(type%2C+getContentData%2C+path%2C+options)+%7B%0A%0A++++++switch+(type)+%7B%0A++++++++case+'.svg'%3A+return+getContentData(false)%3B%0A++++++++default%3A+return+undefined%3B+%2F%2F+let+vue3-sfc-loader+handle+this%0A++++++%7D%0A++++%7D%2C%0A++++getFile(url%2C+options)+%7B%0A%0A++++++return+config.files%5Burl%5D+%7C%7C+(()+%3D%3E+%7B+throw+new+Error('404+'+%2B+url)+%7D)()%3B%0A++++%7D%2C%0A++++getResource(%7B+refPath%2C+relPath+%7D%2C+options)+%7B%0A%0A++++++const+%7B+moduleCache%2C+pathResolve%2C+getFile+%7D+%3D+options%3B%0A%0A++++++%2F%2F+split+relPath+into+loaders%5B%5D+and+file+path+(eg.+'foo!bar!file.ext'+%3D%3E+%5B'file.ext'%2C+'bar!'%2C+'foo!'%5D)%0A++++++const+%5B+resourceRelPath%2C+...loaders+%5D+%3D+relPath.match(%2F(%5B%5E!%5D%2B!)%7C%5B%5E!%5D%2B%24%2Fg).reverse()%3B%0A%0A++++++%2F%2F+helper+function%3A+process+a+content+through+the+loaders%0A++++++const+processContentThroughLoaders+%3D+(content%2C+path%2C+type%2C+options)+%3D%3E+%7B%0A++++++++%0A++++++++return+loaders.reduce((content%2C+loader)+%3D%3E+%7B%0A%0A++++++++++return+moduleCache%5Bloader%5D(content%2C+path%2C+type%2C+options)%3B%0A++++++++%7D%2C+content)%3B%0A++++++%7D%0A%0A++++++%2F%2F+get+the+actual+path+of+the+file%0A++++++const+path+%3D+pathResolve(%7B+refPath%2C+relPath%3A+resourceRelPath+%7D)%3B%0A%0A++++++%2F%2F+the+resource+id+must+be+unique+in+its+path+context%0A++++++const+id+%3D+loaders.join('')+%2B+path%3B%0A%0A++++++return+%7B%0A++++++++id%2C%0A++++++++path%2C%0A++++++++async+getContent()+%7B%0A%0A++++++++++const+%7B+getContentData%2C+type+%7D+%3D+await+getFile(path)%3B%0A++++++++++return+%7B%0A++++++++++++getContentData%3A+async+(asBinary)+%3D%3E+processContentThroughLoaders(await+getContentData(asBinary)%2C+path%2C+type%2C+options)%2C%0A++++++++++++type%2C%0A++++++++++%7D%3B%0A++++++++%7D%0A++++++%7D%3B%0A++++%7D%2C%0A++++addStyle()+%7B+%2F*+unused+here+*%2F+%7D%2C%0A++%7D%0A%0A++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:getResource_loaders-->

[:top:](#readme)


## Load SVG dynamically (using `watch()`)

<!--example:source:load_svg_watch-->
```html
<!DOCTYPE html>
<html>
<body>
<script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
<script>

  /* <!-- */
  const config = {
    files: {
      '/circle0.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>`,
      '/circle1.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" /></svg>`,
      '/main.vue': `
        <template>
          <mycomponent
            :name="'circle' + index % 2"
          />
        </template>
        <script>
          import mycomponent from './myComponent.vue'
          import { ref } from 'vue'

          export default {
            components: {
              mycomponent
            },
            setup() {
              
              const index = ref(0);
              setInterval(() => index.value++, 1000);
              return {
                index,
              }
            },
          }
        </script>
      `,
      '/myComponent.vue': `
        <template>
          <span v-html="svg" />
        </template>
        <script>

          import { ref, watch } from 'vue'

          function asyncToRef(callback) {

            const val = ref();
            watch(() => callback(), promise => promise.then(value => val.value = value), { immediate: true });  // TBD handle catch()...
            return val;
          }

          export default {
            props: {
              name: String
            },
            setup(props) {
              return {
                svg: asyncToRef(() => import('./' + props.name + '.svg')),
              }
            }
          }

        </script>
      `
    }
  };
  /* --> */

  const options = {
    moduleCache: { vue: Vue },
    getFile: url => config.files[url],
    addStyle(textContent) {

      const style = Object.assign(document.createElement('style'), { textContent });
      const ref = document.head.getElementsByTagName('style')[0] || null;
      document.head.insertBefore(style, ref);
    },
    handleModule: async function (type, getContentData, path, options) { 
      switch (type) { 
        case '.svg':
          return getContentData(false);
      } 
    },
  }

  Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('/main.vue', options))).mount(document.body);

</script>

</body>
</html>
```
<!--example:target:load_svg_watch-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A%3Cscript%3E%0A%0A++%2F*+%3C!--+*%2F%0A++const+config+%3D+%7B%0A++++files%3A+%7B%0A++++++'%2Fcircle0.svg'%3A+%60%3Csvg+viewBox%3D%220+0+100+100%22+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle+cx%3D%2250%22+cy%3D%2250%22+r%3D%2250%22+%2F%3E%3C%2Fsvg%3E%60%2C%0A++++++'%2Fcircle1.svg'%3A+%60%3Csvg+viewBox%3D%220+0+100+100%22+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle+cx%3D%2250%22+cy%3D%2250%22+r%3D%2240%22+%2F%3E%3C%2Fsvg%3E%60%2C%0A++++++'%2Fmain.vue'%3A+%60%0A++++++++%3Ctemplate%3E%0A++++++++++%3Cmycomponent%0A++++++++++++%3Aname%3D%22'circle'+%2B+index+%2525+2%22%0A++++++++++%2F%3E%0A++++++++%3C%2Ftemplate%3E%0A++++++++%3Cscript%3E%0A++++++++++import+mycomponent+from+'.%2FmyComponent.vue'%0A++++++++++import+%7B+ref+%7D+from+'vue'%0A%0A++++++++++export+default+%7B%0A++++++++++++components%3A+%7B%0A++++++++++++++mycomponent%0A++++++++++++%7D%2C%0A++++++++++++setup()+%7B%0A++++++++++++++%0A++++++++++++++const+index+%3D+ref(0)%3B%0A++++++++++++++setInterval(()+%3D%3E+index.value%2B%2B%2C+1000)%3B%0A++++++++++++++return+%7B%0A++++++++++++++++index%2C%0A++++++++++++++%7D%0A++++++++++++%7D%2C%0A++++++++++%7D%0A++++++++%3C%2Fscript%3E%0A++++++%60%2C%0A++++++'%2FmyComponent.vue'%3A+%60%0A++++++++%3Ctemplate%3E%0A++++++++++%3Cspan+v-html%3D%22svg%22+%2F%3E%0A++++++++%3C%2Ftemplate%3E%0A++++++++%3Cscript%3E%0A%0A++++++++++import+%7B+ref%2C+watch+%7D+from+'vue'%0A%0A++++++++++function+asyncToRef(callback)+%7B%0A%0A++++++++++++const+val+%3D+ref()%3B%0A++++++++++++watch(()+%3D%3E+callback()%2C+promise+%3D%3E+promise.then(value+%3D%3E+val.value+%3D+value)%2C+%7B+immediate%3A+true+%7D)%3B++%2F%2F+TBD+handle+catch()...%0A++++++++++++return+val%3B%0A++++++++++%7D%0A%0A++++++++++export+default+%7B%0A++++++++++++props%3A+%7B%0A++++++++++++++name%3A+String%0A++++++++++++%7D%2C%0A++++++++++++setup(props)+%7B%0A++++++++++++++return+%7B%0A++++++++++++++++svg%3A+asyncToRef(()+%3D%3E+import('.%2F'+%2B+props.name+%2B+'.svg'))%2C%0A++++++++++++++%7D%0A++++++++++++%7D%0A++++++++++%7D%0A%0A++++++++%3C%2Fscript%3E%0A++++++%60%0A++++%7D%0A++%7D%3B%0A++%2F*+--%3E+*%2F%0A%0A++const+options+%3D+%7B%0A++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++addStyle(textContent)+%7B%0A%0A++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++document.head.insertBefore(style%2C+ref)%3B%0A++++%7D%2C%0A++++handleModule%3A+async+function+(type%2C+getContentData%2C+path%2C+options)+%7B+%0A++++++switch+(type)+%7B+%0A++++++++case+'.svg'%3A%0A++++++++++return+getContentData(false)%3B%0A++++++%7D+%0A++++%7D%2C%0A++%7D%0A%0A++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:load_svg_watch-->

[:top:](#readme)



## Load SVG dynamically (using `async setup()` and `<Suspense>`)

<!--example:source:load_svg_async_setup-->
```html
<!DOCTYPE html>
<html>
<body>
<script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js"></script>
<script>

  /* <!-- */
  const config = {
    files: {
      '/circle.svg': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" /></svg>`,
      '/main.vue': `
        <template>
          <Suspense>
            <mycomponent
              :name="'circle'"
            />
          </Suspense>
        </template>
        <script>
          import mycomponent from './myComponent.vue'
          export default {
            components: {
              mycomponent
            },
          }
        </script>
      `,
      '/myComponent.vue': `
        <template>
          <span v-html="svg"/>
        </template>
        <script>
          export default {
            props: {
              name: String
            },
            async setup(props) {
              return {
                svg: await import('./' + props.name + '.svg'),
              }
            }
          }
        </script>        
      `
    }
  };
  /* --> */

  const options = {
    moduleCache: { vue: Vue },
    getFile: url => config.files[url],
    addStyle(textContent) {

      const style = Object.assign(document.createElement('style'), { textContent });
      const ref = document.head.getElementsByTagName('style')[0] || null;
      document.head.insertBefore(style, ref);
    },
    handleModule: async function (type, getContentData, path, options) { 
      switch (type) { 
        case '.svg':
          return getContentData(false);
      } 
    },
  }

  Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('/main.vue', options))).mount(document.body);

</script>

</body>
</html>
```
<!--example:target:load_svg_async_setup-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A%3Cscript%3E%0A%0A++%2F*+%3C!--+*%2F%0A++const+config+%3D+%7B%0A++++files%3A+%7B%0A++++++'%2Fcircle.svg'%3A+%60%3Csvg+viewBox%3D%220+0+100+100%22+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle+cx%3D%2250%22+cy%3D%2250%22+r%3D%2250%22+%2F%3E%3C%2Fsvg%3E%60%2C%0A++++++'%2Fmain.vue'%3A+%60%0A++++++++%3Ctemplate%3E%0A++++++++++%3CSuspense%3E%0A++++++++++++%3Cmycomponent%0A++++++++++++++%3Aname%3D%22'circle'%22%0A++++++++++++%2F%3E%0A++++++++++%3C%2FSuspense%3E%0A++++++++%3C%2Ftemplate%3E%0A++++++++%3Cscript%3E%0A++++++++++import+mycomponent+from+'.%2FmyComponent.vue'%0A++++++++++export+default+%7B%0A++++++++++++components%3A+%7B%0A++++++++++++++mycomponent%0A++++++++++++%7D%2C%0A++++++++++%7D%0A++++++++%3C%2Fscript%3E%0A++++++%60%2C%0A++++++'%2FmyComponent.vue'%3A+%60%0A++++++++%3Ctemplate%3E%0A++++++++++%3Cspan+v-html%3D%22svg%22%2F%3E%0A++++++++%3C%2Ftemplate%3E%0A++++++++%3Cscript%3E%0A++++++++++export+default+%7B%0A++++++++++++props%3A+%7B%0A++++++++++++++name%3A+String%0A++++++++++++%7D%2C%0A++++++++++++async+setup(props)+%7B%0A++++++++++++++return+%7B%0A++++++++++++++++svg%3A+await+import('.%2F'+%2B+props.name+%2B+'.svg')%2C%0A++++++++++++++%7D%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%3C%2Fscript%3E++++++++%0A++++++%60%0A++++%7D%0A++%7D%3B%0A++%2F*+--%3E+*%2F%0A%0A++const+options+%3D+%7B%0A++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++addStyle(textContent)+%7B%0A%0A++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++document.head.insertBefore(style%2C+ref)%3B%0A++++%7D%2C%0A++++handleModule%3A+async+function+(type%2C+getContentData%2C+path%2C+options)+%7B+%0A++++++switch+(type)+%7B+%0A++++++++case+'.svg'%3A%0A++++++++++return+getContentData(false)%3B%0A++++++%7D+%0A++++%7D%2C%0A++%7D%0A%0A++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:load_svg_async_setup-->

[:top:](#readme)




## Use remote components

Here we import [vue-calendar-picker](https://github.com/FranckFreiburger/vue-calendar-picker) and also manage the **date-fns** dependent module.  
This example use Vue2 because **vue-calendar-picker** is written for Vue2.

<!--example:source:remote_vue_components-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@2/dist/vue.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue2-sfc-loader.js"></script>
  <script>
    
    const options = {
      moduleCache: {
        vue: Vue,
        'date-fns/locale/en/index.js': {}, // handle require('date-fns/locale/' + this.locale.toLowerCase() + '/index.js');
      },
      pathResolve({ refPath, relPath }) {

        if ( relPath === 'date-fns' )
          return 'https://cdnjs.cloudflare.com/ajax/libs/date-fns/1.30.1/date_fns.min.js';

        if ( relPath === '.' ) // self
          return refPath;
        
        // relPath is a module name ?
        if ( relPath[0] !== '.' && relPath[0] !== '/' )
          return relPath;

        return String(new URL(relPath, refPath === undefined ? window.location : refPath));
      },
      getFile: async (url) => {

        // note: here, for convinience, we just returns a content from a 

        if ( new URL(url).pathname === '/main.vue' ) {

          return {
            getContentData: () => /*<!--*/`
              <template>
                <div>
                  <calendar-range locale="EN" :selection="selection" :events="calendarEvents"/>
                  <button @click="add">add</button>
                </div>
              </template>
              <script>
                import calendarRange from 'https://raw.githubusercontent.com/FranckFreiburger/vue-calendar-picker/v1.2.1/src/calendarRange.vue'

                export default {
                  components: {
                    calendarRange,
                  },
                  data: {
                    selection: { start: Date.now(), end: Date.now() },
                    calendarEvents: []
                  },
                  methods: {
                    add: function() {
                      this.calendarEvents.push({
                        color: '#'+Math.floor(Math.random()*16777215).toString(16),
                        start: this.selection.start,
                        end: this.selection.end
                      });
                    }
                  }
                }
              </script>
            `/* --> */,
            type: '.vue',
          }
        }

        return fetch(url).then(res => res.text());
      },
      addStyle(textContent) {

        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
    }

    const { loadModule } = window['vue2-sfc-loader'];

    loadModule('/main.vue', options)
    .then(component => new Vue(component).$mount('#app'))

  </script>

</body>
</html>
```
<!--example:target:remote_vue_components-->
[open in JSBin ▶](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%402%2Fdist%2Fvue.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.8.4%2Fdist%2Fvue2-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A++++%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++'date-fns%2Flocale%2Fen%2Findex.js'%3A+%7B%7D%2C+%2F%2F+handle+require('date-fns%2Flocale%2F'+%2B+this.locale.toLowerCase()+%2B+'%2Findex.js')%3B%0A++++++%7D%2C%0A++++++pathResolve(%7B+refPath%2C+relPath+%7D)+%7B%0A%0A++++++++if+(+relPath+%3D%3D%3D+'date-fns'+)%0A++++++++++return+'https%3A%2F%2Fcdnjs.cloudflare.com%2Fajax%2Flibs%2Fdate-fns%2F1.30.1%2Fdate_fns.min.js'%3B%0A%0A++++++++if+(+relPath+%3D%3D%3D+'.'+)+%2F%2F+self%0A++++++++++return+refPath%3B%0A++++++++%0A++++++++%2F%2F+relPath+is+a+module+name+%3F%0A++++++++if+(+relPath%5B0%5D+!%3D%3D+'.'+%26%26+relPath%5B0%5D+!%3D%3D+'%2F'+)%0A++++++++++return+relPath%3B%0A%0A++++++++return+String(new+URL(relPath%2C+refPath+%3D%3D%3D+undefined+%3F+window.location+%3A+refPath))%3B%0A++++++%7D%2C%0A++++++getFile%3A+async+(url)+%3D%3E+%7B%0A%0A++++++++%2F%2F+note%3A+here%2C+for+convinience%2C+we+just+returns+a+content+from+a+%0A%0A++++++++if+(+new+URL(url).pathname+%3D%3D%3D+'%2Fmain.vue'+)+%7B%0A%0A++++++++++return+%7B%0A++++++++++++getContentData%3A+()+%3D%3E+%2F*%3C!--*%2F%60%0A++++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cdiv%3E%0A++++++++++++++++++%3Ccalendar-range+locale%3D%22EN%22+%3Aselection%3D%22selection%22+%3Aevents%3D%22calendarEvents%22%2F%3E%0A++++++++++++++++++%3Cbutton+%40click%3D%22add%22%3Eadd%3C%2Fbutton%3E%0A++++++++++++++++%3C%2Fdiv%3E%0A++++++++++++++%3C%2Ftemplate%3E%0A++++++++++++++%3Cscript%3E%0A++++++++++++++++import+calendarRange+from+'https%3A%2F%2Fraw.githubusercontent.com%2FFranckFreiburger%2Fvue-calendar-picker%2Fv1.2.1%2Fsrc%2FcalendarRange.vue'%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++calendarRange%2C%0A++++++++++++++++++%7D%2C%0A++++++++++++++++++data%3A+%7B%0A++++++++++++++++++++selection%3A+%7B+start%3A+Date.now()%2C+end%3A+Date.now()+%7D%2C%0A++++++++++++++++++++calendarEvents%3A+%5B%5D%0A++++++++++++++++++%7D%2C%0A++++++++++++++++++methods%3A+%7B%0A++++++++++++++++++++add%3A+function()+%7B%0A++++++++++++++++++++++this.calendarEvents.push(%7B%0A++++++++++++++++++++++++color%3A+'%23'%2BMath.floor(Math.random()*16777215).toString(16)%2C%0A++++++++++++++++++++++++start%3A+this.selection.start%2C%0A++++++++++++++++++++++++end%3A+this.selection.end%0A++++++++++++++++++++++%7D)%3B%0A++++++++++++++++++++%7D%0A++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++++%3C%2Fscript%3E%0A++++++++++++%60%2F*+--%3E+*%2F%2C%0A++++++++++++type%3A+'.vue'%2C%0A++++++++++%7D%0A++++++++%7D%0A%0A++++++++return+fetch(url).then(res+%3D%3E+res.text())%3B%0A++++++%7D%2C%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue2-sfc-loader'%5D%3B%0A%0A++++loadModule('%2Fmain.vue'%2C+options)%0A++++.then(component+%3D%3E+new+Vue(component).%24mount('%23app'))%0A%0A++%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:remote_vue_components-->

[:top:](#readme)



## IE11 example

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@2/dist/vue.runtime.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue2-sfc-loader.js"></script>
  <script>

    const config = {
      files: {
        /* <!-- */
        '/app.vue': ''
        + '  <template>                                                           ' 
        + '    <div>{{ index }}</div>                                             '
        + '  </template>                                                          '
        + '  <script>                                                             '
        + '                                                                       '
        + '    export default {                                                   '
        + '      data() {                                                         '
        + '        return {                                                       '
        + '          index: 0,                                                    '
        + '        }                                                              '
        + '      },                                                               '
        + '      async mounted() {                                                '
        + '                                                                       '
        + '        for ( ; this.index < 100; ++this.index )                       '
        + '          await new Promise(resolve => setTimeout(resolve, 1000));     '
        + '      }                                                                '
        + '    }                                                                  '
        + '  </script>                                                            '
        /* --> */
      }
    };
    
    const options = {
      moduleCache: { vue: Vue },
      getFile: function(url) { return config.files[url] },
      addStyle: function () {},
    }

    window['vue2-sfc-loader'].loadModule('/app.vue', options)
    .then(function(app) {
      new Vue(app).$mount('#app')
    });
    
  </script>
</body>
</html>
```

[:top:](#readme)



<!---

const { blockList, replaceBlock } = require('./evalHtmlCommentsTools.js');

function ghAnchor(header) {

  return header.trim().toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s/g, '-').replace(/\-+$/, '');
}

const toc = [...ctx.wholeContent.matchAll(/^(#{1,3}) ?([^#].*)$/mg)]
.map(e => `${ ' '.repeat((e[1].length-1) * 2) }* [${ e[2] }](#${ ghAnchor(e[2]) })`)
.join('\n')



let result = ctx.wholeContent;


// TOC generation
result = replaceBlock(result, 'toc', `${ toc }`);


// set current version
const version = process.argv[3];

if ( version ) {

  result = replaceBlock(result, 'version', `${ version }`);
  result = result.replace(/(npm\/vue3-sfc-loader@)([-.\d\w]+)/g, `$1${ version }`);
}


// example: generate jsbin.com links

const codeTags = ['```html', '```'];

const examplesList = blockList(ctx.wholeContent).filter(e => e.startsWith('example:source:'));
for ( const example of examplesList ) {

  const [, exampleId ] = example.match(/\w+:\w+:(.*)/);
  const [, source ] = result.match(new RegExp(`\<\!--example:source:${ exampleId }--\>[^]*?${ codeTags[0] }\r?\n([^]*?)${ codeTags[1] }`));
  const encodedSource = encodeURIComponent(source).replace(/%20/g, '+').replace(/%0D/g, '').replace(/%25/g, '%2525');
  const link = `http://jsbin.com/?html,output&html=${ encodedSource }`;
  result = replaceBlock(result, `example:target:${ exampleId }`, `[open in JSBin ▶](${ link })`);
}


result;

--->
