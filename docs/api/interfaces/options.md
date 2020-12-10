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

*Defined in [index.ts:146](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L146)*

Additional babel plugins. [TBD]

	```javascript
		...
		...
	```

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record<string, [ModuleHandler](modulehandler.md)\>

*Defined in [index.ts:153](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L153)*

Additional module type handlers. see [ModuleHandler](modulehandler.md)

___

### compiledCache

• `Optional` **compiledCache**: [Cache](cache.md)

*Defined in [index.ts:193](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L193)*

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

*Defined in [index.ts:95](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L95)*

Initial cache that will contain resolved dependencies. All new modules go here.
`vue` must initially be contained in this object.

**example:**
```javascript
	...
	moduleCache: {
		vue: Vue,
	},
	...
```

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string): void

*Defined in [index.ts:135](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L135)*

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

*Defined in [index.ts:113](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L113)*

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
	getFile(url) {

		return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
	},
	...
```

___

### loadModule

▸ `Optional`**loadModule**(`path`: string, `options`: [Options](options.md)): Promise<[Module](module.md) \| undefined\>

*Defined in [index.ts:230](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L230)*

Called when the lib requires a module. Do return `undefined` to let the library handle this.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the module. |
`options` | [Options](options.md) | The options object. |

**Returns:** Promise<[Module](module.md) \| undefined\>

A Promise of the module or undefined

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

*Defined in [index.ts:211](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/547328e/src/index.ts#L211)*

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
