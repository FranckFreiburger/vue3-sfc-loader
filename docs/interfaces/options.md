> [Globals](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md) / Options

# Interface: Options

## Hierarchy

* **Options**

## Index

### Properties

* [additionalBabelPlugins](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#additionalbabelplugins)
* [additionalModuleHandlers](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#additionalmodulehandlers)
* [compiledCache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#compiledcache)
* [moduleCache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#modulecache)

### Methods

* [addStyle](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#addstyle)
* [getFile](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#getfile)
* [log](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md#log)

## Properties

### additionalBabelPlugins

• `Optional` **additionalBabelPlugins**: any[]

*Defined in [index.ts:58](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L58)*

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record\<string, [ModuleHandler](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/modulehandler.md)>

*Defined in [index.ts:59](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L59)*

___

### compiledCache

• `Optional` **compiledCache**: [Cache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/cache.md)

*Defined in [index.ts:60](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L60)*

___

### moduleCache

•  **moduleCache**: Record\<string, [Module](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/module.md)>

*Defined in [index.ts:55](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L55)*

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string): void

*Defined in [index.ts:57](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L57)*

#### Parameters:

Name | Type |
------ | ------ |
`style` | string |
`scopeId` | string |

**Returns:** void

___

### getFile

▸ **getFile**(`path`: string): Promise\<string>

*Defined in [index.ts:56](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L56)*

#### Parameters:

Name | Type |
------ | ------ |
`path` | string |

**Returns:** Promise\<string>

___

### log

▸ `Optional`**log**(`type`: string, ...`data`: any[]): void

*Defined in [index.ts:61](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L61)*

#### Parameters:

Name | Type |
------ | ------ |
`type` | string |
`...data` | any[] |

**Returns:** void
