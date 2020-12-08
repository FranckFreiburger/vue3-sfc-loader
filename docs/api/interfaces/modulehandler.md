**[vue3-sfc-loader](../README.md)**

> [Globals](../README.md) / ModuleHandler

# Interface: ModuleHandler

Used by the library when it does not know how to handle a given file type (eg. `.json` files).
see [additionalModuleHandlers](options.md#additionalmodulehandlers)

## Hierarchy

* **ModuleHandler**

## Callable

▸ (`source`: string, `path`: string, `options`: [Options](options.md)): Promise\<[Module](module.md)>

*Defined in [index.ts:261](https://github.com/FranckFreiburger/vue3-sfc-loader/blob/df65a78/src/index.ts#L261)*

Used by the library when it does not know how to handle a given file type (eg. `.json` files).
see [additionalModuleHandlers](options.md#additionalmodulehandlers)

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`source` | string | The content of the file |
`path` | string | The path of the file |
`options` | [Options](options.md) | The options   **example:**  ```javascript  ...  additionalModuleHandlers: {   '.json': (source, path, options) => JSON.parse(source),  }  ... ```  |

**Returns:** Promise\<[Module](module.md)>
