**[vue3-sfc-loader](../README.md)**

> [Globals](../README.md) / ModuleHandler

# Interface: ModuleHandler

Called by the library when it does not handle a loaded file type (eg. .json files).
see [additionalModuleHandlers](options.md#additionalmodulehandlers)

## Hierarchy

* **ModuleHandler**

## Callable

▸ (`source`: string, `path`: string, `options`: [Options](options.md)): Promise\<[Module](module.md)>

*Defined in [index.ts:231](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/e6d9175/src/index.ts#L231)*

Called by the library when it does not handle a loaded file type (eg. .json files).
see [additionalModuleHandlers](options.md#additionalmodulehandlers)

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`source` | string | The content of the file |
`path` | string | The path of the file |
`options` | [Options](options.md) | The options  ```javascript  ...  additionalModuleHandlers: {   '.json': (source, path, options) => JSON.parse(source),  }  ... ```  |

**Returns:** Promise\<[Module](module.md)>
