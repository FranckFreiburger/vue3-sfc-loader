> [Globals](../globals.md) / Options

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

*Defined in [index.ts:116](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L116)*

TBD

```javascript
	...
additionalModuleHandlers: {
		'.json': (source, path, options) => JSON.parse(source),
	}
...
```

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record\<string, [ModuleHandler](modulehandler.md)>

*Defined in [index.ts:130](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L130)*

TBD

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

*Defined in [index.ts:166](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L166)*

Functions of this object are called when tle lib need to save or load already compiled code. [get](cache.md#get)() and [set](cache.md#set)() functions must return a `Promise`, or can be `async`.
Since compilation consume a lot of CPU, is is always a good idea to provide this object.

* example: *
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

*Defined in [index.ts:76](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L76)*

TBD

```javascript
	...

...
```

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string): void

*Defined in [index.ts:102](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L102)*

TBD

```javascript
	...

...
```

#### Parameters:

Name | Type |
------ | ------ |
`style` | string |
`scopeId` | string |

**Returns:** void

___

### getFile

▸ **getFile**(`path`: string): Promise\<string>

*Defined in [index.ts:89](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L89)*

TBD

```javascript
	...

...
```

#### Parameters:

Name | Type |
------ | ------ |
`path` | string |

**Returns:** Promise\<string>

___

### log

▸ `Optional`**log**(`type`: string, ...`data`: any[]): void

*Defined in [index.ts:181](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/a9f0d3d/src/index.ts#L181)*

Specify this function Allow to cache compiled code. [get](cache.md#get)() and [set](cache.md#set)() functions must return a `Promise`, or can be `async`.
* example: *
In the following example, we cache the code in the browser's local storage.
```javascript
	...
	log(type, ...args) {

		console.log(type, ...args);
	},
	...
```

#### Parameters:

Name | Type |
------ | ------ |
`type` | string |
`...data` | any[] |

**Returns:** void
