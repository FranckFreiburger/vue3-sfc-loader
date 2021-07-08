**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Type aliases

* [AbstractPath](README.md#abstractpath)
* [Cache](README.md#cache)
* [ContentData](README.md#contentdata)
* [CustomBlock](README.md#customblock)
* [CustomBlockCallback](README.md#customblockcallback)
* [File](README.md#file)
* [LangProcessor](README.md#langprocessor)
* [Module](README.md#module)
* [ModuleCacheId](README.md#modulecacheid)
* [ModuleExport](README.md#moduleexport)
* [ModuleHandler](README.md#modulehandler)
* [Options](README.md#options)
* [PathContext](README.md#pathcontext)
* [PathResolve](README.md#pathresolve)
* [Resource](README.md#resource)

### Variables

* [version](README.md#version)
* [vueVersion](README.md#vueversion)

### Functions

* [buildTemplateProcessor](README.md#buildtemplateprocessor)
* [createSFCModule](README.md#createsfcmodule)
* [defaultGetResource](README.md#defaultgetresource)
* [defaultHandleModule](README.md#defaulthandlemodule)
* [defaultPathResolve](README.md#defaultpathresolve)
* [loadModule](README.md#loadmodule)
* [loadModuleInternal](README.md#loadmoduleinternal)

### Object literals

* [targetBrowserBabelPlugins](README.md#targetbrowserbabelplugins)

## Type aliases

### AbstractPath

Ƭ  **AbstractPath**: { toString: () => string  }

*Defined in [types.ts:32](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L32)*

An abstract way to specify a path. It could be a simple string or a object like an URL. An AbstractPath must always be convertible to a string.

#### Type declaration:

Name | Type |
------ | ------ |
`toString` | () => string |

___

### Cache

Ƭ  **Cache**: { get: (key: string) => Promise<string\> ; set: (key: string, value: string) => Promise<void\>  }

*Defined in [types.ts:20](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L20)*

#### Type declaration:

Name | Type |
------ | ------ |
`get` | (key: string) => Promise<string\> |
`set` | (key: string, value: string) => Promise<void\> |

___

### ContentData

Ƭ  **ContentData**: string \| ArrayBuffer

*Defined in [types.ts:71](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L71)*

___

### CustomBlock

Ƭ  **CustomBlock**: { attrs: Record<string, string \| true\> ; content: string ; type: string  }

*Defined in [types.ts:109](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L109)*

A custom block

#### Type declaration:

Name | Type |
------ | ------ |
`attrs` | Record<string, string \| true\> |
`content` | string |
`type` | string |

___

### CustomBlockCallback

Ƭ  **CustomBlockCallback**: (component: [ModuleExport](README.md#moduleexport)) => void

*Defined in [types.ts:103](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L103)*

CustomBlockCallback function type

___

### File

Ƭ  **File**: { getContentData: (asBinary: Boolean) => Promise<[ContentData](README.md#contentdata)\> ; type: string  }

*Defined in [types.ts:77](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L77)*

Represents a file content and the extension name.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`getContentData` | (asBinary: Boolean) => Promise<[ContentData](README.md#contentdata)\> | The content data accessor (request data as text of binary) |
`type` | string | The content type (file extension name, eg. '.svg' ) |

___

### LangProcessor

Ƭ  **LangProcessor**: (source: string, preprocessOptions?: any) => Promise<string\> \| string

*Defined in [types.ts:399](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L399)*

___

### Module

Ƭ  **Module**: { exports: [ModuleExport](README.md#moduleexport)  }

*Defined in [types.ts:129](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L129)*

This just represents a loaded js module

#### Type declaration:

Name | Type |
------ | ------ |
`exports` | [ModuleExport](README.md#moduleexport) |

___

### ModuleCacheId

Ƭ  **ModuleCacheId**: string

*Defined in [types.ts:26](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L26)*

___

### ModuleExport

Ƭ  **ModuleExport**: {}

*Defined in [types.ts:123](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L123)*

This just represents a loaded js module exports

___

### ModuleHandler

Ƭ  **ModuleHandler**: (type: string, getContentData: File[\"getContentData\"], path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| null\>

*Defined in [types.ts:68](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L68)*

Used by the library when it needs to handle a does not know how to handle a given file type (eg. `.json` files).

**`param`** The type of the file. It can be anything, but must be '.vue', '.js' or '.mjs' for vue, js and esm files.

**`param`** The method to get the content data of a file (text or binary). see [[ File['getContentData'] ]]

**`param`** The path of the file

**`param`** The options

**example:**

```javascript
	...
	...
```

___

### Options

Ƭ  **Options**: { additionalBabelParserPlugins?: babel\_ParserPlugin[] ; additionalBabelPlugins?: Record<string, any\> ; compiledCache?: [Cache](README.md#cache) ; delimiters?: [string, string] ; handleModule?: [ModuleHandler](README.md#modulehandler) ; moduleCache: Record<[ModuleCacheId](README.md#modulecacheid), LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> ; pathResolve: [PathResolve](README.md#pathresolve) ; addStyle: (style: string, scopeId: string \| undefined) => void ; customBlockHandler?: (block: [CustomBlock](README.md#customblock), filename: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> ; getFile: (path: [AbstractPath](README.md#abstractpath)) => Promise<[File](README.md#file) \| [ContentData](README.md#contentdata)\> ; getResource: (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) ; loadModule?: (path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> ; log?: (type: string, ...data: any[]) => void  }

*Defined in [types.ts:140](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L140)*

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`additionalBabelParserPlugins?` | babel\_ParserPlugin[] | Additional babel parser plugins. [TBD]   ```javascript   ...   ...  ```  |
`additionalBabelPlugins?` | Record<string, any\> | Additional babel plugins. [TBD]   ```javascript   ...   ...  ```  |
`compiledCache?` | [Cache](README.md#cache) | [get](README.md#get)() and [set](README.md#set)() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`). Since compilation consume a lot of CPU, is is always a good idea to provide this object.  **example:**  In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB). Here we handle space limitation in a very basic way. Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/) ```javascript  ...  compiledCache: {   set(key, str) {     // naive storage space management    for (;;) {      try {       // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage      window.localStorage.setItem(key, str);      break;     } catch(ex) {      // here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota       window.localStorage.removeItem(window.localStorage.key(0));     }    }   },   get(key) {     return window.localStorage.getItem(key);   },  },  ... ```  |
`delimiters?` | [string, string] | Sets the delimiters used for text interpolation within the template. Typically this is used to avoid conflicting with server-side frameworks that also use mustache syntax.   ```javascript   ...   <script>     // <!--    const vueContent = `     <template> Hello [[[[ who ]]]] !</template>     <script>     export default {      data() {       return {        who: 'world'       }      }     }     </script>    `;    // -->     const options = {     moduleCache: { vue: Vue },     getFile: () => vueContent,     addStyle: () => {},     delimiters: ['[[[[', ']]]]'],    }     const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options)));    app.mount(document.body);    </script>   ...  ```  |
`handleModule?` | [ModuleHandler](README.md#modulehandler) | Handle additional module types (eg. '.svg', '.json' ). see [ModuleHandler](README.md#modulehandler) |
`moduleCache` | Record<[ModuleCacheId](README.md#modulecacheid), LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> | Initial cache that will contain resolved dependencies. All new modules go here. `vue` must initially be contained in this object. [moduleCache](README.md#modulecache) is mandatory and should be shared between options objects used for you application (note that you can also pass the same options object through multiple loadModule calls) It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...). ​ * See also [[options.loadModule]].  **example:** ```javascript  ...  moduleCache: Object.assign(Object.create(null), {   vue: Vue,  }),  ... ```   |
`pathResolve` | [PathResolve](README.md#pathresolve) | Abstact path handling |
`addStyle` | (style: string, scopeId: string \| undefined) => void | - |
`customBlockHandler?` | (block: [CustomBlock](README.md#customblock), filename: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> | - |
`getFile` | (path: [AbstractPath](README.md#abstractpath)) => Promise<[File](README.md#file) \| [ContentData](README.md#contentdata)\> | - |
`getResource` | (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) | - |
`loadModule?` | (path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> | - |
`log?` | (type: string, ...data: any[]) => void | - |

___

### PathContext

Ƭ  **PathContext**: { refPath: [AbstractPath](README.md#abstractpath) ; relPath: [AbstractPath](README.md#abstractpath)  }

*Defined in [types.ts:41](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L41)*

A PathContext represents a path (relPath) relative to an abolute path (refPath)
Note that relPath is not necessary relative, but it is, relPath is relative to refPath.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`refPath` | [AbstractPath](README.md#abstractpath) | reference path |
`relPath` | [AbstractPath](README.md#abstractpath) | relative to @refPath |

___

### PathResolve

Ƭ  **PathResolve**: (pathCx: [PathContext](README.md#pathcontext)) => [AbstractPath](README.md#abstractpath)

*Defined in [types.ts:50](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L50)*

relative to absolute module path resolution

___

### Resource

Ƭ  **Resource**: { getContent: () => Promise<[File](README.md#file)\> ; id: [ModuleCacheId](README.md#modulecacheid) ; path: [AbstractPath](README.md#abstractpath)  }

*Defined in [types.ts:88](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/types.ts#L88)*

Represents a resource.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`getContent` | () => Promise<[File](README.md#file)\> | asynchronously get the content of the resource. Once you got the content, you can asynchronously get the data through the getContentData(asBinary) method. |
`id` | [ModuleCacheId](README.md#modulecacheid) | 'abstract' unique id of the resource. This id is used as the key of the [[Options.moduleCache]] |
`path` | [AbstractPath](README.md#abstractpath) | file path of the resource |

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [tools.ts:47](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/tools.ts#L47)*

*Defined in [index.ts:26](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/index.ts#L26)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

___

### vueVersion

• `Const` **vueVersion**: string

*Defined in [createSFCModule.ts:4](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/createSFCModule.ts#L4)*

## Functions

### buildTemplateProcessor

▸ **buildTemplateProcessor**(`processor`: [LangProcessor](README.md#langprocessor)): object

*Defined in [index.ts:179](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/index.ts#L179)*

Convert a function to template processor interface (consolidate)

#### Parameters:

Name | Type |
------ | ------ |
`processor` | [LangProcessor](README.md#langprocessor) |

**Returns:** object

Name | Type |
------ | ------ |
`render` | (source: string, preprocessOptions: string, cb: (\_err: any, \_res: any) => void) => void |

___

### createSFCModule

▸ **createSFCModule**(`source`: string, `filename`: [AbstractPath](README.md#abstractpath), `options`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [createSFCModule.ts:3](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/createSFCModule.ts#L3)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`filename` | [AbstractPath](README.md#abstractpath) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>

___

### defaultGetResource

▸ **defaultGetResource**(`pathCx`: [PathContext](README.md#pathcontext), `options`: [Options](README.md#options)): [Resource](README.md#resource)

*Defined in [index.ts:76](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/index.ts#L76)*

Default getResource implementation
by default, getContent() use the file extension as file type.

#### Parameters:

Name | Type |
------ | ------ |
`pathCx` | [PathContext](README.md#pathcontext) |
`options` | [Options](README.md#options) |

**Returns:** [Resource](README.md#resource)

___

### defaultHandleModule

▸ **defaultHandleModule**(`type`: string, `getContentData`: File[\"getContentData\"], `path`: [AbstractPath](README.md#abstractpath), `options`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport) \| null\>

*Defined in [tools.ts:370](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/tools.ts#L370)*

Default implementation of handleModule

#### Parameters:

Name | Type |
------ | ------ |
`type` | string |
`getContentData` | File[\"getContentData\"] |
`path` | [AbstractPath](README.md#abstractpath) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport) \| null\>

___

### defaultPathResolve

▸ `Const`**defaultPathResolve**(`__namedParameters`: { refPath: [AbstractPath](README.md#abstractpath) ; relPath: [AbstractPath](README.md#abstractpath)  }): string \| [AbstractPath](README.md#abstractpath)

*Defined in [index.ts:53](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/index.ts#L53)*

Default resolve implementation
resolve() should handle 3 situations :
 - resolve a relative path ( eg. import './details.vue' )
 - resolve an absolute path ( eg. import '/components/card.vue' )
 - resolve a module name ( eg. import { format } from 'date-fns' )

#### Parameters:

Name | Type |
------ | ------ |
`__namedParameters` | { refPath: [AbstractPath](README.md#abstractpath) ; relPath: [AbstractPath](README.md#abstractpath)  } |

**Returns:** string \| [AbstractPath](README.md#abstractpath)

___

### loadModule

▸ **loadModule**(`path`: [AbstractPath](README.md#abstractpath), `options?`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [index.ts:152](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/index.ts#L152)*

This is the main function.
This function is intended to be used only to load the entry point of your application.
If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | [AbstractPath](README.md#abstractpath) | - | The path of the `.vue` file. If path is not a path (eg. an string ID), your [getFile](README.md#getfile) function must return a [File](README.md#file) object. |
`options` | [Options](README.md#options) | throwNotDefined('options') | The options |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>

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

___

### loadModuleInternal

▸ **loadModuleInternal**(`pathCx`: [PathContext](README.md#pathcontext), `options`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [tools.ts:258](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/tools.ts#L258)*

#### Parameters:

Name | Type |
------ | ------ |
`pathCx` | [PathContext](README.md#pathcontext) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>

## Object literals

### targetBrowserBabelPlugins

▪ `Const` **targetBrowserBabelPlugins**: object

*Defined in [tools.ts:205](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/4211825/src/tools.ts#L205)*

#### Properties:
