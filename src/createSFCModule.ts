import { LoadModule, ModuleExport, Options } from './types'

export declare function createSFCModule (source: string, filename: string, options: Options, loadModule: LoadModule): Promise<ModuleExport>
