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
* [delimiters](options.md#delimiters)
* [moduleCache](options.md#modulecache)
* [pathHandlers](options.md#pathhandlers)

### Methods

* [addStyle](options.md#addstyle)
* [customBlockHandler](options.md#customblockhandler)
* [getFile](options.md#getfile)
* [loadModule](options.md#loadmodule)
* [log](options.md#log)

## Properties

### additionalBabelPlugins

• `Optional` **additionalBabelPlugins**: any[]

*Defined in [types.ts:215](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L215)*

Additional babel plugins. [TBD]

	```javascript
		...
		...
	```

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record<string, [ModuleHandler](modulehandler.md)\>

*Defined in [types.ts:222](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L222)*

Additional module type handlers. see [ModuleHandler](modulehandler.md)

___

### compiledCache

• `Optional` **compiledCache**: [Cache](cache.md)

*Defined in [types.ts:262](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L262)*

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

### delimiters

• `Optional` **delimiters**: [string, string]

*Defined in [types.ts:204](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L204)*

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

___

### moduleCache

• `Optional` **moduleCache**: Record<string, [Module](module.md)\>

*Defined in [types.ts:121](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L121)*

Initial cache that will contain resolved dependencies. All new modules go here.
`vue` must initially be contained in this object.
[moduleCache](options.md#modulecache) is mandatory for the lib. If you do not provide it, the library will create one.
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

___

### pathHandlers

•  **pathHandlers**: [PathHandlers](pathhandlers.md)

*Defined in [types.ts:308](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L308)*

Abstact path handling

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string \| undefined): void

*Defined in [types.ts:164](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L164)*

Called by the library when CSS style must be added in the HTML document.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`style` | string | The CSS style chunk |
`scopeId` | string \| undefined | The scope ID of the CSS style chunk |

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

### customBlockHandler

▸ `Optional`**customBlockHandler**(`block`: [CustomBlock](customblock.md), `filename`: string, `options`: [Options](options.md)): Promise<[CustomBlockCallback](../README.md#customblockcallback) \| undefined\>

*Defined in [types.ts:330](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L330)*

Called for each custom block.

#### Parameters:

Name | Type |
------ | ------ |
`block` | [CustomBlock](customblock.md) |
`filename` | string |
`options` | [Options](options.md) |

**Returns:** Promise<[CustomBlockCallback](../README.md#customblockcallback) \| undefined\>

A Promise of the module or undefined

```javascript
	...
	customBlockHandler(block, filename, options) {

		if ( block.type !== 'i18n' )
			 return;

		return (component) => {

			component.i18n = JSON.parse(block.content);
		}
	}
	...
```

___

### getFile

▸ **getFile**(`path`: string): Promise<[File](file.md)\>

*Defined in [types.ts:142](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L142)*

Called by the library when it needs a file.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`path` | string | The path of the file |

**Returns:** Promise<[File](file.md)\>

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

*Defined in [types.ts:301](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L301)*

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

*Defined in [types.ts:280](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/d3200d4/src/types.ts#L280)*

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
