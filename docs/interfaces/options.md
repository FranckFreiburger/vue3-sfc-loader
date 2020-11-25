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

*Defined in [index.ts:58](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L58)*

___

### additionalModuleHandlers

• `Optional` **additionalModuleHandlers**: Record\<string, [ModuleHandler](modulehandler.md)>

*Defined in [index.ts:59](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L59)*

___

### compiledCache

• `Optional` **compiledCache**: [Cache](cache.md)

*Defined in [index.ts:60](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L60)*

___

### moduleCache

•  **moduleCache**: Record\<string, [Module](module.md)>

*Defined in [index.ts:55](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L55)*

## Methods

### addStyle

▸ **addStyle**(`style`: string, `scopeId`: string): void

*Defined in [index.ts:57](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L57)*

#### Parameters:

Name | Type |
------ | ------ |
`style` | string |
`scopeId` | string |

**Returns:** void

___

### getFile

▸ **getFile**(`path`: string): Promise\<string>

*Defined in [index.ts:56](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L56)*

#### Parameters:

Name | Type |
------ | ------ |
`path` | string |

**Returns:** Promise\<string>

___

### log

▸ `Optional`**log**(`type`: string, ...`data`: any[]): void

*Defined in [index.ts:61](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/7a06fcc/src/index.ts#L61)*

#### Parameters:

Name | Type |
------ | ------ |
`type` | string |
`...data` | any[] |

**Returns:** void
