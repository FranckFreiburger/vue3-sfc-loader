<!--toc-->
* [Examples](#examples)
  * [A more complete API usage example](#a-more-complete-api-usage-example)
  * [Load a Vue component from a string](#load-a-vue-component-from-a-string)
  * [Using another template language (pug)](#using-another-template-language-pug)
  * [SFC style CSS variable injection (new edition)](#sfc-style-css-variable-injection-new-edition)
  * [Minimalist example (just for the fun)](#minimalist-example-just-for-the-fun)
<!--/toc-->

# Examples

:warning: **beware**, the following examples are sticky to version *<!--version-->0.2.19<!--/version-->*. For your use, prefer the [latest version](../README.md#dist)

Since most browsers do not allow you to access local filesystem, you can start a small [express](https://expressjs.com/) server to run these examples.  
Run the following commands to start a basic web server:
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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.19 "></script>
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

[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.2.19+%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++const+componentSource+%3D+%2F*+%3C!--+*%2F%60%0A++++++%3Ctemplate%3E%0A++++++++%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+red%3B%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%2F*+--%3E+*%2F%3B%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(componentSource)%3B%0A%0A++++++++return+fetch(url).then(response+%3D%3E+response.ok+%3F+response.text()+%3A+Promise.reject(response))%3B%0A++++++%7D%2C%0A%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A%0A++++++log(type%2C+...args)+%7B%0A%0A++++++++console%5Btype%5D(...args)%3B%0A++++++%7D%2C%0A%0A++++++compiledCache%3A+%7B%0A++++++++set(key%2C+str)+%7B%0A%0A++++++++++%2F%2F+naive+storage+space+management%0A++++++++++for+(%3B%3B)+%7B%0A%0A++++++++++++try+%7B%0A%0A++++++++++++++%2F%2F+doc%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FAPI%2FStorage%0A++++++++++++++window.localStorage.setItem(key%2C+str)%3B%0A++++++++++++++break%3B%0A++++++++++++%7D+catch(ex)+%7B%0A%0A++++++++++++++%2F%2F+handle%3A+Uncaught+DOMException%3A+Failed+to+execute+'setItem'+on+'Storage'%3A+Setting+the+value+of+'XXX'+exceeded+the+quota%0A%0A++++++++++++++window.localStorage.removeItem(window.localStorage.key(0))%3B%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%2C%0A++++++++get(key)+%7B%0A%0A++++++++++return+window.localStorage.getItem(key)%3B%0A++++++++%7D%2C%0A++++++%7D%2C%0A%0A++++++additionalModuleHandlers%3A+%7B%0A++++++++'.json'%3A+(source%2C+path%2C+options)+%3D%3E+JSON.parse(source)%2C%0A++++++%7D%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++const+myComponent+%3D+loadModule('.%2FmyComponent.vue'%2C+options)%3B%0A%0A++++const+app+%3D+Vue.createApp(%7B%0A++++++components%3A+%7B%0A++++++++'my-component'%3A+Vue.defineAsyncComponent(+()+%3D%3E+myComponent+)%2C%0A++++++%7D%2C%0A++++++template%3A+'Hello+%3Cmy-component%3E%3C%2Fmy-component%3E'%0A++++%7D)%3B%0A%0A++++app.mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)







<!--/example:target:complete_api-->

[:top:](#readme)


## Load a Vue component from a string

<!--example:source:cpn_string-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.19 "></script>
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

[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.2.19+%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+World+!%0A++++++%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++%7D%2C%0A++++++addStyle()+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B'vue3-sfc-loader'%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyComponent.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)







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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.19 "></script>
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
<!--example:target:tpl_pug-->

[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fpugjs.org%2Fjs%2Fpug.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.2.19+%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A%3Ctemplate+lang%3D%22pug%22%3E%0Aul%0A++each+val+in+%5B'p'%2C+'u'%2C+'g'%5D%0A++++li%3D+val%0A%3C%2Ftemplate%3E%0A%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++++pug%3A+require('pug')%2C%0A++++++%7D%2C%0A%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyPugComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A%0A++++++++return+fetch(url).then(response+%3D%3E+response.ok+%3F+response.text()+%3A+Promise.reject(response))%3B%0A++++++%7D%2C%0A%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyPugComponent.vue'%2C+options))).mount('%23app')%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A%0A)







<!--/example:target:tpl_pug-->

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
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.19 "></script>
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
        return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
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

[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cdiv+id%3D%22app%22%3E%3C%2Fdiv%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.2.19+%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A++++%2F*+%3C!--+*%2F%0A++++const+sfcContent+%3D+%60%0A++++++%3Ctemplate%3E%0A++++++++Hello+%3Cspan+class%3D%22example%22%3E%7B%7B+msg+%7D%7D%3C%2Fspan%3E%0A++++++%3C%2Ftemplate%3E%0A++++++%3Cscript%3E%0A++++++++export+default+%7B%0A++++++++++data+()+%7B%0A++++++++++++return+%7B%0A++++++++++++++msg%3A+'world!'%2C%0A++++++++++++++color%3A+'blue'%2C%0A++++++++++++%7D%0A++++++++++%7D%0A++++++++%7D%0A++++++%3C%2Fscript%3E%0A++++++%3Cstyle+scoped%3E%0A++++++++.example+%7B%0A++++++++++color%3A+v-bind('color')%0A++++++++%7D%0A++++++%3C%2Fstyle%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B%0A++++++++vue%3A+Vue%2C%0A++++++%7D%2C%0A++++++getFile(url)+%7B%0A%0A++++++++if+(+url+%3D%3D%3D+'.%2FmyComponent.vue'+)%0A++++++++++return+Promise.resolve(sfcContent)%3B%0A++++++++return+fetch(url).then(response+%3D%3E+response.ok+%3F+response.text()+%3A+Promise.reject(response))%3B%0A++++++%7D%2C%0A++++++addStyle(textContent)+%7B%0A%0A++++++++const+style+%3D+Object.assign(document.createElement('style')%2C+%7B+textContent+%7D)%3B%0A++++++++const+ref+%3D+document.head.getElementsByTagName('style')%5B0%5D+%7C%7C+null%3B%0A++++++++document.head.insertBefore(style%2C+ref)%3B%0A++++++%7D%2C%0A++++%7D%0A%0A++++const+%7B+loadModule+%7D+%3D+window%5B%22vue3-sfc-loader%22%5D%3B%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+loadModule('.%2FmyComponent.vue'%2C+options))).mount('%23app')%3B%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)







<!--/example:target:rfc_231-->

[:top:](#readme)


## Minimalist example (just for the fun)

<!--example:source:min_for_fun-->
```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://unpkg.com/vue@next/dist/vue.runtime.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.2.19 "></script>
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
<!--example:target:min_for_fun-->

[open in JSBin](http://jsbin.com/?html,output&html=%3C!DOCTYPE+html%3E%0A%3Chtml%3E%0A%3Cbody%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Funpkg.com%2Fvue%40next%2Fdist%2Fvue.runtime.global.prod.js%22%3E%3C%2Fscript%3E%0A++%3Cscript+src%3D%22https%3A%2F%2Fcdn.jsdelivr.net%2Fnpm%2Fvue3-sfc-loader%400.2.19+%22%3E%3C%2Fscript%3E%0A++%3Cscript%3E%0A%0A++++%2F*+%3C!--+*%2F%0A++++const+vueContent+%3D+%60%0A++++++%3Ctemplate%3E+Hello+World+!%3C%2Ftemplate%3E%0A++++%60%3B%0A++++%2F*+--%3E+*%2F%0A%0A++++const+options+%3D+%7B%0A++++++moduleCache%3A+%7B+vue%3A+Vue+%7D%2C%0A++++++getFile%3A+()+%3D%3E+vueContent%2C%0A++++++addStyle%3A+()+%3D%3E+%7B%7D%2C%0A++++%7D%0A%0A++++Vue.createApp(Vue.defineAsyncComponent(()+%3D%3E+window%5B'vue3-sfc-loader'%5D.loadModule('file.vue'%2C+options))).mount(document.body)%3B%0A%0A++%3C%2Fscript%3E%0A%3C%2Fbody%3E%0A%3C%2Fhtml%3E%0A)







<!--/example:target:min_for_fun-->

[:top:](#readme)


<!---

const regexpReservedChars = '\\.+*?^$|[{()';

const regexpReserved = new RegExp('([' + regexpReservedChars.split('').map(char => '\\'+char).join('') + '])', 'gu');

function regexpQuote(str) {

	return str.replace(regexpReserved, '\\$1');
}

function blockList(wholeContent) {

  return [...wholeContent.matchAll(/<\!--(.*?)--\>/g)].map(e => e[1]);
}

const replaceBlock = (currentContent, tag, content) => {

	const block = [ `<\!--${ tag }--\>`, `<\!--/${ tag }--\>` ];
	const regexp = new RegExp(regexpQuote(block[0]) + '([ \\t]*\\r?\\n?)[^]*?(\\s*)' + regexpQuote(block[1]), 'g');
	return currentContent.replace(regexp, block[0] + '$1' + content + '$2' + block[1]);
}

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
  result = result.replace(/(npm\/vue3-sfc-loader@)(.+?)( )/g, `$1${ version }$3`);
}


// example: generate jsbin.com links

const codeTags = ['```html', '```'];

const examplesList = blockList(ctx.wholeContent).filter(e => e.startsWith('example:source:'));
for ( const example of examplesList ) {

  const [, exampleId ] = example.match(/\w+:\w+:(.*)/);
  const [, source ] = result.match(new RegExp(`\<\!--example:source:${ exampleId }--\>[^]*?${ codeTags[0] }\r?\n([^]*?)${ codeTags[1] }`));
  const encodedSource = encodeURIComponent(source).replace(/%20/g, '+').replace(/%0D/g, '');
  const link = `http://jsbin.com/?html,output&html=${ encodedSource }`;
  result = replaceBlock(result, `example:target:${ exampleId }`, `\n[open in JSBin](${ link })\n`);
}


result;

--->
