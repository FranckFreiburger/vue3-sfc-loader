**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](interfaces/cache.md)
* [CustomBlock](interfaces/customblock.md)
* [File](interfaces/file.md)
* [Module](interfaces/module.md)
* [ModuleExport](interfaces/moduleexport.md)
* [ModuleHandler](interfaces/modulehandler.md)
* [Options](interfaces/options.md)
* [PathHandlers](interfaces/pathhandlers.md)

### Type aliases

* [CustomBlockCallback](README.md#customblockcallback)
* [LoadModule](README.md#loadmodule)

### Variables

* [version](README.md#version)
* [vueVersion](README.md#vueversion)

### Functions

* [createSFCModule](README.md#createsfcmodule)
* [loadModule](README.md#loadmodule)

### Object literals

* [defaultPathHandlers](README.md#defaultpathhandlers)

## Type aliases

### CustomBlockCallback

Ƭ  **CustomBlockCallback**: (component: [ModuleExport](interfaces/moduleexport.md)) => void

*Defined in [types.ts:69](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/types.ts#L69)*

CustomBlockCallback function type

___

### LoadModule

Ƭ  **LoadModule**: (path: string, options: [Options](interfaces/options.md)) => Promise<[ModuleExport](interfaces/moduleexport.md)\>

*Defined in [types.ts:335](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/types.ts#L335)*

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [tools.ts:39](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/tools.ts#L39)*

*Defined in [index.ts:11](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/index.ts#L11)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

___

### vueVersion

• `Const` **vueVersion**: string

*Defined in [createSFCModule.ts:4](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/createSFCModule.ts#L4)*

## Functions

### createSFCModule

▸ **createSFCModule**(`source`: string, `filename`: string, `options`: [Options](interfaces/options.md), `loadModule`: [LoadModule](README.md#loadmodule)): Promise<[ModuleExport](interfaces/moduleexport.md)\>

*Defined in [createSFCModule.ts:3](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/createSFCModule.ts#L3)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`filename` | string |
`options` | [Options](interfaces/options.md) |
`loadModule` | [LoadModule](README.md#loadmodule) |

**Returns:** Promise<[ModuleExport](interfaces/moduleexport.md)\>

___

### loadModule

▸ **loadModule**(`path`: string, `options_?`: [Options](interfaces/options.md)): Promise<[ModuleExport](interfaces/moduleexport.md)\>

*Defined in [index.ts:109](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/index.ts#L109)*

This is the main function.
This function is intended to be used only to load the entry point of your application.
If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | string | - | The path of the `.vue` file. If path is not a path (eg. an string ID), your [getFile](interfaces/options.md#getfile) function must return a [File](interfaces/file.md) object. |
`options_` | [Options](interfaces/options.md) | throwNotDefined('options') | - |

**Returns:** Promise<[ModuleExport](interfaces/moduleexport.md)\>

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

*Defined in [index.ts:56](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/f112c45/src/index.ts#L56)*

Default implementation of PathHandlers

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`extname` | function | (filepath: string) => string |
`resolve` | function | (absoluteFilepath: string, dependencyPath: string) => string |
