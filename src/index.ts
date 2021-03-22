import {
	posix as Path
} from 'path'

import {
	loadModuleInternal
} from './tools'

import {
	ModuleExport,
	PathHandlers,
	Options,
	File,
	Resource,
	PathContext,
	LangProcessor,
	AbstractPath,
} from './types'


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
 * Default implementation of PathHandlers.
 * resolve() should handle 3 situations :
 *  - resolve a relative path ( eg. import './details.vue' )
 *  - resolve an absolute path ( eg. import '/components/card.vue' )
 *  - resolve a module name ( eg. import { format } from 'date-fns' )
 */
const defaultPathHandlers : PathHandlers = {
	extname(filepath) {

		return Path.extname(filepath.toString());
	},
	resolve({ refPath, relPath } : PathContext) {

		// initial resolution: refPath is not defined
		if ( refPath === undefined )
			return relPath;

		// note :
		//  normalize('./test') -> 'test'
		//  normalize('/test') -> '/test'

		const relPathStr = relPath.toString();

		// a module name ?
		if ( relPathStr[0] !== '.' && relPathStr[0] !== '/' )
			return relPath;

		return Path.normalize(Path.join(Path.dirname(refPath.toString()), relPathStr));
	}
}


function defaultGetResource(pathCx : PathContext, options : Options) : Resource {

	const { pathHandlers: { resolve }, getFile } = options;
	const path = resolve(pathCx);
	return {
		id: path.toString(),
		path: path,
		getContent: () => getFile(path),
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
export async function loadModule(path : AbstractPath, options : Options = throwNotDefined('options')) : Promise<ModuleExport> {

	const {
		moduleCache = throwNotDefined('options.moduleCache'),
		getFile = throwNotDefined('options.getFile()'),
		addStyle = throwNotDefined('options.addStyle()'),
		pathHandlers = defaultPathHandlers,
		getResource = defaultGetResource,
	} = options;

	// moduleCache should be defined with Object.create(null). require('constructor') etc... should not be a default module
	if ( moduleCache instanceof Object )
		Object.setPrototypeOf(moduleCache, null);

	// TBD: remove this in v1.0
	async function normalizedGetFile(path : AbstractPath) : Promise<File> {

		const res = await getFile(path);
		return typeof res === 'object' ? res : { content: res, extname: pathHandlers.extname(path) };
	}

	const normalizedOptions = {
		moduleCache,
		pathHandlers,
		getResource,
		...options,
		getFile: normalizedGetFile,
	};

	return await loadModuleInternal( { refPath: undefined, relPath: path }, normalizedOptions);
}

/**
 * Convert a function to template processor interface (consolidate)
 */
 export function buildTemplateProcessor(processor: LangProcessor) {
	return {
		render: (source: string, preprocessOptions: string, cb: (_err : any, _res : any) => void) => {
			try {
				const ret = processor(source, preprocessOptions)
				if (typeof ret === 'string') {
					cb(null, ret)
				} else {
					ret.then(processed => {
						cb(null, processed)
					})
					ret.catch(err => {
						cb(err, null)
					})
				}
			} catch (err) {
				cb(err, null)
			}
		}
	}
}