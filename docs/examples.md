<!--toc-->
* [Examples](#examples)
  * [A more complete API usage example](#a-more-complete-api-usage-example)
  * [Load a Vue component from a string](#load-a-vue-component-from-a-string)
  * [Using another template language (pug)](#using-another-template-language-pug)
  * [Using another style language (stylus)](#using-another-style-language-stylus)
  * [SFC style CSS variable injection (new edition)](#sfc-style-css-variable-injection-new-edition)
  * [Minimalist example (just for the fun)](#minimalist-example-just-for-the-fun)
  * [Use `options.loadModule` hook](#use-optionsloadmodule-hook)
  * [Dynamic component (`:is` Special Attribute)](#dynamic-component-is-special-attribute)
  * [Nested components](#nested-components)
  * [Example using SFC Custom Blocks for i18n](#example-using-sfc-custom-blocks-for-i18n)
<!--/toc-->

# Examples

:warning: **beware**, the following examples are sticky to version *<!--version-->0.4.1<!--/version-->*. For your use, prefer the [latest version](../README.md#dist)

**Try the examples locally**  
Since most browsers do not allow you to access local filesystem, you can start a small [express](https://expressjs.com/) server to run these examples.  
Run the following commands to start a basic web server on port `8181`:
```sh
npm install express  # or yarn add express
node -e "require('express')().use(require('express').static(__dirname, {index:'index.html'})).listen(8181)"
```


## A more complete API usage example

<!--example:source:complete_api-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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

        if ( url === './myComponent.vue' )
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

      additionalModuleHandlers: {
        '.json': (source, path, options) => JSON.parse(source),
      }
    }

    const { loadModule } = window['vue3-sfc-loader'];
    const myComponent = loadModule('./myComponent.vue', options);

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
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+componentSource+%3D+%2F*+%3C!--+*%2F%60%0A++++++%3Ctemplate%3E%0A++++++++%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+red%3B%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%2F*+--%3E+*%2F%3B%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A%0A++++++async+getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(componentSource)%3B%0A%0A++++++++const+res+%3D+await+fetch(url)%3B%0A++++++++if+(+!res.ok+)%0A++++++++++throw+Object.assign(new+Error(url%2B'+'%2Bres.statusText)%2C+%7B+res+%7D)%3B%0A++++++++return+await+res.text()%3B%0A++++++%7D%2C%0A%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A%0A++++++log(type%2C+...args)+%7B%0A%0A++++++++console%5Btype%5D(...args)%3B%0A++++++%7D%2C%0A%0A++++++compiledCache%3A+%7B%0A++++++++set(key%2C+str)+%7B%0A%0A++++++++++%2F%2F+naive+storage+space+management%0A++++++++++for+(%3B%3B)+%7B%0A%0A++++++++++++try+%7B%0A%0A++++++++++++++%2F%2F+doc%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FStorage%0A++++++++++++++window.localStorage.setItem(key%2C+str)%3B%0A++++++++++++++break%3B%0A++++++++++++%7D+catch(ex)+%7B%0A%0A++++++++++++++%2F%2F+handle%3A+Uncaught+DOMException%3A+Failed+to+execute+'setItem'+on+'Storage'%3A+Setting+the+value+of+'XXX'+exceeded+the+quota%0A%0A++++++++++++++window.localStorage.removeItem(window.localStorage.key(0))%3B%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%2C%0A++++++++get(key)+%7B%0A%0A++++++++++return+window.localStorage.getItem(key)%3B%0A++++++++%7D%2C%0A++++++%7D%2C%0A%0A++++++additionalModuleHandlers%3A+%7B%0A++++++++'.json'%3A+(source%2C+path%2C+options)+%3D%3E+JSON.parse(source)%2C%0A++++++%7D%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++const+myComponent+%3D+loadModule('.%2FmyComponent.vue'%2C+options)%3B%0A%0A++++const+app+%3D+Vue.createApp(%7B%0A++++++components%3A+%7B%0A++++++++'my-component'%3A+Vue.defineAsyncComponent(+()+%3D%3E+myComponent+)%2C%0A++++++%7D%2C%0A++++++template%3A+'Hello+%3Cmy-component%3E%3C%2Fmy-component%3E'%0A++++%7D)%3B%0A%0A++++app.mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:complete_api-->
[:top:](#readme)


## Load a Vue component from a string

<!--example:source:cpn_string-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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

        if ( url === './myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle() {},
    }

    const { loadModule } = window['vue3-sfc-loader'];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myComponent.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:cpn_string-->
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+World+!%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyComponent.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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

        if ( url === './myPugComponent.vue' )
          return Promise.resolve(sfcContent);
      },

      addStyle: () => {},
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myPugComponent.vue', options))).mount('#app');

  </script>
</body>
</html>

```
<!--example:target:tpl_pug-->
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fpugjs.org%2Fjs%2Fpug.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A%3Ctemplate+lang%3D%22pug%22%3E%0Aul%0A++each+val+in+%5B'p'%2C+'u'%2C+'g'%5D%0A++++li%3D+val%0A%3C%2Ftemplate%3E%0A%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++pug%3A+require('pug')%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyPugComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyPugComponent.vue'%2C+options))).mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A)
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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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
        stylus: source => Object.assign(stylus(source), { deps: () => [] }), // note: deps() does not work in this bundle of stylus (see https://stylus-lang.com/docs/js.html#deps)
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
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22%2F%2Fstylus-lang.com%2Ftry%2Fstylus.min.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+vueContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+%3Cb%3EWorld%3C%2Fb%3E+!%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cstyle+lang%3D%22stylus%22%3E%0A+b%0A++color+red%0A++++++%3C%2Fstyle%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++stylus%3A+source+%3D%3E+Object.assign(stylus(source)%2C+%7B+deps%3A+()+%3D%3E+%5B%5D+%7D)%2C+%2F%2F+note%3A+deps()+does+not+work+in+this+bundle+of+stylus+(see+https%3A%2F%2Fstylus-lang.com%2Fdocs%2Fjs.html%23deps)%0A++++++%7D%2C%0A++++++getFile%3A+()+%3D%3E+vueContent%2C%0A++++++addStyle(styleStr)+%7B%0A++++++++const+style+%3D+document.createElement('style')%3B%0A++++++++style.textContent+%3D+styleStr%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A)
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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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

        if ( url === './myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle(textContent) {

        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
      },
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myComponent.vue', options))).mount('#app');
  </script>
</body>
</html>
```
<!--example:target:rfc_231-->
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%2C%0A++++++++++++++color%3A+'blue'%2C%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+v-bind('color')%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyComponent.vue'%2C+options))).mount('%23app')%3B%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:rfc_231-->
[:top:](#readme)


## Minimalist example (just for the fun)

<!--example:source:minimalist_example-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
  <script>

    /* <!-- */
    const vueContent = `
      <template> Hello World !</template>
    `;
    /* --> */

    const options = {
      moduleCache: { vue: Vue },
      getFile: () => vueContent,
      addStyle: () => {},
    }

    Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:minimalist_example-->
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+vueContent+%3D+%60%0A++++++%3Ctemplate%3E+Hello+World+!%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+()+%3D%3E+vueContent%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:minimalist_example-->
[:top:](#readme)



## Use `options.loadModule` hook

<!--example:source:options_loadModule-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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

        if ( url === './myComponent.vue' )
          return Promise.resolve(sfcContent);
      },
      addStyle() {},
    }

    const { loadModule } = window['vue3-sfc-loader'];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myComponent.vue', options))).mount(document.body);

  </script>
</body>
</html>
```
<!--example:target:options_loadModule-->
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+World+!%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++async+loadModule(path)+%7B%0A%0A++++++++%2F%2F+(TBD)%0A%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyComponent.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:options_loadModule-->
[:top:](#readme)



## Dynamic component (`:is` Special Attribute)

In the following example we use a trick to preserve reactivity through the `Vue.defineAsyncComponent()` call (see the following [discussion](https://github.com/FranckFreiburger/vue3-sfc-loader/discussions/6))

<!--example:source:dynamic_component-->
```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
  <script>

    const options = {

      moduleCache: {
        vue: Vue,
      },

      getFile(url) {

        switch ( url ) {
          case 'a.vue':
            return `
              <template>
                <i> a </i>
              </template>
            `;
          case 'b.vue':
            return `
              <template>
                <b> b </b>
              </template>
            `;
        }

        return fetch(url).then(res => res.ok ? res.text() : Promise.reject( new Error(res.statusText) ));
      },

      addStyle() {},
    }

    const { loadModule } = window["vue3-sfc-loader"];


    const app = Vue.createApp({
      template: `
        <button
          @click="currentComponent = currentComponent === 'a' ? 'b' : 'a'"
        >toggle</button>
        dynamic component:
        <component :is="comp"></component>
      `,
      computed: {
        comp() {

          const currentComponent = this.currentComponent; // the trick is here
          return Vue.defineAsyncComponent( () => loadModule(currentComponent + '.vue', options) )

          // or, equivalently, use Function.prototype.bind function like this:
          // return Vue.defineAsyncComponent( (url => loadModule(url, options)).bind(null, this.currentComponent + '.vue') )
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
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++switch+(+url+)+%7B%0A++++++++++case+'a.vue'%3A%0A++++++++++++return+%60%0A++++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Ci%3E+a+%3C%2Fi%3E%0A++++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%60%3B%0A++++++++++case+'b.vue'%3A%0A++++++++++++return+%60%0A++++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cb%3E+b+%3C%2Fb%3E%0A++++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%60%3B%0A++++++++%7D%0A%0A++++++++return+fetch(url).then(res+%3D%3E+res.ok+%3F+res.text()+%3A+Promise.reject(+new+Error(res.statusText)+))%3B%0A++++++%7D%2C%0A%0A++++++addStyle()+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A%0A%0A++++const+app+%3D+Vue.createApp(%7B%0A++++++template%3A+%60%0A++++++++%3Cbutton%0A++++++++++%40click%3D%22currentComponent+%3D+currentComponent+%3D%3D%3D+'a'+%3F+'b'+%3A+'a'%22%0A++++++++%3Etoggle%3C%2Fbutton%3E%0A++++++++dynamic+component%3A%0A++++++++%3Ccomponent+%3Ais%3D%22comp%22%3E%3C%2Fcomponent%3E%0A++++++%60%2C%0A++++++computed%3A+%7B%0A++++++++comp()+%7B%0A%0A++++++++++const+currentComponent+%3D+this.currentComponent%3B+%2F%2F+the+trick+is+here%0A++++++++++return+Vue.defineAsyncComponent(+()+%3D%3E+loadModule(currentComponent+%2B+'.vue'%2C+options)+)%0A%0A++++++++++%2F%2F+or%2C+equivalently%2C+use+Function.prototype.bind+function+like+this%3A%0A++++++++++%2F%2F+return+Vue.defineAsyncComponent(+(url+%3D%3E+loadModule(url%2C+options)).bind(null%2C+this.currentComponent+%2B+'.vue')+)%0A++++++++%7D%0A++++++%7D%2C%0A++++++data()+%7B%0A++++++++return+%7B%0A++++++++++currentComponent%3A+'a'%2C%0A++++++++%7D%0A++++++%7D%0A++++%7D)%3B%0A%0A++++app.mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)
<!--/example:target:dynamic_component-->
[:top:](#readme)




## Nested components

<!--example:source:nested_components-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+config+%3D+%7B%0A++++++files%3A+%7B%0A++++++++'%2Fmain.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cfoo%2F%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A++++++++++++++++import+foo+from+'.%2Ffoo.vue'%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++++++foo%2C%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('main+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('main+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%2C%0A%0A++++++++'%2Ffoo.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++%3Cbar%2F%3E%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A++++++++++++++++import+bar+from+'.%2Fbar.vue'%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++++++bar%2C%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('foo+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('foo+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%2C%0A%0A++++++++'%2Fbar.vue'%3A+%60%0A++++++++++++%3Ctemplate%3E%0A++++++++++++++++end%0A++++++++++++%3C%2Ftemplate%3E%0A++++++++++++%3Cscript%3E%0A%0A++++++++++++++++export+default+%7B%0A++++++++++++++++++++components%3A+%7B%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++created()+%7B%0A++++++++++++++++++++++++console.log('bar+created')%0A++++++++++++++++++++%7D%2C%0A++++++++++++++++++++mounted()+%7B%0A++++++++++++++++++++++++console.log('bar+mounted')%0A++++++++++++++++++++%7D%0A++++++++++++++++%7D%0A++++++++++++%3C%2Fscript%3E%0A++++++++%60%0A++++++%7D%0A++++%7D%3B%0A++++%2F*+--%3E+*%2F%0A%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fmain.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:nested_components-->
[:top:](#readme)




## Example using SFC Custom Blocks for i18n

<!--example:source:custom_block_i18n-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://unpkg.com/vue-i18n@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.4.1/dist/vue3-sfc-loader.js"></script>
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
[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue-i18n%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.4.1%2Fdist%2Fvue3-sfc-loader.js%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+config+%3D+%7B%0A++++++files%3A+%7B%0A++++++++'%2Fcomponent.vue'%3A+%60%0A++++++++++%3Ctemplate%3E%0A++++++++++++%7B%7B+%24t('hello')+%7D%7D%0A++++++++++%3C%2Ftemplate%3E%0A++++++++++%3Ci18n%3E%0A++++++++++%7B%0A++++++++++++%22en%22%3A+%7B%0A++++++++++++++%22hello%22%3A+%22hello+world!%22%0A++++++++++++%7D%2C%0A++++++++++++%22ja%22%3A+%7B%0A++++++++++++++%22hello%22%3A+%22%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF%E3%80%81%E4%B8%96%E7%95%8C%EF%BC%81%22%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++++%3C%2Fi18n%3E%0A+++++++%60%0A++++++%7D%0A++++%7D%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+i18n+%3D+VueI18n.createI18n()%3B%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+url+%3D%3E+config.files%5Burl%5D%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++++customBlockHandler(block%2C+filename%2C+options)+%7B%0A%0A++++++++if+(+block.type+!%3D%3D+'i18n'+)%0A++++++++++return%0A%0A++++++++const+messages+%3D+JSON.parse(block.content)%3B%0A++++++++for+(+let+locale+in+messages+)%0A++++++++++i18n.global.mergeLocaleMessage(locale%2C+messages%5Blocale%5D)%3B%0A++++++%7D%0A++++%7D%0A%0A++++const+app+%3D+Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('%2Fcomponent.vue'%2C+options)))%3B%0A%0A++++app.use(i18n)%3B%0A%0A++++app.mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)<!--/example:target:custom_block_i18n-->
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
  const encodedSource = encodeURIComponent(source).replace(/%20/g, '+').replace(/%0D/g, '');
  const link = `http://jsbin.com/?html,output&html=${ encodedSource }`;
  result = replaceBlock(result, `example:target:${ exampleId }`, `[open in JSBin](${ link })`);
}


result;

--->
