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

*Defined in [index.ts:75](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a5df5a3/src/index.ts#L75)*

Represents the content of the file or the content and the extension name.

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [index.ts:278](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a5df5a3/src/index.ts#L278)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

## Functions

### loadModule

▸ **loadModule**(`path`: string, `options?`: [Options](interfaces/options.md)): Promise\<[Module](interfaces/module.md)>

*Defined in [index.ts:749](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a5df5a3/src/index.ts#L749)*

This is the main function.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | string | - | The path of the `.vue` file. If path is not a path (eg. an string ID), your [getFile](interfaces/options.md#getfile) function must return a [File](README.md#file) object. |
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

**example using `await`:**

```javascript

;(async () => {

		const app = Vue.createApp({
			components: {
				'my-component': await loadModule('./myComponent.vue', options)
			},
			template: '<my-component></my-component>'
		});

})()
.catch(ex => console.error(ex));

```
