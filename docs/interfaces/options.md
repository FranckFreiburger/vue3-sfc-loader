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
* [log](options.md#log)

## Properties

### additionalBabelPlugins

• `Optional` **additionalBabelPlugins**: any[]

*Defined in [index.ts:134](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L134)*

Additional babel plugins

	```javascript
		...
		...
	```

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record\<string, [ModuleHandler](modulehandler.md)>

*Defined in [index.ts:149](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L149)*

Additional module type handlers

```javascript
	...
	additionalModuleHandlers: {
		'.json': (source, path, options) => JSON.parse(source),
	}
	...
```

___

### compiledCache

• `Optional` **compiledCache**: [Cache](cache.md)

*Defined in [index.ts:186](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L186)*

Functions of this object are called when tle lib need to save or load already compiled code. [get](cache.md#get)() and [set](cache.md#set)() functions must return a `Promise`, or can be `async`.
Since compilation consume a lot of CPU, is is always a good idea to provide this object.

**example:**
In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place, here we handle this in a very basic way.
Maybe (not tested), the following lib may help you [pako](https://github.com/nodeca/pako)
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
				} catch(ex) { // handle: Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota

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

•  **moduleCache**: Record\<string, Module>

*Defined in [index.ts:84](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L84)*

Initial cache that will contain resolved dependencies.
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

*Defined in [index.ts:123](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L123)*

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

▸ **getFile**(`path`: string): Promise\<string>

*Defined in [index.ts:101](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L101)*

Called by the library when it needs a file.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the file |

**Returns:** Promise\<string>

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

### log

▸ `Optional`**log**(`type`: string, ...`data`: any[]): void

*Defined in [index.ts:204](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d64851e/src/index.ts#L204)*

Called by the library when there is somthing to log (eg. )

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`type` | string | the type of the notification |
`...data` | any[] | - |

**Returns:** void

```javascript
	...
	log(type, ...args) {

		console.log(type, ...args);
	},
	...
```
