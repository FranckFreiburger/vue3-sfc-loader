> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](interfaces/cache.md)
* [ModuleHandler](interfaces/modulehandler.md)
* [Options](interfaces/options.md)

### Functions

* [loadModule](README.md#loadmodule)

## Functions

### loadModule

▸ **loadModule**(`path`: string, `options`: [Options](interfaces/options.md)): Promise\<Module>

*Defined in [index.ts:660](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/484f83e/src/index.ts#L660)*

This is the main function.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the .vue file |
`options` | [Options](interfaces/options.md) | The options |

**Returns:** Promise\<Module>

A Promise of the component

**example using `Vue.defineAsyncComponent`:**
```javascript

  const app = Vue.createApp({
    components: {
      'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
    },
    template: '<my-component></my-component>'
  });

```

**example using await:**
_the following code requires to be placed in an async function_

```javascript

  const app = Vue.createApp({
    components: {
      'my-component': await loadModule('./myComponent.vue', options)
    },
    template: '<my-component></my-component>'
  });

```
