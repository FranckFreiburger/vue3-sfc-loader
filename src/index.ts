import { posix as Path } from 'path'

import { createJSModule } from './tools'
import { createSFCModule, vueVersion } from './createSFCModule'

import { ModuleExport, ModuleHandler, PathHandlers, Options } from './types'

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
class Loading {

	promise : Promise<ModuleExport>;

	constructor(promise : Promise<ModuleExport>) {

		this.promise = promise;
	}
}


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
	'.vue': (source, path, options) => createSFCModule(source, path, options, loadModule),
	'.js': (source, path, options) => createJSModule(source, false, path, options, loadModule),
	'.mjs': (source, path, options) => createJSModule(source, true, path, options, loadModule),
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
		additionalModuleHandlers = null,
		pathHandlers = defaultPathHandlers,
		loadModule,
	} = options_;

	const options = {
		moduleCache,
		additionalModuleHandlers,
		pathHandlers,
		...options_
	};

	if ( path in moduleCache ) {

		if ( moduleCache[path] instanceof Loading )
			return await moduleCache[path].promise;
		else
			return moduleCache[path];
	}


	moduleCache[path] = new Loading((async () => {

		if ( loadModule ) {

			const module = await loadModule(path, options);
			if ( module !== undefined )
				return moduleCache[path] = module;
		}

		const res = await getFile(path);

		const file = typeof res === 'object' ? res : { content: res, extname: pathHandlers.extname(path) };

		const moduleHandlers = { ...defaultModuleHandlers, ...additionalModuleHandlers };

		if ( !(file.extname in moduleHandlers) )
			throw new TypeError(`Unable to handle ${ file.extname } files (${ path }), see additionalModuleHandlers`);

		if ( typeof file.content !== 'string' )
			throw new TypeError(`Invalid module content (${path}): ${ file.content }`);

		const module = await moduleHandlers[file.extname](file.content, path, options);

		return moduleCache[path] = module;

	})());

	return await moduleCache[path].promise;
}
