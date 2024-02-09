vue3-sfc-loader

# vue3-sfc-loader

## Table of contents

### Type Aliases

- [AbstractPath](README.md#abstractpath)
- [Cache](README.md#cache)
- [ContentData](README.md#contentdata)
- [CustomBlock](README.md#customblock)
- [CustomBlockCallback](README.md#customblockcallback)
- [File](README.md#file)
- [LangProcessor](README.md#langprocessor)
- [Module](README.md#module)
- [ModuleCacheId](README.md#modulecacheid)
- [ModuleExport](README.md#moduleexport)
- [ModuleHandler](README.md#modulehandler)
- [Options](README.md#options)
- [PathContext](README.md#pathcontext)
- [PathResolve](README.md#pathresolve)
- [Resource](README.md#resource)

### Variables

- [version](README.md#version)
- [vueVersion](README.md#vueversion)

### Functions

- [buildTemplateProcessor](README.md#buildtemplateprocessor)
- [loadModule](README.md#loadmodule)

## Type Aliases

### <a id="abstractpath" name="abstractpath"></a> AbstractPath

Ƭ **AbstractPath**: `Object`

An abstract way to specify a path. It could be a simple string or a object like an URL. An AbstractPath must always be convertible to a string.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `toString` | () => `string` |

**toString**: () => `string`

\-

-----

#### Defined in

[types.ts:32](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L32)

___

### <a id="cache" name="cache"></a> Cache

Ƭ **Cache**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `get` | (`key`: `string`) => `Promise`\<`string`\> |
| `set` | (`key`: `string`, `value`: `string`) => `Promise`\<`void`\> |

**get**: (`key`: `string`) => `Promise`\<`string`\>

\-

-----

**set**: (`key`: `string`, `value`: `string`) => `Promise`\<`void`\>

\-

-----

#### Defined in

[types.ts:20](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L20)

___

### <a id="contentdata" name="contentdata"></a> ContentData

Ƭ **ContentData**: `string` \| `ArrayBuffer`

#### Defined in

[types.ts:71](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L71)

___

### <a id="customblock" name="customblock"></a> CustomBlock

Ƭ **CustomBlock**: `Object`

A custom block

#### Type declaration

| Name | Type |
| :------ | :------ |
| `attrs` | `Record`\<`string`, `string` \| ``true``\> |
| `content` | `string` |
| `type` | `string` |

**attrs**: `Record`\<`string`, `string` \| ``true``\>

\-

-----

**content**: `string`

\-

-----

**type**: `string`

\-

-----

#### Defined in

[types.ts:109](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L109)

___

### <a id="customblockcallback" name="customblockcallback"></a> CustomBlockCallback

Ƭ **CustomBlockCallback**: (`component`: [`ModuleExport`](README.md#moduleexport)) => `void`

CustomBlockCallback function type

#### Type declaration

▸ (`component`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `component` | [`ModuleExport`](README.md#moduleexport) |

##### Returns

`void`

#### Defined in

[types.ts:103](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L103)

___

### <a id="file" name="file"></a> File

Ƭ **File**: `Object`

Represents a file content and the extension name.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getContentData` | (`asBinary`: `Boolean`) => `Promise`\<[`ContentData`](README.md#contentdata)\> |
| `type` | `string` |

**getContentData**: (`asBinary`: `Boolean`) => `Promise`\<[`ContentData`](README.md#contentdata)\>

The content data accessor (request data as text of binary)

-----

**type**: `string`

The content type (file extension name, eg. '.svg' )

-----

#### Defined in

[types.ts:77](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L77)

___

### <a id="langprocessor" name="langprocessor"></a> LangProcessor

Ƭ **LangProcessor**: (`source`: `string`, `preprocessOptions?`: `any`) => `Promise`\<`string`\> \| `string`

#### Type declaration

▸ (`source`, `preprocessOptions?`): `Promise`\<`string`\> \| `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `source` | `string` |
| `preprocessOptions?` | `any` |

##### Returns

`Promise`\<`string`\> \| `string`

#### Defined in

[types.ts:446](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L446)

___

### <a id="module" name="module"></a> Module

Ƭ **Module**: `Object`

This just represents a loaded js module

#### Type declaration

| Name | Type |
| :------ | :------ |
| `exports` | [`ModuleExport`](README.md#moduleexport) |

**exports**: [`ModuleExport`](README.md#moduleexport)

\-

-----

#### Defined in

[types.ts:128](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L128)

___

### <a id="modulecacheid" name="modulecacheid"></a> ModuleCacheId

Ƭ **ModuleCacheId**: `string`

#### Defined in

[types.ts:26](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L26)

___

### <a id="moduleexport" name="moduleexport"></a> ModuleExport

Ƭ **ModuleExport**: {} \| ``null``

This just represents a loaded js module exports

#### Defined in

[types.ts:123](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L123)

___

### <a id="modulehandler" name="modulehandler"></a> ModuleHandler

Ƭ **ModuleHandler**: (`type`: `string`, `getContentData`: [`File`](README.md#file)[``"getContentData"``], `path`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<[`ModuleExport`](README.md#moduleexport) \| ``null``\>

Used by the library when it needs to handle a does not know how to handle a given file type (eg. `.json` files).

#### Type declaration

▸ (`type`, `getContentData`, `path`, `options`): `Promise`\<[`ModuleExport`](README.md#moduleexport) \| ``null``\>

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type` | `string` | The type of the file. It can be anything, but must be '.vue', '.js' or '.mjs' for vue, js and esm files. |
| `getContentData` | [`File`](README.md#file)[``"getContentData"``] | The method to get the content data of a file (text or binary). see [[ File['getContentData'] ]] |
| `path` | [`AbstractPath`](README.md#abstractpath) | The path of the file |
| `options` | [`Options`](README.md#options) | The options **example:** ```javascript ... ... ``` |

##### Returns

`Promise`\<[`ModuleExport`](README.md#moduleexport) \| ``null``\>

#### Defined in

[types.ts:68](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L68)

___

### <a id="options" name="options"></a> Options

Ƭ **Options**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `additionalBabelParserPlugins?` | `babel_ParserPlugin`[] |
| `additionalBabelPlugins?` | `Record`\<`string`, `any`\> |
| `compiledCache?` | [`Cache`](README.md#cache) |
| `delimiters?` | [`string`, `string`] |
| `devMode?` | `boolean` |
| `getPathname` | (`path`: `string`) => `string` |
| `handleModule?` | [`ModuleHandler`](README.md#modulehandler) |
| `isCustomElement` | (`tag`: `string`) => `boolean` \| `undefined` |
| `moduleCache` | `Record`\<[`ModuleCacheId`](README.md#modulecacheid), `LoadingType`\<[`ModuleExport`](README.md#moduleexport)\> \| [`ModuleExport`](README.md#moduleexport)\> |
| `pathResolve` | [`PathResolve`](README.md#pathresolve) |
| `whitespace?` | ``"preserve"`` \| ``"condense"`` |
| `addStyle` | (`style`: `string`, `scopeId`: `string`) => `void` |
| `createCJSModule` | (`refPath`: [`AbstractPath`](README.md#abstractpath), `source`: `string`, `options`: [`Options`](README.md#options)) => [`Module`](README.md#module) |
| `customBlockHandler?` | (`block`: [`CustomBlock`](README.md#customblock), `filename`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<[`CustomBlockCallback`](README.md#customblockcallback)\> |
| `getFile` | (`path`: [`AbstractPath`](README.md#abstractpath)) => `Promise`\<[`File`](README.md#file) \| [`ContentData`](README.md#contentdata)\> |
| `getResource` | (`pathCx`: [`PathContext`](README.md#pathcontext), `options`: [`Options`](README.md#options)) => [`Resource`](README.md#resource) |
| `loadModule?` | (`path`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<{}\> |
| `log?` | (`type`: `string`, ...`data`: `any`[]) => `void` |
| `processStyles` | (`srcRaw`: `string`, `lang`: `string`, `filename`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<`string`\> |

**additionalBabelParserPlugins?**: `babel_ParserPlugin`[]

Additional babel parser plugins. [TBD]

	```javascript
		...
		...
	```

-----

**additionalBabelPlugins?**: `Record`\<`string`, `any`\>

Additional babel plugins. [TBD]

	```javascript
		...
		...
	```

-----

**compiledCache?**: [`Cache`](README.md#cache)

[[get]]() and [[set]]() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`).
Since compilation consume a lot of CPU, is is always a good idea to provide this object.

**example:**

In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB).
Here we handle space limitation in a very basic way.
Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/)
```javascript
	...
	compiledCache: {
		set(key, str) {
	
			// naive storage space management
			for (;;) {
	
				try {
	
					// doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
					window.localStorage.setItem(key, str);
					break;
				} catch(ex) {
					// here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota
	
					window.localStorage.removeItem(window.localStorage.key(0));
				}
			}
		},
		get(key) {
	
			return window.localStorage.getItem(key);
		},
	},
	...
```

-----

**delimiters?**: [`string`, `string`]

Sets the delimiters used for text interpolation within the template.  
Typically this is used to avoid conflicting with server-side frameworks that also use mustache syntax.

	```javascript
		...
		<script>
	
			// <!--
			const vueContent = `
				<template> Hello [[[[ who ]]]] !</template>
				<script>
				export default {
					data() {
						return {
							who: 'world'
						}
					}
				}
				</script>
			`;
			// -->
	
			const options = {
				moduleCache: { vue: Vue },
				getFile: () => vueContent,
				addStyle: () => {},
				delimiters: ['[[[[', ']]]]'],
			}
	
			const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options)));
			app.mount(document.body);
	
		</script>
		...
	```

-----

**devMode?**: `boolean`

Set development mode
prevent minification, allow debugger statement,

-----

**getPathname**: (`path`: `string`) => `string`

by default, remove the search string
in situation where you need to keep the path intact, use `getPathname: path => path`

-----

**handleModule?**: [`ModuleHandler`](README.md#modulehandler)

Handle additional module types (eg. '.svg', '.json' ). see [[ModuleHandler]]

-----

**isCustomElement**: (`tag`: `string`) => `boolean` \| `undefined`

Specifies a check method to recognize native custom elements.

see. https://vuejs.org/api/application.html#app-config-compileroptions-iscustomelement
note: this option has no effect on vue2

-----

**moduleCache**: `Record`\<[`ModuleCacheId`](README.md#modulecacheid), `LoadingType`\<[`ModuleExport`](README.md#moduleexport)\> \| [`ModuleExport`](README.md#moduleexport)\>

Initial cache that will contain resolved dependencies. All new modules go here.
`vue` must initially be contained in this object.
[[moduleCache]] is mandatory and should be shared between options objects used for you application (note that you can also pass the same options object through multiple loadModule calls)
It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...).
​ * The library take the ownership of [[moduleCache]] when [[loadModule]] is called.
See also [[options.loadModule]].

**example:**
```javascript
	...
	moduleCache: Object.assign(Object.create(null), {
		vue: Vue,
	}),
	...
```

-----

**pathResolve**: [`PathResolve`](README.md#pathresolve)

Abstact path handling
*(optional)*

-----

**whitespace?**: ``"preserve"`` \| ``"condense"``

Whitespace handling strategy
	 see https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#options

-----

**addStyle**: (`style`: `string`, `scopeId`: `string`) => `void`

Called by the library when CSS style must be added in the HTML document.

-----

**createCJSModule**: (`refPath`: [`AbstractPath`](README.md#abstractpath), `source`: `string`, `options`: [`Options`](README.md#options)) => [`Module`](README.md#module)

creates a CommonJS module from JS source string.
*(optional)*

-----

**customBlockHandler?**: (`block`: [`CustomBlock`](README.md#customblock), `filename`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<[`CustomBlockCallback`](README.md#customblockcallback)\>

Called for each custom block.

-----

**getFile**: (`path`: [`AbstractPath`](README.md#abstractpath)) => `Promise`\<[`File`](README.md#file) \| [`ContentData`](README.md#contentdata)\>

Called by the library when it needs a file.

-----

**getResource**: (`pathCx`: [`PathContext`](README.md#pathcontext), `options`: [`Options`](README.md#options)) => [`Resource`](README.md#resource)

Abstact resource handling
*(optional)*

-----

**loadModule?**: (`path`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<{}\>

Called when the lib requires a module. Do return `undefined` to let the library handle this.

-----

**log?**: (`type`: `string`, ...`data`: `any`[]) => `void`

Called by the library when there is somthing to log (eg. scripts compilation errors, template compilation errors, template compilation  tips, style compilation errors, ...)

-----

**processStyles**: (`srcRaw`: `string`, `lang`: `string`, `filename`: [`AbstractPath`](README.md#abstractpath), `options`: [`Options`](README.md#options)) => `Promise`\<`string`\>

-----

#### Defined in

[types.ts:139](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L139)

___

### <a id="pathcontext" name="pathcontext"></a> PathContext

Ƭ **PathContext**: `Object`

A PathContext represents a path (relPath) relative to an abolute path (refPath)
Note that relPath is not necessary relative, but when it is, relPath is relative to refPath.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `refPath` | [`AbstractPath`](README.md#abstractpath) \| `undefined` |
| `relPath` | [`AbstractPath`](README.md#abstractpath) |

**refPath**: [`AbstractPath`](README.md#abstractpath) \| `undefined`

reference path

-----

**relPath**: [`AbstractPath`](README.md#abstractpath)

relative to

**`Ref Path`**

-----

#### Defined in

[types.ts:41](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L41)

___

### <a id="pathresolve" name="pathresolve"></a> PathResolve

Ƭ **PathResolve**: (`pathCx`: [`PathContext`](README.md#pathcontext), `options`: [`Options`](README.md#options)) => [`AbstractPath`](README.md#abstractpath)

relative to absolute module path resolution

#### Type declaration

▸ (`pathCx`, `options`): [`AbstractPath`](README.md#abstractpath)

##### Parameters

| Name | Type |
| :------ | :------ |
| `pathCx` | [`PathContext`](README.md#pathcontext) |
| `options` | [`Options`](README.md#options) |

##### Returns

[`AbstractPath`](README.md#abstractpath)

#### Defined in

[types.ts:50](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L50)

___

### <a id="resource" name="resource"></a> Resource

Ƭ **Resource**: `Object`

Represents a resource.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `getContent` | () => `Promise`\<[`File`](README.md#file)\> |
| `id` | [`ModuleCacheId`](README.md#modulecacheid) |
| `path` | [`AbstractPath`](README.md#abstractpath) |

**getContent**: () => `Promise`\<[`File`](README.md#file)\>

asynchronously get the content of the resource. Once you got the content, you can asynchronously get the data through the getContentData(asBinary) method.

-----

**id**: [`ModuleCacheId`](README.md#modulecacheid)

'abstract' unique id of the resource.
This id is used as the key of the [[Options.moduleCache]]

-----

**path**: [`AbstractPath`](README.md#abstractpath)

file path of the resource

-----

#### Defined in

[types.ts:88](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/types.ts#L88)

## Variables

### <a id="version" name="version"></a> version

• `Const` **version**: `string`

the version of the library (process.env.VERSION is set by webpack, at compile-time)

#### Defined in

[index.ts:26](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/index.ts#L26)

___

### <a id="vueversion" name="vueversion"></a> vueVersion

• `Const` **vueVersion**: `string`

the version of Vue that is expected by the library

#### Defined in

[index.ts:32](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/index.ts#L32)

## Functions

### <a id="buildtemplateprocessor" name="buildtemplateprocessor"></a> buildTemplateProcessor

▸ **buildTemplateProcessor**(`processor`): `Object`

Convert a function to template processor interface (consolidate)

#### Parameters

| Name | Type |
| :------ | :------ |
| `processor` | [`LangProcessor`](README.md#langprocessor) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `render` | (`source`: `string`, `preprocessOptions`: `string`, `cb`: (`_err`: `any`, `_res`: `any`) => `void`) => `void` |

**render**: (`source`: `string`, `preprocessOptions`: `string`, `cb`: (`_err`: `any`, `_res`: `any`) => `void`) => `void`

\-

-----

#### Defined in

[index.ts:213](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/index.ts#L213)

___

### <a id="loadmodule" name="loadmodule"></a> loadModule

▸ **loadModule**(`path`, `options?`): `Promise`\<[`ModuleExport`](README.md#moduleexport)\>

This is the main function.
This function is intended to be used only to load the entry point of your application.
If for some reason you need to use it in your components, be sure to share at least the options.`moduleCache` object between all calls.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `path` | [`AbstractPath`](README.md#abstractpath) | The path of the `.vue` file. If path is not a path (eg. an string ID), your [[getFile]] function must return a [[File]] object. |
| `options` | [`Options`](README.md#options) | The options |

#### Returns

`Promise`\<[`ModuleExport`](README.md#moduleexport)\>

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

#### Defined in

[index.ts:171](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/212cf65/src/index.ts#L171)
