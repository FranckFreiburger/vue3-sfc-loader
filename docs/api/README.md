**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](interfaces/cache.md)
* [Module](interfaces/module.md)
* [ModuleHandler](interfaces/modulehandler.md)
* [Options](interfaces/options.md)
* [PathHandlers](interfaces/pathhandlers.md)

### Type aliases

* [File](README.md#file)

### Variables

* [version](README.md#version)

### Functions

* [loadModule](README.md#loadmodule)

### Object literals

* [defaultPathHandlers](README.md#defaultpathhandlers)

## Type aliases

### File

Ƭ  **File**: string \| { content: string ; extname: string  }

*Defined in [index.ts:84](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f3c303d/src/index.ts#L84)*

Represents the content of the file or the content and the extension name.

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [index.ts:343](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f3c303d/src/index.ts#L343)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

## Functions

### loadModule

▸ **loadModule**(`path`: string, `options_?`: [Options](interfaces/options.md)): Promise<[Module](interfaces/module.md)\>

*Defined in [index.ts:819](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f3c303d/src/index.ts#L819)*

This is the main function.
This function is intended to be used only to load the entry point of your application.
If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | string | - | The path of the `.vue` file. If path is not a path (eg. an string ID), your [getFile](interfaces/options.md#getfile) function must return a [File](README.md#file) object. |
`options_` | [Options](interfaces/options.md) | throwNotDefined('options') | - |

**Returns:** Promise<[Module](interfaces/module.md)\>

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

## Object literals

### defaultPathHandlers

▪ `Const` **defaultPathHandlers**: object

*Defined in [index.ts:766](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f3c303d/src/index.ts#L766)*

Default implementation of PathHandlers

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`extname` | function | (filepath: string) => string |
`resolve` | function | (absoluteFilepath: string, dependencyPath: string) => string |
