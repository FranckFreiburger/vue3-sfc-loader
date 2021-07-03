# FAQ

## Can I load ES6 modules/components ?

Yes, vue3-sfc-loader and vue2-sfc-loader embeds babel that will transform your ES6 into ES5.


## Is vue2-sfc-loader working on IE 11/

Yes, since 0.8.4+ `vue2-sfc-loader.js` supports IE 11.


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


## How to speed-up loading when using large 3rd party libraries (like babylon.js, three.js, PixiJS, ...)

When you need to use a large 3rd party library that has **no further dependencies** and has an **CJS or UMD version** available, you can load it directly using the `handleModule` option.

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

(see https://github.com/FranckFreiburger/vue3-sfc-loader/issues/70)
