<!--toc
toc-->

# examples

beware, the following examples are sticky to version <!--version version-->


### more complete API usage example

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.12 "> >

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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.12 "></script>
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


### SFC style CSS variable injection (new edition)

_see at [vuejs/rfcs](https://github.com/vuejs/rfcs/pull/231)_

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.12 ">
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


<!---

// TOC generation


const regexpReservedChars = '\\.+*?^$|[{()';

const regexpReserved = new RegExp('([' + regexpReservedChars.split('').map(char => '\\'+char).join('') + '])', 'gu');

function regexpQuote(str) {

	return str.replace(regexpReserved, '\\$1');
}

const replaceBlock = (currentContent, tag, content) => {

	const block = [ `<\!--${ tag }`, `${ tag }--\>)` ];
	const regexp = new RegExp(regexpQuote(block[0]) + '[^]*?' + regexpQuote(block[1]))
	return currentContent.replace(regexp, block[0] + '\n' + content + '\n' + block[1])
}

function ghAnchor(header) {

	return header.trim().toLowerCase().replace(/[^\w\- ]+/g, '').replace(/\s/g, '-').replace(/\-+$/, '');
}

const contentWithoutToc = replaceBlock(this, 'toc', ''); // avoid to TOC the TOC

const toc = [...contentWithoutToc.matchAll(/^(#{1,3})([^#].*)$/mg)]
.map(e => `${ e[1] }[${ e[2] }](#${ ghAnchor(e[2]) })\n\n`)
.join('')

const version = process.argv[3];

let result = replaceBlock(this, 'toc', toc);

result = replaceBlock(result, 'version', version);

result = result.replace(/(npm\/vue3-sfc-loader@)(.+?)( )/g, `$1${ version }$3`);

result;

--->
