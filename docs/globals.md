> Globals

# vue3-sfc-loader

## Index

### Interfaces

* [Cache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/cache.md)
* [Module](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/module.md)
* [ModuleHandler](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/modulehandler.md)
* [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)
* [ValueFactory](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/valuefactory.md)
* [ValueFactoryApi](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/valuefactoryapi.md)

### Type aliases

* [PreprocessLang](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#preprocesslang)

### Variables

* [genSourcemap](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#gensourcemap)
* [version](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#version)

### Functions

* [createJSModule](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#createjsmodule)
* [createModule](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#createmodule)
* [createSFCModule](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#createsfcmodule)
* [hash](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#hash)
* [interopRequireDefault](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#interoprequiredefault)
* [loadDeps](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#loaddeps)
* [loadModule](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#loadmodule)
* [parseDeps](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#parsedeps)
* [renameDynamicImport](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#renamedynamicimport)
* [resolvePath](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#resolvepath)
* [transformJSCode](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#transformjscode)
* [withCache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#withcache)

### Object literals

* [defaultModuleHandlers](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/globals.md#defaultmodulehandlers)

## Type aliases

### PreprocessLang

Ƭ  **PreprocessLang**: SFCAsyncStyleCompileOptions[\"preprocessLang\"]

*Defined in [index.ts:38](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L38)*

## Variables

### genSourcemap

• `Const` **genSourcemap**: boolean = !!process.env.GEN\_SOURCEMAP

*Defined in [index.ts:74](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L74)*

___

### version

• `Const` **version**: string = process.env.VERSION

*Defined in [index.ts:75](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L75)*

## Functions

### createJSModule

▸ **createJSModule**(`source`: string, `moduleSourceType`: boolean, `filename`: string, `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): Promise\<{}>

*Defined in [index.ts:260](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L260)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`moduleSourceType` | boolean |
`filename` | string |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** Promise\<{}>

___

### createModule

▸ **createModule**(`filePath`: string, `source`: string, `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): object

*Defined in [index.ts:167](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L167)*

#### Parameters:

Name | Type |
------ | ------ |
`filePath` | string |
`source` | string |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** object

Name | Type |
------ | ------ |
`exports` | {} |

___

### createSFCModule

▸ **createSFCModule**(`source`: string, `filename`: string, `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): Promise\<{}>

*Defined in [index.ts:274](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L274)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`filename` | string |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** Promise\<{}>

___

### hash

▸ **hash**(...`valueList`: any[]): string

*Defined in [index.ts:80](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L80)*

#### Parameters:

Name | Type |
------ | ------ |
`...valueList` | any[] |

**Returns:** string

___

### interopRequireDefault

▸ **interopRequireDefault**(`obj`: any): any

*Defined in [index.ts:89](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L89)*

#### Parameters:

Name | Type |
------ | ------ |
`obj` | any |

**Returns:** any

___

### loadDeps

▸ **loadDeps**(`filename`: string, `deps`: string[], `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): Promise\<void>

*Defined in [index.ts:149](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L149)*

#### Parameters:

Name | Type |
------ | ------ |
`filename` | string |
`deps` | string[] |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** Promise\<void>

___

### loadModule

▸ **loadModule**(`path`: string, `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): Promise\<[Module](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/module.md)>

*Defined in [index.ts:424](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L424)*

#### Parameters:

Name | Type |
------ | ------ |
`path` | string |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** Promise\<[Module](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/module.md)>

___

### parseDeps

▸ **parseDeps**(`fileAst`: File): string[]

*Defined in [index.ts:111](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L111)*

#### Parameters:

Name | Type |
------ | ------ |
`fileAst` | File |

**Returns:** string[]

___

### renameDynamicImport

▸ **renameDynamicImport**(`fileAst`: File): void

*Defined in [index.ts:99](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L99)*

#### Parameters:

Name | Type |
------ | ------ |
`fileAst` | File |

**Returns:** void

___

### resolvePath

▸ **resolvePath**(`path`: string, `depPath`: string): string

*Defined in [index.ts:139](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L139)*

#### Parameters:

Name | Type |
------ | ------ |
`path` | string |
`depPath` | string |

**Returns:** string

___

### transformJSCode

▸ **transformJSCode**(`source`: string, `moduleSourceType`: boolean, `filename`: string, `options`: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)): Promise\<(string \| string[])[]>

*Defined in [index.ts:232](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L232)*

#### Parameters:

Name | Type |
------ | ------ |
`source` | string |
`moduleSourceType` | boolean |
`filename` | string |
`options` | [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md) |

**Returns:** Promise\<(string \| string[])[]>

___

### withCache

▸ **withCache**(`cacheInstance`: [Cache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/cache.md), `key`: any[], `valueFactory`: [ValueFactory](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/valuefactory.md)): Promise\<any>

*Defined in [index.ts:207](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L207)*

#### Parameters:

Name | Type |
------ | ------ |
`cacheInstance` | [Cache](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/cache.md) |
`key` | any[] |
`valueFactory` | [ValueFactory](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/valuefactory.md) |

**Returns:** Promise\<any>

## Object literals

### defaultModuleHandlers

▪ `Const` **defaultModuleHandlers**: object

*Defined in [index.ts:417](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/3359f02/src/index.ts#L417)*

#### Properties:

Name | Type | Value |
------ | ------ | ------ |
`.js` | function | (source: string, path: string, options: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)) => Promise\<{}> |
`.mjs` | function | (source: string, path: string, options: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)) => Promise\<{}> |
`.vue` | function | (source: string, path: string, options: [Options](https://github.com/FranckFreiburger/vue3-sfc-loader/docs/interfaces/options.md)) => Promise\<{}> |
