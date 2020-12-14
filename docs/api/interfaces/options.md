**[vue3-sfc-loader](../README.md)**

> [Globals](../README.md) / Options

# Interface: Options

## Hierarchy

* **Options**

## Index

### Properties

* [additionalBabelPlugins](options.md#additionalbabelplugins)
* [additionalModuleHandlers](options.md#additionalmodulehandlers)
* [compiledCache](options.md#compiledcache)
* [moduleCache](options.md#modulecache)

### Methods

* [addStyle](options.md#addstyle)
* [getFile](options.md#getfile)
* [loadModule](options.md#loadmodule)
* [log](options.md#log)

## Properties

### additionalBabelPlugins

• `Optional` **additionalBabelPlugins**: any[]

*Defined in [index.ts:153](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L153)*

Additional babel plugins. [TBD]

	```javascript
		...
		...
	```

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record<string, [ModuleHandler](modulehandler.md)\>

*Defined in [index.ts:160](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L160)*

Additional module type handlers. see [ModuleHandler](modulehandler.md)

___

### compiledCache

• `Optional` **compiledCache**: [Cache](cache.md)

*Defined in [index.ts:200](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L200)*

[get](cache.md#get)() and [set](cache.md#set)() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`).
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

___

### moduleCache

• `Optional` **moduleCache**: Record<string, [Module](module.md)\>

*Defined in [index.ts:99](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L99)*

Initial cache that will contain resolved dependencies. All new modules go here.
`vue` must initially be contained in this object.
[moduleCache](options.md#modulecache) is mandatory for the lib but optional for you. If you do not provide it, the lib will automatically add it to the [[options]] object.
It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...).
​ *
See also [[options.loadModule]].

**example:**
```javascript
	...
	moduleCache: Object.assign(Object.create(null), {
		vue: Vue,
	}),
	...
```

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string): void

*Defined in [index.ts:142](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L142)*

Called by the library when CSS style must be added in the HTML document.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`style` | string | The CSS style chunk |
`scopeId` | string | The scope ID of the CSS style chunk |

**Returns:** void

**example:**
```javascript
	...
	addStyle(styleStr) {

		const style = document.createElement('style');
		style.textContent = styleStr;
		const ref = document.head.getElementsByTagName('style')[0] || null;
		document.head.insertBefore(style, ref);
	},
	...
```

___

### getFile

▸ **getFile**(`path`: string): Promise<[File](../README.md#file)\>

*Defined in [index.ts:120](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L120)*

Called by the library when it needs a file.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the file |

**Returns:** Promise<[File](../README.md#file)\>

a Promise of the file content (UTF-8)

**example:**
```javascript
	...
	async getFile(url) {

		const res = await fetch(url);
		if ( !res.ok )
			throw Object.assign(new Error(url+' '+res.statusText), { res });
		return await res.text();
	},
	...
```

___

### loadModule

▸ `Optional`**loadModule**(`path`: string, `options`: [Options](options.md)): Promise<[Module](module.md) \| undefined\>

*Defined in [index.ts:239](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L239)*

Called when the lib requires a module. Do return `undefined` to let the library handle this.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the module. |
`options` | [Options](options.md) | The options object. |

**Returns:** Promise<[Module](module.md) \| undefined\>

A Promise of the module or undefined

[moduleCache](options.md#modulecache) and [Options.loadModule](options.md#loadmodule) are strongly related, in the sense that the result of [[options.loadModule]] is stored in [moduleCache](options.md#modulecache).
However, [[options.loadModule]] is asynchronous and may help you to handle modules or components that are conditionally required (optional features, current languages, plugins, ...).
```javascript
	...
	loadModule(path, options) {

		if ( path === 'vue' )
			return Vue;
		},
	...
```

___

### log

▸ `Optional`**log**(`type`: string, ...`data`: any[]): void

*Defined in [index.ts:218](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/bd3838c/src/index.ts#L218)*

Called by the library when there is somthing to log (eg. scripts compilation errors, template compilation errors, template compilation  tips, style compilation errors, ...)

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`type` | string | the type of the notification, it respects console property names (error, warn, info). |
`...data` | any[] | - |

**Returns:** void

```javascript
	...
	log(type, ...args) {

		console.log(type, ...args);
	},
	...
```
