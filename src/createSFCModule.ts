import { LoadModule, ModuleExport, Options } from './types'

declare export async function createSFCModule(source : string, filename : string, options : Options, loadModule : LoadModule) : Promise<ModuleExport>
