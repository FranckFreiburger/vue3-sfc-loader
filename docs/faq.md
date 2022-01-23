# FAQ

## How to migrate from `http-vue-loader` to `vue3-sfc-loader`

See the [migration guide](./migrationGuide.md)


## Can I load ES6 modules/components ?

Yes, vue3-sfc-loader and vue2-sfc-loader embeds babel that will transform your ES6 into ES5.


## Is vue2-sfc-loader working on IE 11

Yes, since 0.8.4+ `vue2-sfc-loader.js` supports IE 11.


## Why vue3-sfc-loader is so big

Because it embeds :
- [Vue2 compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler) or [Vue3 compiler](https://github.com/vuejs/vue-next/tree/master/packages/compiler-sfc)
- [babel + many plugins](https://babeljs.io/) :small_orange_diamond:
- [postcss](https://postcss.org/)
- [core-js](https://github.com/zloirock/core-js) :small_orange_diamond:

:small_orange_diamond: depends on `browsersList` query

[see details](https://unpkg.com/vue3-sfc-loader/dist/vue3-sfc-loader.report.html) (under the 'Stat' tab)

(note that by design, Vue3 compiler requires babel and postcss)


## Can I call `loadModule()` several times ?

Usually, you call `loadModule()` only once, to load your application entry point (eg. `app.vue`).

But sometimes (rarely) it is necessary to call `loadModule()` several times.
In this case, the application must, at least, share the same `options.moduleCache` through all its `loadModule()` calls.
eg.
```
const options = {
  moduleCache: {
    ...
  },
  ...
}

loadModule('./main.vue', options);
loadModule('./another.vue', options);
```

or, ultimately:
```
const moduleCache = {
  ...
},

loadModule('./main.vue', { moduleCache, ... });
loadModule('./another.vue', { moduleCache, ... });
```


## Can I use vue3-sfc-loader source code directly (./src/index.ts)

Loading from sources "vue3-sfc-loader/src/index" will not work. Sources are intended to be processed by webpack before being usable.


Note that you can [build vue3-sfc-loader yourself](https://github.com/FranckFreiburger/vue3-sfc-loader#build-your-own-version).


## How to use 3rd party plugins or components


#### From a `<script>` tag
If the plugin is loaded through a `<script>` tag, you have to store the plugin's module in `options.moduleCache`.
Note that this is what is currently done with vue :
```
import Vue from 'vue'

const options = {
  moduleCache: {
    vue: Vue
  },
  ...
```
then, subsequent `import Vue from 'vue'` will return the Vue module (`options.moduleCache.vue`).


#### From the same origin
If your plugin is reachable from the current URL (same origin, relative or absolute) just use `import ... from`, `import()` or `require()`.  
`vue3-sfc-loader` is able to load esm, cjs and umd modules). Just take care to specify the full entry point of the plugin.


eg.
```
import Vue from 'vue'
import myPlugin from '../plugins/myPlugin/index.mjs'
vue.use(myPlugin);
...
```

#### From a different origin (remote component)
If your plugin is hosted elsewhere (on a different origin), you have to define your own `option.pathResolve`.
See https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/docs/examples.md#use-remote-components


## How to speed-up loading when using large 3rd party libraries
_(like babylon.js, three.js, PixiJS, ...)_

When you need to use a large 3rd party library that has **no further dependencies** and has a **CJS or UMD version** available, you can load it directly using the `handleModule` option.

example:
```javascript

    const { loadModule, createCJSModule } = window['vue3-sfc-loader'];

    const options = {
      ...
      async handleModule(type, getContentData, path, options) {

        if ( path.toString().endsWith('babylon.max.js') )
          return createCJSModule(type, await getContentData(false), options)

        return undefined;
      },
      ...
```

**note:** when returning `undefined`, `vue3-sfc-loader` will use its default `handleModule()`

(see https://github.com/FranckFreiburger/vue3-sfc-loader/issues/70)


## vue3-sfc-loader vs vue2-sfc-loader

`vue3-sfc-loader` is the name of this project.

Initially, the aim of this project was to support vue3 only (`vue3-sfc-loader.js`), but thanks to the efforts of [Toilal](https://github.com/Toilal), now it also supports vue2 !
This vue2 version is hosted here under the name `vue2-sfc-loader.js`


## vue3-sfc-loader fails to load with `Uncaught SyntaxError: Unexpected token ... `

This error is most likely due to an unsupported browser version.

`vue3-sfc-loader` uses [browsersList](https://github.com/browserslist/browserslist) to determine the minimum version of browsers to support.

The default `browsersList` query (for vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.js) is : `> 1%, last 2 versions, Firefox ESR, not dead, ie 11` _` and supports proxy`_ (proxy support is automatically required when compiling `vue3-sfc-loader.js`)

Note that you can test this query with : `npx browserslist "> 1%, last 2 versions, Firefox ESR, not dead, ie 11 and supports proxy`

If this not fits your browser support requirements, you can try to build your own version of `vue3-sfc-loader` with the browsers you need to support.
(see https://github.com/FranckFreiburger/vue3-sfc-loader#build-your-own-version)
