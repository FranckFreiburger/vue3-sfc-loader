**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Type aliases

* [AbstractPath](README.md#abstractpath)
* [Cache](README.md#cache)
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

## Type aliases

### AbstractPath

Ƭ  **AbstractPath**: { toString: () => string  }

*Defined in [types.ts:24](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L24)*

#### Type declaration:

Name | Type |
------ | ------ |
`toString` | () => string |

___

### Cache

Ƭ  **Cache**: { get: (key: string) => Promise<string\> ; set: (key: string, value: string) => Promise<void\>  }

*Defined in [types.ts:15](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L15)*

#### Type declaration:

Name | Type |
------ | ------ |
`get` | (key: string) => Promise<string\> |
`set` | (key: string, value: string) => Promise<void\> |

___

### CustomBlock

Ƭ  **CustomBlock**: { attrs: Record<string, string \| true\> ; content: string ; type: string  }

*Defined in [types.ts:101](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L101)*

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

*Defined in [types.ts:95](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L95)*

CustomBlockCallback function type

___

### File

Ƭ  **File**: { content: string \| ArrayBuffer ; type: string  }

*Defined in [types.ts:69](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L69)*

Represents a file content and the extension name.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`content` | string \| ArrayBuffer | The content data |
`type` | string | The content type (file extension name, eg. '.svg' ) |

___

### LangProcessor

Ƭ  **LangProcessor**: (source: string, preprocessOptions?: any) => Promise<string\> \| string

*Defined in [types.ts:374](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L374)*

___

### Module

Ƭ  **Module**: { exports: [ModuleExport](README.md#moduleexport)  }

*Defined in [types.ts:121](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L121)*

This just represents a loaded js module

#### Type declaration:

Name | Type |
------ | ------ |
`exports` | [ModuleExport](README.md#moduleexport) |

___

### ModuleCacheId

Ƭ  **ModuleCacheId**: string

*Defined in [types.ts:21](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L21)*

___

### ModuleExport

Ƭ  **ModuleExport**: {}

*Defined in [types.ts:115](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L115)*

This just represents a loaded js module exports

___

### ModuleHandler

Ƭ  **ModuleHandler**: (type: string, source: string, path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| null\>

*Defined in [types.ts:63](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L63)*

Used by the library when it does not know how to handle a given file type (eg. `.json` files).
see [[moduleHandlers]]

**`param`** The content of the file

**`param`** The path of the file

**`param`** The options

**example:**

```javascript
	...
	moduleHandlers: {
		'.json': (source, path, options) => JSON.parse(source),
	}
	...
```

___

### Options

Ƭ  **Options**: { additionalBabelPlugins?: Record<string, any\> ; compiledCache?: [Cache](README.md#cache) ; delimiters?: [string, string] ; handleModule?: [ModuleHandler](README.md#modulehandler) ; moduleCache?: Record<[ModuleCacheId](README.md#modulecacheid), LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> ; pathResolve: [PathResolve](README.md#pathresolve) ; addStyle: (style: string, scopeId: string \| undefined) => void ; customBlockHandler?: (block: [CustomBlock](README.md#customblock), filename: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> ; getFile: (path: [AbstractPath](README.md#abstractpath)) => Promise<[File](README.md#file)\> ; getResource: (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) ; loadModule?: (path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> ; log?: (type: string, ...data: any[]) => void  }

*Defined in [types.ts:132](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L132)*

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`additionalBabelPlugins?` | Record<string, any\> | Additional babel plugins. [TBD]   ```javascript   ...   ...  ```  |
`compiledCache?` | [Cache](README.md#cache) | [get](README.md#get)() and [set](README.md#set)() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`). Since compilation consume a lot of CPU, is is always a good idea to provide this object.  **example:**  In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB). Here we handle space limitation in a very basic way. Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/) ```javascript  ...  compiledCache: {   set(key, str) {     // naive storage space management    for (;;) {      try {       // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage      window.localStorage.setItem(key, str);      break;     } catch(ex) {      // here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota       window.localStorage.removeItem(window.localStorage.key(0));     }    }   },   get(key) {     return window.localStorage.getItem(key);   },  },  ... ```  |
`delimiters?` | [string, string] | Sets the delimiters used for text interpolation within the template. Typically this is used to avoid conflicting with server-side frameworks that also use mustache syntax.   ```javascript   ...   <script>     // <!--    const vueContent = `     <template> Hello [[[[ who ]]]] !</template>     <script>     export default {      data() {       return {        who: 'world'       }      }     }     </script>    `;    // -->     const options = {     moduleCache: { vue: Vue },     getFile: () => vueContent,     addStyle: () => {},     delimiters: ['[[[[', ']]]]'],    }     const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options)));    app.mount(document.body);    </script>   ...  ```  |
`handleModule?` | [ModuleHandler](README.md#modulehandler) | Handle additional module types (eg. '.svg', '.json' ). see [ModuleHandler](README.md#modulehandler) |
`moduleCache?` | Record<[ModuleCacheId](README.md#modulecacheid), LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> | Initial cache that will contain resolved dependencies. All new modules go here. `vue` must initially be contained in this object. [moduleCache](README.md#modulecache) is mandatory for the lib. If you do not provide it, the library will create one. It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...). ​ * See also [[options.loadModule]].  **example:** ```javascript  ...  moduleCache: Object.assign(Object.create(null), {   vue: Vue,  }),  ... ```   |
`pathResolve` | [PathResolve](README.md#pathresolve) | Abstact path handling |
`addStyle` | (style: string, scopeId: string \| undefined) => void | - |
`customBlockHandler?` | (block: [CustomBlock](README.md#customblock), filename: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> | - |
`getFile` | (path: [AbstractPath](README.md#abstractpath)) => Promise<[File](README.md#file)\> | - |
`getResource` | (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) | - |
`loadModule?` | (path: [AbstractPath](README.md#abstractpath), options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> | - |
`log?` | (type: string, ...data: any[]) => void | - |

___

### PathContext

Ƭ  **PathContext**: { refPath: [AbstractPath](README.md#abstractpath) ; relPath: [AbstractPath](README.md#abstractpath)  }

*Defined in [types.ts:33](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L33)*

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

*Defined in [types.ts:42](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L42)*

relative to absolute module path resolution

___

### Resource

Ƭ  **Resource**: { getContent: () => Promise<[File](README.md#file)\> ; id: [ModuleCacheId](README.md#modulecacheid) ; path: [AbstractPath](README.md#abstractpath)  }

*Defined in [types.ts:80](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/types.ts#L80)*

Represents a resource.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`getContent` | () => Promise<[File](README.md#file)\> | asynchronously get the content of the resource |
`id` | [ModuleCacheId](README.md#modulecacheid) | 'abstract' unique id of the resource. This id is used as the key of the [[Options.moduleCache]] |
`path` | [AbstractPath](README.md#abstractpath) | file path of the resource |

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [tools.ts:53](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/tools.ts#L53)*

*Defined in [index.ts:24](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/index.ts#L24)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

___

### vueVersion

• `Const` **vueVersion**: string

*Defined in [createSFCModule.ts:4](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/createSFCModule.ts#L4)*

## Functions

### buildTemplateProcessor

▸ **buildTemplateProcessor**(`processor`: [LangProcessor](README.md#langprocessor)): object

*Defined in [index.ts:157](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/index.ts#L157)*

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

*Defined in [createSFCModule.ts:3](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/createSFCModule.ts#L3)*

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

*Defined in [index.ts:73](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/index.ts#L73)*

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

▸ **defaultHandleModule**(`type`: string, `source`: string, `path`: [AbstractPath](README.md#abstractpath), `options`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport) \| null\>

*Defined in [tools.ts:377](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/tools.ts#L377)*

Default implementation of handleModule

#### Parameters:

Name | Type |
------ | ------ |
`type` | string |
`source` | string |
`path` | [AbstractPath](README.md#abstractpath) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport) \| null\>

___

### defaultPathResolve

▸ `Const`**defaultPathResolve**(`__namedParameters`: { refPath: [AbstractPath](README.md#abstractpath) ; relPath: [AbstractPath](README.md#abstractpath)  }): string \| [AbstractPath](README.md#abstractpath)

*Defined in [index.ts:50](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/index.ts#L50)*

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

*Defined in [index.ts:130](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/index.ts#L130)*

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

*Defined in [tools.ts:262](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/23ba651/src/tools.ts#L262)*

#### Parameters:

Name | Type |
------ | ------ |
`pathCx` | [PathContext](README.md#pathcontext) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>
