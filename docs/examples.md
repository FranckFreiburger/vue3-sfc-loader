<!--toc-->
* [Examples](#examples)
  * [more complete API usage example](#more-complete-api-usage-example)
  * [Load a Vue component from a string](#load-a-vue-component-from-a-string)
  * [using another template language (pug)](#using-another-template-language-pug)
  * [SFC style CSS variable injection (new edition)](#sfc-style-css-variable-injection-new-edition)
<!--/toc-->

# Examples

:warning: **beware**, the following examples are sticky to version *<!--version-->0.2.14<!--/version-->*. For your use, prefer the [latest version](../README.md#dist)

Since most browsers do not allow you to access local filesystem, you can start a small [express](https://expressjs.com/) server to run these examples.  
Run the following commands to start a basic web server:
```sh
npm install express  # or yarn add express
node -e "require('express')().use(require('express').static(__dirname, {index:'index.html'})).listen(8181)"
```


## A more complete API usage example

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.14 "></script>
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

      getFile(url) {

        if ( url === './myComponent.vue' )
          return Promise.resolve(componentSource);

        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },

      addStyle(styleStr) {

        const style = document.createElement('style');
        style.textContent = styleStr;
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

[:top:](#examples)


## Load a Vue component from a string

```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.14 "></script>
  <script>

    /* <!-- */
    const sfcSontent = `
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
          return Promise.resolve(sfcSontent);
      },
      addStyle() {},
    }

    const { loadModule } = window['vue3-sfc-loader'];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myComponent.vue', options))).mount(document.body);

  </script>
</body>
</html>
```

[:top:](#examples)


## Using another template language (pug)

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://pugjs.org/js/pug.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.14 "></script>
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

      addStyle: () => {},
    }

    const { loadModule } = window["vue3-sfc-loader"];
    Vue.createApp(Vue.defineAsyncComponent(() => loadModule('./myPugComponent.vue', options))).mount('#app');

  </script>
</body>
</html>

```

[:top:](#examples)


## SFC style CSS variable injection (new edition)

_see at [vuejs/rfcs](https://github.com/vuejs/rfcs/pull/231)_

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.14 "></script>
  <script>
    const sfcSontent = /* <!-- */`
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
    `/* --> */;

    const options = {
      moduleCache: {
        vue: Vue,
      },
      getFile(url) {

        if ( url === './myComponent.vue' )
          return Promise.resolve(sfcSontent);
        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
      },
      addStyle(styleStr) {

        const style = document.createElement('style');
        style.textContent = styleStr;
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

[:top:](#examples)


## Minimalist example (just for the fun)

```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.14 "></script>
  <script>

    const vueContent = `
      <template> Hello World !</template>
    `;

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

[:top:](#examples)


<!---

const regexpReservedChars = '\\.+*?^$|[{()';

const regexpReserved = new RegExp('([' + regexpReservedChars.split('').map(char => '\\'+char).join('') + '])', 'gu');

function regexpQuote(str) {

	return str.replace(regexpReserved, '\\$1');
}

const replaceBlock = (currentContent, tag, content) => {

	const block = [ `<\!--${ tag }--\>`, `<\!--/${ tag }--\>` ];
	const regexp = new RegExp(regexpQuote(block[0]) + '([ \\t]*\\r?\\n?)[^]*?(\\s*)' + regexpQuote(block[1]), 'g');
	return currentContent.replace(regexp, block[0] + '$1' + content + '$2' + block[1]);
}

function ghAnchor(header) {

	return header.trim().toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s/g, '-').replace(/\-+$/, '');
}

const toc = [...this.matchAll(/^(#{1,3}) ?([^#].*)$/mg)]
.map(e => `${ ' '.repeat((e[1].length-1) * 2) }* [${ e[2] }](#${ ghAnchor(e[2]) })`)
.join('\n')

const version = process.argv[3];

let result = this;

// TOC generation
result = replaceBlock(result, 'toc', `${ toc }`);

// set current version
result = replaceBlock(result, 'version', `${ version }`);
result = result.replace(/(npm\/vue3-sfc-loader@)(.+?)( )/g, `$1${ version }$3`);

result;

--->
