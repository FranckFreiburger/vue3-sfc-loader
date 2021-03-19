**[vue3-sfc-loader](README.md)**

> Globals

# vue3-sfc-loader

## Index

### Type aliases

* [Cache](README.md#cache)
* [CustomBlock](README.md#customblock)
* [CustomBlockCallback](README.md#customblockcallback)
* [File](README.md#file)
* [Module](README.md#module)
* [ModuleExport](README.md#moduleexport)
* [ModuleHandler](README.md#modulehandler)
* [Options](README.md#options)
* [PathContext](README.md#pathcontext)
* [PathHandlers](README.md#pathhandlers)
* [Resource](README.md#resource)

### Variables

* [version](README.md#version)
* [vueVersion](README.md#vueversion)

### Functions

* [createSFCModule](README.md#createsfcmodule)
* [defaultGetResource](README.md#defaultgetresource)
* [loadModule](README.md#loadmodule)
* [loadModuleInternal](README.md#loadmoduleinternal)

### Object literals

* [defaultPathHandlers](README.md#defaultpathhandlers)

## Type aliases

### Cache

Ƭ  **Cache**: { get: (key: string) => Promise<string\> ; set: (key: string, value: string) => Promise<void\>  }

*Defined in [types.ts:15](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L15)*

#### Type declaration:

Name | Type |
------ | ------ |
`get` | (key: string) => Promise<string\> |
`set` | (key: string, value: string) => Promise<void\> |

___

### CustomBlock

Ƭ  **CustomBlock**: { attrs: Record<string, string \| true\> ; content: string ; type: string  }

*Defined in [types.ts:95](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L95)*

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

*Defined in [types.ts:89](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L89)*

CustomBlockCallback function type

___

### File

Ƭ  **File**: { content: string \| ArrayBuffer ; extname: string  }

*Defined in [types.ts:66](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L66)*

Represents a file content and the extension name.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`content` | string \| ArrayBuffer | The content data |
`extname` | string | The content type (file extension name, eg. '.svg' ) |

___

### Module

Ƭ  **Module**: { exports: [ModuleExport](README.md#moduleexport)  }

*Defined in [types.ts:115](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L115)*

This just represents a loaded js module

#### Type declaration:

Name | Type |
------ | ------ |
`exports` | [ModuleExport](README.md#moduleexport) |

___

### ModuleExport

Ƭ  **ModuleExport**: {}

*Defined in [types.ts:109](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L109)*

This just represents a loaded js module exports

___

### ModuleHandler

Ƭ  **ModuleHandler**: (source: string, path: string, options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [types.ts:60](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L60)*

Used by the library when it does not know how to handle a given file type (eg. `.json` files).
see [moduleHandlers](README.md#modulehandlers)

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

Ƭ  **Options**: { additionalBabelPlugins?: any[] ; compiledCache?: [Cache](README.md#cache) ; delimiters?: [string, string] ; moduleCache?: Record<string, LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> ; moduleHandlers?: Record<string, [ModuleHandler](README.md#modulehandler)\> ; pathHandlers: [PathHandlers](README.md#pathhandlers) ; addStyle: (style: string, scopeId: string \| undefined) => void ; customBlockHandler?: (block: [CustomBlock](README.md#customblock), filename: string, options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> ; getFile: (path: string) => Promise<[File](README.md#file)\> ; getResource: (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) ; loadModule?: (path: string, options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> ; log?: (type: string, ...data: any[]) => void  }

*Defined in [types.ts:126](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L126)*

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`additionalBabelPlugins?` | any[] | Additional babel plugins. [TBD]   ```javascript   ...   ...  ```  |
`compiledCache?` | [Cache](README.md#cache) | [get](README.md#get)() and [set](README.md#set)() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`). Since compilation consume a lot of CPU, is is always a good idea to provide this object.  **example:**  In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB). Here we handle space limitation in a very basic way. Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/) ```javascript  ...  compiledCache: {   set(key, str) {     // naive storage space management    for (;;) {      try {       // doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage      window.localStorage.setItem(key, str);      break;     } catch(ex) {      // here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota       window.localStorage.removeItem(window.localStorage.key(0));     }    }   },   get(key) {     return window.localStorage.getItem(key);   },  },  ... ```  |
`delimiters?` | [string, string] | Sets the delimiters used for text interpolation within the template. Typically this is used to avoid conflicting with server-side frameworks that also use mustache syntax.   ```javascript   ...   <script>     // <!--    const vueContent = `     <template> Hello [[[[ who ]]]] !</template>     <script>     export default {      data() {       return {        who: 'world'       }      }     }     </script>    `;    // -->     const options = {     moduleCache: { vue: Vue },     getFile: () => vueContent,     addStyle: () => {},     delimiters: ['[[[[', ']]]]'],    }     const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options)));    app.mount(document.body);    </script>   ...  ```  |
`moduleCache?` | Record<string, LoadingType<[ModuleExport](README.md#moduleexport)\> \| [ModuleExport](README.md#moduleexport)\> | Initial cache that will contain resolved dependencies. All new modules go here. `vue` must initially be contained in this object. [moduleCache](README.md#modulecache) is mandatory for the lib. If you do not provide it, the library will create one. It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...). ​ * See also [[options.loadModule]].  **example:** ```javascript  ...  moduleCache: Object.assign(Object.create(null), {   vue: Vue,  }),  ... ```   |
`moduleHandlers?` | Record<string, [ModuleHandler](README.md#modulehandler)\> | Additional module type handlers. see [ModuleHandler](README.md#modulehandler) |
`pathHandlers` | [PathHandlers](README.md#pathhandlers) | Abstact path handling |
`addStyle` | (style: string, scopeId: string \| undefined) => void | - |
`customBlockHandler?` | (block: [CustomBlock](README.md#customblock), filename: string, options: [Options](README.md#options)) => Promise<[CustomBlockCallback](README.md#customblockcallback) \| undefined\> | - |
`getFile` | (path: string) => Promise<[File](README.md#file)\> | - |
`getResource` | (pathCx: [PathContext](README.md#pathcontext), options: [Options](README.md#options)) => [Resource](README.md#resource) | - |
`loadModule?` | (path: string, options: [Options](README.md#options)) => Promise<[ModuleExport](README.md#moduleexport) \| undefined\> | - |
`log?` | (type: string, ...data: any[]) => void | - |

___

### PathContext

Ƭ  **PathContext**: { refPath: string ; relPath: string  }

*Defined in [types.ts:25](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L25)*

A PathContext represents a path (relPath) relative to an abolute path (refPath)
Note that relPath is not necessary relative, but it is, relPath is relative to refPath.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`refPath` | string | reference path |
`relPath` | string | relative to @refPath |

___

### PathHandlers

Ƭ  **PathHandlers**: { extname: (filepath: string) => string ; resolve: (pathCx: [PathContext](README.md#pathcontext)) => string  }

*Defined in [types.ts:33](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L33)*

#### Type declaration:

Name | Type |
------ | ------ |
`extname` | (filepath: string) => string |
`resolve` | (pathCx: [PathContext](README.md#pathcontext)) => string |

___

### Resource

Ƭ  **Resource**: { getContent: () => Promise<[File](README.md#file)\> ; id: string ; path: string  }

*Defined in [types.ts:77](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/types.ts#L77)*

Represents a resource.

#### Type declaration:

Name | Type | Description |
------ | ------ | ------ |
`getContent` | () => Promise<[File](README.md#file)\> | asynchronously get the content of the resource |
`id` | string | 'abstract' unique id of the resource |
`path` | string | file path of the resource |

## Variables

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [tools.ts:42](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/tools.ts#L42)*

*Defined in [index.ts:11](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/index.ts#L11)*

the version of the library (process.env.VERSION is set by webpack, at compile-time)

___

### vueVersion

• `Const` **vueVersion**: string

*Defined in [createSFCModule.ts:4](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/createSFCModule.ts#L4)*

## Functions

### createSFCModule

▸ **createSFCModule**(`source`: string, `filename`: string, `options`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [createSFCModule.ts:3](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/createSFCModule.ts#L3)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`filename` | string |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>

___

### defaultGetResource

▸ **defaultGetResource**(`pathCx`: [PathContext](README.md#pathcontext), `options`: [Options](README.md#options)): [Resource](README.md#resource)

*Defined in [index.ts:58](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/index.ts#L58)*

#### Parameters:

Name | Type |
------ | ------ |
`pathCx` | [PathContext](README.md#pathcontext) |
`options` | [Options](README.md#options) |

**Returns:** [Resource](README.md#resource)

___

### loadModule

▸ **loadModule**(`path`: string, `options_?`: [Options](README.md#options)): Promise<[ModuleExport](README.md#moduleexport)\>

*Defined in [index.ts:111](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/index.ts#L111)*

This is the main function.
This function is intended to be used only to load the entry point of your application.
If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.

#### Parameters:

Name | Type | Default value | Description |
------ | ------ | ------ | ------ |
`path` | string | - | The path of the `.vue` file. If path is not a path (eg. an string ID), your [getFile](README.md#getfile) function must return a [File](README.md#file) object. |
`options_` | [Options](README.md#options) | throwNotDefined('options') | - |

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

*Defined in [tools.ts:242](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/tools.ts#L242)*

#### Parameters:

Name | Type |
------ | ------ |
`pathCx` | [PathContext](README.md#pathcontext) |
`options` | [Options](README.md#options) |

**Returns:** Promise<[ModuleExport](README.md#moduleexport)\>

## Object literals

### defaultPathHandlers

▪ `Const` **defaultPathHandlers**: object

*Defined in [index.ts:43](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/893f1d4/src/index.ts#L43)*

Default implementation of PathHandlers

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`extname` | function | (filepath: string) => string |
`resolve` | function | (\_\_namedParameters: { refPath: string ; relPath: string  }) => string |
