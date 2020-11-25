> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](interfaces/cache.md)
* [Module](interfaces/module.md)
* [ModuleHandler](interfaces/modulehandler.md)
* [Options](interfaces/options.md)
* [ValueFactory](interfaces/valuefactory.md)
* [ValueFactoryApi](interfaces/valuefactoryapi.md)

### Functions

* [loadModule](globals.md#loadmodule)

## Functions

### loadModule

▸ **loadModule**(`path`: string, `options`: [Options](interfaces/options.md)): Promise\<[Module](interfaces/module.md)>

*Defined in [index.ts:568](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bed81bb/src/index.ts#L568)*

This is the main function

* example using `Vue.defineAsyncComponent`: *
```javascript

  const app = Vue.createApp({
    components: {
      'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
    },
    template: '<my-component></my-component>'
  });

```

* example using await: *
_the followint core require to be placed in an async function_

```javascript

  const app = Vue.createApp({
    components: {
      'my-component': await loadModule('./myComponent.vue', options)
    },
    template: '<my-component></my-component>'
  });

```

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the .vue file |
`options` | [Options](interfaces/options.md) | The options |

**Returns:** Promise\<[Module](interfaces/module.md)>

A Promise of the component
