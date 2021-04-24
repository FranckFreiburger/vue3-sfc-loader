# FAQ

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
If your plugin is reachable from the current URL (same origin, relative or absolute) just use `import from`, `import()` or `require()`.
`vue3-sfc-loader` is able to load esm and cjs modules). Just take care to specify the plugin entry point.


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

