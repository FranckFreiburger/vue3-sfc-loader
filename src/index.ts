import { posix as Path } from 'path'
import { createHash } from 'crypto'

// astexplorer: https://astexplorer.net/
// babel-core doc: https://babeljs.io/docs/en/babel-core

import {
	transformFromAstAsync as babel_transformFromAstAsync,
	traverse,
	NodePath,
	types as t
} from '@babel/core';

import {
	parse as babel_parse,
	ParserPlugin as babel_ParserPlugin
} from '@babel/parser';


// @ts-ignore
import babelPluginTransformModulesCommonjs from '@babel/plugin-transform-modules-commonjs'

// compiler-sfc src: https://github.com/vuejs/vue-next/blob/master/packages/compiler-sfc/src/index.ts#L1
import {
	parse as sfc_parse,
	compileStyleAsync as sfc_compileStyleAsync,
	compileScript as sfc_compileScript,
	compileTemplate as sfc_compileTemplate,
	SFCAsyncStyleCompileOptions
} from '@vue/compiler-sfc'

import {
	babelParserDefaultPlugins as vue_babelParserDefaultPlugins
} from '@vue/shared'

import * as vue_CompilerDOM from '@vue/compiler-dom'


/**
 * @ignore
 */
type PreprocessLang = SFCAsyncStyleCompileOptions['preprocessLang'];


/**
 * @internal
 */
interface ValueFactoryApi {
	preventCache() : void,
}


/**
 * @internal
 */
interface ValueFactory {
	(api : ValueFactoryApi): Promise<any>;
}


interface Cache {
	get(key : string) : Promise<string>,
	set(key : string, value : string) : Promise<void>,
}


interface Options {
	// ts: https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types

/**
 * Initial cache that will contain resolved dependencies.
 * `vue` must initially be contained in this object.
 *
 * **example:**
 * ```javascript
 *	...
 *	moduleCache: {
 *		vue: Vue,
 *	},
 *	...
 * ```
 *
*/
	moduleCache: Record<string, Module>,


/**
 * Called by the library when it needs a file.
 * @param path  The path of the file
 * @returns a Promise of the file content (UTF-8)
 *
 * **example:**
 * ```javascript
 *	...
 *	getFile(url) {
 *		return fetch(url).then(response => response.ok ? response.text() : Promise.reject(response));
 *	},
 *	...
 * ```
*/
	getFile(path : string) : Promise<string>,


/**
 * Called by the library when CSS style must be added in the HTML document.
 * @param style The CSS style chunk
 * @param scopeId The scope ID of the CSS style chunk
 * @return
 *
 * **example:**
 * ```javascript
 *	...
 *	addStyle(styleStr) {
 *
 *		const style = document.createElement('style');
 *		style.textContent = styleStr;
 *		const ref = document.head.getElementsByTagName('style')[0] || null;
 *		document.head.insertBefore(style, ref);
 *	},
 *	...
 * ```
*/
	addStyle(style : string, scopeId : string) : void,


/**
 * Additional babel plugins
 *
 *	```javascript
 *		...
 *		...
 *	```
*/
	additionalBabelPlugins?: any[],


/**
 * Additional module type handlers
 *
 * ```javascript
 *	...
 *	additionalModuleHandlers: {
 *		'.json': (source, path, options) => JSON.parse(source),
 *	}
 *	...
 * ```
 *
*/
	additionalModuleHandlers?: Record<string, ModuleHandler>,


/**
 * Functions of this object are called when tle lib need to save or load already compiled code. [[get]]() and [[set]]() functions must return a `Promise`, or can be `async`.
 * Since compilation consume a lot of CPU, is is always a good idea to provide this object.
 *
 * **example:**
 * In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place, here we handle this in a very basic way.
 * Maybe (not tested), the following lib may help you [pako](https://github.com/nodeca/pako)
 * ```javascript
 *	...
 *	compiledCache: {
 *		set(key, str) {
 *	
 *			// naive storage space management
 *			for (;;) {
 *	
 *				try {
 *	
 *					// doc: https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *					window.localStorage.setItem(key, str);
 *					break;
 *				} catch(ex) { // handle: Uncaught DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota
 *	
 *					window.localStorage.removeItem(window.localStorage.key(0));
 *				}
 *			}
 *		},
 *		get(key) {
 *	
 *			return window.localStorage.getItem(key);
 *		},
 *	},
 *	...
 * ```
 */
	compiledCache?: Cache,


/**
 * Called by the library when there is somthing to log (eg. )
 * @param type the type of the notification
 * @param args the values to log
 * @return
 *
 * ```javascript
 *	...
 *	log(type, ...args) {
 *		
 *		console.log(type, ...args);
 *	},
 *	...
 * ```
 */
	log?(type : string, ...data : any[]) : void,
}



/**
 * @ignore
 */
interface Module {
}

/**
 * A callback that loow
 */
interface ModuleHandler {
	(source : string, path : string, options : Options) : Promise<Module>;
}



// config (see DefinePlugin)

/**
 * @internal
 */
const genSourcemap : boolean = !!process.env.GEN_SOURCEMAP;

/**
 * @internal
 */
 const version : string = process.env.VERSION;


// tools

/**
 * @internal
 */
function hash(...valueList : any[]) : string {

	const hashInstance = createHash('md5');
	for ( const val of valueList )
		hashInstance.update( typeof val === 'string' ? val : JSON.stringify(val) );
	return hashInstance.digest('hex').slice(0, 8);
}


/**
 * @internal
 */
function interopRequireDefault(obj : any) : any {

  return obj && obj.__esModule ? obj : { default: obj };
}

// node types: https://babeljs.io/docs/en/babel-types
// handbook: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md


/**
 * import is a reserved keyword, then rename
 * @internal
 */
function renameDynamicImport(fileAst : t.File) : void {

	traverse(fileAst, {
		CallExpression(path : NodePath<t.CallExpression>) {

			if ( path.node.callee.type === 'Import' )
				path.replaceWith(t.callExpression(t.identifier('import_'), path.node.arguments))
		}
	});
}


/**
 * @internal
 */
function parseDeps(fileAst : t.File) : string[] {

	const requireList : string[] = [];

	traverse(fileAst, {
		ImportDeclaration(path : NodePath<t.ImportDeclaration>) {

			requireList.push(path.node.source.value);
		},
		CallExpression(path : NodePath<t.CallExpression>) {

			if (
					// @ts-ignore
				   path.node.callee.name === 'require'
				&& path.node.arguments.length === 1
				&& t.isStringLiteral(path.node.arguments[0])
			) {

				requireList.push(path.node.arguments[0].value)
			}
		}
	});

	return requireList;
}


/**
 * @internal
 */
function resolvePath(path : string, depPath : string) {

	if ( depPath[0] !== '.' )
		return depPath;

	return Path.normalize(Path.join(Path.dirname(path), depPath));
}


/**
 * Just load and cache deps
 * @internal
 */
async function loadDeps(filename : string, deps : string[], options : Options) {

	const { moduleCache } = options;

	for ( const dep of deps ) {

		const path = resolvePath(filename, dep);
		if ( path in moduleCache )
			continue;

		const compiled = await loadModule(path, options);
		moduleCache[path] = compiled;
	}
}


/**
 * Create a cjs module
 * @internal
 */
function createModule(filePath : string, source : string, options : Options) {

	const { moduleCache } = options;

	const require = function(path : string) {

		const absPath = resolvePath(filePath, path);
		if ( absPath in moduleCache )
			return moduleCache[absPath];

		throw new Error(`${ absPath } not found`);
	}

	const import_ = async function(path : string) {

		const absPath = resolvePath(filePath, path);
		if ( absPath in moduleCache )
			return moduleCache[absPath];

		const compiled = await loadModule(path, options);
		moduleCache[path] = compiled;

		return compiled;
	}

	const module = {
		exports: {}
	}

	const filename = filePath;
	const dirname = Path.dirname(filePath);

	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L195-L198
	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L1102
	Function('exports', 'require', 'module', '__filename', '__dirname', 'import_', source).call(module.exports, module.exports, require, module, filename, dirname, import_);

	return module;
}


/**
 * Simple cache helper
 * @internal
 */
async function withCache( cacheInstance : Cache, key : any[], valueFactory: ValueFactory ) {

	let cachePrevented = false;

	const api = {
		preventCache: () => cachePrevented = true,
	}

	if ( !cacheInstance )
		return await valueFactory(api);

	const hashedKey = hash(...key);
	const valueStr = await cacheInstance.get(hashedKey);
	if ( valueStr )
		return JSON.parse(valueStr);

	const value = await valueFactory(api);

	if ( !cachePrevented )
		await cacheInstance.set(hashedKey, JSON.stringify(value));

	return value;
}


/**
 * @internal
 */
async function transformJSCode(source : string, moduleSourceType : boolean, filename : string, options : Options) {

	const { additionalBabelPlugins = [] } = options;

	const ast = babel_parse(source, {
		// doc: https://babeljs.io/docs/en/babel-parser#options
		sourceType: moduleSourceType ? 'module' : 'script',
		sourceFilename: filename,
	});

	renameDynamicImport(ast);
	const depsList = parseDeps(ast);

	const transformedScript = await babel_transformFromAstAsync(ast, source, {
		sourceMaps: genSourcemap, // doc: https://babeljs.io/docs/en/options#sourcemaps
		plugins: [ // https://babeljs.io/docs/en/options#plugins
			babelPluginTransformModulesCommonjs, // https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs#options
			...additionalBabelPlugins
		],
		babelrc: false,
		configFile: false,
	});

	return [ depsList, transformedScript.code ];
}


/**
 * @internal
 */
async function createJSModule(source : string, moduleSourceType : boolean, filename : string, options : Options) {

	const { moduleCache, compiledCache } = options;

	const [ depsList, transformedSource ] = await withCache(compiledCache, [ version, source, filename ], async () => {

		return await transformJSCode(source, moduleSourceType, filename, options);
	});

	await loadDeps(filename, depsList, options);
	return createModule(filename, transformedSource, options).exports;
}


/**
 * @internal
 */
async function createSFCModule(source : string, filename : string, options : Options) {

	const { moduleCache, compiledCache, addStyle, log, additionalBabelPlugins = [] } = options;

	// vue-loader next: https://github.com/vuejs/vue-loader/blob/next/src/index.ts#L91
	const { descriptor, errors } = sfc_parse(source, {
		filename,
		sourceMap: genSourcemap,
	});

	const componentHash = hash(filename, version);
	const hasScoped = descriptor.styles.some(e => e.scoped);
	const scopeId = hasScoped ? `data-v-${componentHash}` : null;


	const component = {};


	if ( descriptor.script || descriptor.scriptSetup ) {

		// eg: https://github.com/vuejs/vue-loader/blob/6ed553f70b163031457acc961901313390cde9ef/src/index.ts#L136

		const [ depsList, transformedScriptSource ] = await withCache(compiledCache, [ componentHash, descriptor.script.content ], async ({ preventCache }) => {

			const babelParserPlugins : babel_ParserPlugin[] = [];

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L43
			const script = sfc_compileScript(descriptor, {
				babelParserPlugins,
			});

			if ( script.scriptAst === undefined ) { // if error

				try {

					// get the error
					const ast = babel_parse(descriptor.script.content, {
						// doc: https://babeljs.io/docs/en/babel-parser#options
						plugins: [...vue_babelParserDefaultPlugins, 'jsx', ...babelParserPlugins], // see https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L63
						sourceType: 'module',
						sourceFilename: filename,
					});

				} catch (ex) {

					preventCache();
					log?.('error', 'SFC script', ex);
				}
			}

			const program = t.program(script.scriptAst, [], 'module') // doc: https://babeljs.io/docs/en/babel-types#program
			program.loc = script.loc;

			const file = t.file(program); // doc: https://babeljs.io/docs/en/babel-types#file
			renameDynamicImport(file);
			const depsList = parseDeps(file);

			const transformedScript = await babel_transformFromAstAsync(program, script.content, {
				sourceMaps: genSourcemap, // https://babeljs.io/docs/en/options#sourcemaps
				plugins: [ // https://babeljs.io/docs/en/options#plugins
					babelPluginTransformModulesCommonjs, // https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs#options
					...additionalBabelPlugins,
				],
				babelrc: false,
				configFile: false,
			});

			return [ depsList, transformedScript.code ];
		});

		await loadDeps(filename, depsList, options);
		Object.assign(component, interopRequireDefault(createModule(filename, transformedScriptSource, options).exports).default);
	}


	// compiler-sfc src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileTemplate.ts#L39
	// compileTemplate eg: https://github.com/vuejs/vue-loader/blob/next/src/templateLoader.ts#L33
	const [ templateDepsList, templateTransformedSource ] = await withCache(compiledCache, [ componentHash, descriptor.template.content ], async ({ preventCache }) => {

		const template = sfc_compileTemplate({
			// hack, since sourceMap is not configurable an we want to get rid of source-map dependency. see genSourcemap
			compiler: { ...vue_CompilerDOM, compile: (template, options) => vue_CompilerDOM.compile(template, { ...options, sourceMap: genSourcemap }) },
			source: descriptor.template.content,
			filename: descriptor.filename,
			compilerOptions: {
				scopeId,
				mode: 'module', // see: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-core/src/options.ts#L160
			},
			//	transformAssetUrls
			preprocessLang: descriptor.template.lang,
			preprocessCustomRequire: id => moduleCache[id], // makes consolidate optional, see https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileTemplate.ts#L111-L113
		});

		if ( template.errors.length ) {

			preventCache();
			for ( const err of template.errors )
				log?.('warn', 'SFC template', err);
		}

		for ( const err of template.tips )
			log?.('info', 'SFC template', err);

		return await transformJSCode(template.code, true, descriptor.filename, options);
	});

	await loadDeps(filename, templateDepsList, options);
	Object.assign(component, createModule(filename, templateTransformedSource, options).exports);


	for ( const e of descriptor.styles ) {

		const style = await withCache(compiledCache, [ componentHash, e.content ], async ({ preventCache }) => {

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileStyle.ts#L70
			const compiledStyle = await sfc_compileStyleAsync({
				filename: descriptor.filename,
				source: e.content,
				id: scopeId,
				scoped: e.scoped,
				vars: false,
				trim: true,
				preprocessLang: e.lang as PreprocessLang,
				preprocessCustomRequire: id => moduleCache[id],
			});

			if ( compiledStyle.errors.length ) {

				preventCache();
				for ( const err of compiledStyle.errors )
					log?.('warn', 'SFC style', err);
			}

			return compiledStyle.code;
		});

		addStyle(style, scopeId);
	}

	return component;
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
 * This is the main function.
 * @param path  The path of the .vue file
 * @param options  The options
 * @returns A Promise of the component
 *
 * **example using `Vue.defineAsyncComponent`:**
 * ```javascript
 *
 *   const app = Vue.createApp({
 *     components: {
 *       'my-component': Vue.defineAsyncComponent( () => loadModule('./myComponent.vue', options) )
 *     },
 *     template: '<my-component></my-component>'
 *   });
 *
 * ```
 *
 * **example using await:**
 * _the following code requires to be placed in an async function_
 *
 * ```javascript
 *
 *   const app = Vue.createApp({
 *     components: {
 *       'my-component': await loadModule('./myComponent.vue', options)
 *     },
 *     template: '<my-component></my-component>'
 *   });
 *
 * ```
 *
 */
export async function loadModule(path : string, options : Options) {

	const { getFile, additionalModuleHandlers = {} } = options;

	const moduleHandlers = { ...defaultModuleHandlers, ...additionalModuleHandlers };

	const ext = Path.extname(path);
	if ( !(ext in moduleHandlers) )
		throw new TypeError(`Unable to handle ${ ext } files (${ path })`);

	const source = await getFile(path);
	return moduleHandlers[ext](source, path, options);
}

