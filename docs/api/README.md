**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](interfaces/cache.md)
* [Module](interfaces/module.md)
* [ModuleHandler](interfaces/modulehandler.md)
* [Options](interfaces/options.md)

### Type aliases

* [File](README.md#file)

### Variables

* [version](README.md#version)

### Functions

* [loadModule](README.md#loadmodule)

## Type aliases

### File

Ƭ  **File**: string \| { content: string ; extname: string  }

*Defined in [index.ts:75](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/73d6120/src/index.ts#L75)*

Represents the content of the file or the content and the extension name.

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [index.ts:256](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/73d6120/src/index.ts#L256)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

## Functions

### loadModule

▸ **loadModule**(`path`: string, `options?`: [Options](interfaces/options.md)): Promise\<[Module](interfaces/module.md)>

*Defined in [index.ts:735](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/73d6120/src/index.ts#L735)*

This is the main function.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | string | - | The path of the .vue file |
`options` | [Options](interfaces/options.md) | throwNotDefined('options') | The options |

**Returns:** Promise\<[Module](interfaces/module.md)>

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
