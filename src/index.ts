import { posix as Path } from 'path'

import { createJSModule, Loading, loadModuleInternal } from './tools'
import { createSFCModule, vueVersion } from './createSFCModule'

import { ModuleExport, ModuleHandler, PathHandlers, Options, File, Resource } from './types'

/**
 * the version of the library (process.env.VERSION is set by webpack, at compile-time)
 */
export const version : string = process.env.VERSION;


/**
 * the version of Vue that is expected by the library
 */
export { vueVersion } from './createSFCModule'



/**
 * @internal
 */
function throwNotDefined(details : string) : never {

	throw new ReferenceError(`${ details } is not defined`);
}


/**
 * @internal
 */
const defaultModuleHandlers : Record<string, ModuleHandler> = {
	'.vue': (source, path, options) => createSFCModule(source, path, options),
	'.js': (source, path, options) => createJSModule(source, false, path, options),
	'.mjs': (source, path, options) => createJSModule(source, true, path, options),
};


/**
 * Default implementation of PathHandlers
 */
const defaultPathHandlers : PathHandlers = {
	extname(filepath) {

		return Path.extname(filepath);
	},
	resolve(absoluteFilepath, dependencyPath) {

		return dependencyPath[0] !== '.' ? dependencyPath : Path.normalize(Path.join(Path.dirname(absoluteFilepath), dependencyPath));
	}
}


function defaultGetResource(currentResourcePath : string, depResourcePath : string, options : Options) : Resource {

	const { pathHandlers: { resolve }, getFile } = options;
	const path = resolve(currentResourcePath, depResourcePath);
	return {
		id: path,
		path: path,
		getContent: async () => await getFile(path),
	};
}


/**
 * This is the main function.
 * This function is intended to be used only to load the entry point of your application.
 * If for some reason you need to use it in your components, be sure to share at least the options.`compiledCache` object between all calls.
 *
 * @param path  The path of the `.vue` file. If path is not a path (eg. an string ID), your [[getFile]] function must return a [[File]] object.
 * @param options  The options
 * @returns A Promise of the component
 *
 * **example using `Vue.defineAsyncComponent`:**
 *
 * ```javascript
 *
 *	const app = Vue.createApp({
 *		components: {
 *			'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
 *		},
 *		template: '<my-component></my-component>'
 *	});
 *
 * ```
 *
 * **example using `await`:**
 *
 * ```javascript

 * ;(async () => {
 *
 *		const app = Vue.createApp({
 *			components: {
 *				'my-component': await loadModule('./myComponent.vue', options)
 *			},
 *			template: '<my-component></my-component>'
 *		});
 *
 * })()
 * .catch(ex => console.error(ex));
 *
 * ```
 *
 */
export async function loadModule(path : string, options_ : Options = throwNotDefined('options')) : Promise<ModuleExport> {

	const {
		moduleCache = Object.create(null),
		getFile = throwNotDefined('options.getFile()'),
		addStyle = throwNotDefined('options.addStyle()'),
		moduleHandlers = null,
		pathHandlers = defaultPathHandlers,
		getResource = defaultGetResource,
		loadModule,
	} = options_;


	// TBD: remove this in v1.0
	async function normalizedGetFile(path : string) : Promise<File> {

		const res = await getFile(path);
		return typeof res === 'object' ? res : { content: res, extname: pathHandlers.extname(path) };
	}

	const options = {
		moduleCache,
		pathHandlers,
		getResource,
		...options_,
		getFile: normalizedGetFile,
		moduleHandlers: { ...defaultModuleHandlers, ...moduleHandlers },
	};

	return await loadModuleInternal('', path, options);
}
