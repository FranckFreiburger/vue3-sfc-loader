import { posix as Path } from 'path'
import { createHash } from 'crypto'

// astexplorer: https://astexplorer.net/
// babel-core doc: https://babeljs.io/docs/en/babel-core

import {
	codeFrameColumns
} from '@babel/code-frame';

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


// @ts-ignore (Could not find a declaration file for module '@babel/plugin-transform-modules-commonjs')
import babelPluginTransformModulesCommonjs from '@babel/plugin-transform-modules-commonjs'

// compiler-sfc src: https://github.com/vuejs/vue-next/blob/master/packages/compiler-sfc/src/index.ts#L1
import {
	parse as sfc_parse,
	compileStyleAsync as sfc_compileStyleAsync,
	compileScript as sfc_compileScript,
	compileTemplate as sfc_compileTemplate,
	SFCAsyncStyleCompileOptions,
	SFCTemplateCompileOptions
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


interface PathHandlers {
	extname(filepath : string) : string,
	/*
	 * relative to absolute module path resolution.
	 */
	resolve(absoluteFilepath : string, dependencyPath : string) : string,
}


/**
 * Represents the content of the file or the content and the extension name.
 */
type File = string | { content : string, extname : string };


interface Options {
// ts: https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types

/**
 * Initial cache that will contain resolved dependencies. All new modules go here.
 * `vue` must initially be contained in this object.
 * [[moduleCache]] is mandatory for the lib. If you do not provide it, the library will create one.
 * It is recommended to provide a prototype-less object (`Object.create(null)`) to avoid potential conflict with `Object` properties (constructor, __proto__, hasOwnProperty, ...).
​ *
 * See also [[options.loadModule]].
 *
 * **example:**
 * ```javascript
 *	...
 *	moduleCache: Object.assign(Object.create(null), {
 *		vue: Vue,
 *	}),
 *	...
 * ```
 *
*/
	moduleCache?: Record<string, Module>,


/**
 * Called by the library when it needs a file.
 * @param path  The path of the file
 * @returns a Promise of the file content (UTF-8)
 *
 * **example:**
 * ```javascript
 *	...
 *	async getFile(url) {
 *	
 *		const res = await fetch(url);
 *		if ( !res.ok )
 *			throw Object.assign(new Error(url+' '+res.statusText), { res });
 *		return await res.text();
 *	},
 *	...
 * ```
*/
	getFile(path : string) : Promise<File>,


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
 * Sets the delimiters used for text interpolation within the template.  
 * Typically this is used to avoid conflicting with server-side frameworks that also use mustache syntax.
 *
 *	```javascript
 *		...
 *		<script>
 *	
 *			// <!--
 *			const vueContent = `
 *				<template> Hello [[[[ who ]]]] !</template>
 *				<script>
 *				export default {
 *					data() {
 *						return {
 *							who: 'world'
 *						}
 *					}
 *				}
 *				</script>
 *			`;
 *			// -->
 *	
 *			const options = {
 *				moduleCache: { vue: Vue },
 *				getFile: () => vueContent,
 *				addStyle: () => {},
 *				delimiters: ['[[[[', ']]]]'],
 *			}
 *	
 *			const app = Vue.createApp(Vue.defineAsyncComponent(() => window['vue3-sfc-loader'].loadModule('file.vue', options)));
 *			app.mount(document.body);
 *	
 *		</script>
 *		...
 *	```
*/

	delimiters?: SFCTemplateCompileOptions['compilerOptions']['delimiters'],


/**
 * Additional babel plugins. [TBD]
 *
 *	```javascript
 *		...
 *		...
 *	```
*/
	additionalBabelPlugins?: any[],


/**
 * Additional module type handlers. see [[ModuleHandler]]
 *
*/
	additionalModuleHandlers?: Record<string, ModuleHandler>,


/**
 * [[get]]() and [[set]]() functions of this object are called when the lib needs to save or load already compiled code. get and set functions must return a `Promise` (or can be `async`).
 * Since compilation consume a lot of CPU, is is always a good idea to provide this object.
 *
 * **example:**
 *
 * In the following example, we cache the compiled code in the browser's local storage. Note that local storage is a limited place (usually 5MB).
 * Here we handle space limitation in a very basic way.
 * Maybe (not tested), the following libraries may help you to gain more space [pako](https://github.com/nodeca/pako), [lz-string](https://github.com/pieroxy/lz-string/)
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
 *				} catch(ex) {
 *					// here we handle DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'XXX' exceeded the quota
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
 * Called by the library when there is somthing to log (eg. scripts compilation errors, template compilation errors, template compilation  tips, style compilation errors, ...)
 * @param type the type of the notification, it respects console property names (error, warn, info).
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


/**
 * Called when the lib requires a module. Do return `undefined` to let the library handle this.
 * @param path  The path of the module.
 * @param options  The options object.
 * @returns A Promise of the module or undefined
 *
 * [[moduleCache]] and [[Options.loadModule]] are strongly related, in the sense that the result of [[options.loadModule]] is stored in [[moduleCache]].
 * However, [[options.loadModule]] is asynchronous and may help you to handle modules or components that are conditionally required (optional features, current languages, plugins, ...).
 * ```javascript
 *	...
 *	loadModule(path, options) {
 *	
 *		if ( path === 'vue' )
 *			return Vue;
 *		},
 *	...
 * ```
 */
	loadModule?(path : string, options : Options) : Promise<Module | undefined>,


/**
 * Abstact path handling
 *
 */
 	pathHandlers : PathHandlers,

}



/**
 * This just represents a loaded js module
 */
interface Module {
}


/**
 * Used by the library when it does not know how to handle a given file type (eg. `.json` files).
 * see [[additionalModuleHandlers]]
 * @param source The content of the file
 * @param path The path of the file
 * @param options The options
 *
 *
 * **example:**
 *
 * ```javascript
 *	...
 *	additionalModuleHandlers: {
 *		'.json': (source, path, options) => JSON.parse(source),
 *	}
 *	...
 * ```
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
 * the version of the library (process.env.VERSION is set by webpack, at compile-time)
 */
export const version : string = process.env.VERSION;


/**
 * @internal
 */
const isProd : boolean = process.env.NODE_ENV === 'production';


// tools

/**
 * @internal
 */
function throwNotDefined(details : string) : never {

	throw new ReferenceError(`${ details } is not defined`);
}

/**
 * @internal
 */
function formatError(message : string, path : string, source : string, line : number, column : number) : string {

	const location = {
		start: { line, column },
	};

	return '\n' + path + '\n' + codeFrameColumns(source, location, {
		message,
	}) + '\n';
}


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
 * Simple cache helper
 * preventCache usage: non-fatal error
 * @internal
 */
async function withCache( cacheInstance : Cache, key : any[], valueFactory : ValueFactory ) {

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

			if ( t.isImport(path.node.callee) )
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
				   // @ts-ignore (Property 'name' does not exist on type 'ArrayExpression')
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
 * Just load and cache given dependencies.
 * @internal
 */
async function loadDeps(filename : string, deps : string[], options : Options) {

	const { pathHandlers: { resolve } } = options;

	for ( const dep of deps )
		await loadModule(resolve(filename, dep), options);
}


/**
 * Create a cjs module
 * @internal
 */
function createModule(filename : string, source : string, options : Options) {

	const { moduleCache, pathHandlers: { resolve } } = options;

	const require = function(path : string) {

		const absPath = resolve(filename, path);
		if ( absPath in moduleCache )
			return moduleCache[absPath];

		throw new Error(`${ absPath } not found in moduleCache`);
	}

	const import_ = async function(path : string) {

		return await loadModule(resolve(filename, path), options);
	}

	const module = {
		exports: {}
	}

	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L195-L198
	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L1102
	Function('exports', 'require', 'module', '__filename', '__dirname', 'import_', source).call(module.exports, module.exports, require, module, filename, resolve(filename, '.'), import_);

	return module;
}


/**
 * @internal
 */
async function transformJSCode(source : string, moduleSourceType : boolean, filename : string, options : Options) {

	const { additionalBabelPlugins = [], log } = options;

	let ast;
	try {

		ast = babel_parse(source, {
			// doc: https://babeljs.io/docs/en/babel-parser#options
			sourceType: moduleSourceType ? 'module' : 'script',
			sourceFilename: filename,
		});
	} catch(ex) {

		log?.('error', 'parse script', formatError(ex.message, filename, source, ex.loc.line, ex.loc.column + 1) );
		throw ex;
	}

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
		highlightCode: false,
	});

	return [ depsList, transformedScript.code ];
}


/**
 * @internal
 */
async function createJSModule(source : string, moduleSourceType : boolean, filename : string, options : Options) {

	const { compiledCache } = options;

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

	const { delimiters, moduleCache, compiledCache, addStyle, log, additionalBabelPlugins = [] } = options;

	// vue-loader next: https://github.com/vuejs/vue-loader/blob/next/src/index.ts#L91
	const { descriptor, errors } = sfc_parse(source, {
		filename,
		sourceMap: genSourcemap,
	});

	const componentHash = hash(filename, version);
	const hasScoped = descriptor.styles.some(e => e.scoped);
	const scopeId = `data-v-${componentHash}`;

	// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
	if ( descriptor.template && descriptor.template.lang )
		await loadModule(descriptor.template.lang, options);

	const compileTemplateOptions : SFCTemplateCompileOptions = descriptor.template ? {
		// hack, since sourceMap is not configurable an we want to get rid of source-map dependency. see genSourcemap
		compiler: { ...vue_CompilerDOM, compile: (template, options) => vue_CompilerDOM.compile(template, { ...options, sourceMap: genSourcemap }) },
		source: descriptor.template.content,
		filename: descriptor.filename,
		isProd,
		scoped: hasScoped,
		id: scopeId,
		compilerOptions: {
			delimiters,
			scopeId: hasScoped ? scopeId : undefined,
			mode: 'module', // see: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-core/src/options.ts#L160
		},
		//	transformAssetUrls
		preprocessLang: descriptor.template.lang,
		preprocessCustomRequire: id => moduleCache[id], // makes consolidate optional, see https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileTemplate.ts#L111-L113
	} : null;


	const component = {};


	if ( descriptor.script || descriptor.scriptSetup ) {

		// eg: https://github.com/vuejs/vue-loader/blob/6ed553f70b163031457acc961901313390cde9ef/src/index.ts#L136

		const [ depsList, transformedScriptSource ] = await withCache(compiledCache, [ componentHash, descriptor.script.content ], async ({ preventCache }) => {

			const babelParserPlugins : babel_ParserPlugin[] = [];

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L43
			const script = sfc_compileScript(descriptor, {
				isProd,
				id: scopeId,
				babelParserPlugins,
				templateOptions: compileTemplateOptions,
			});

			let ast;
			try {

				ast = babel_parse(script.content, {
					// doc: https://babeljs.io/docs/en/babel-parser#options
					// if: https://github.com/babel/babel/blob/main/packages/babel-parser/typings/babel-parser.d.ts#L24
					plugins: [
					 	// see https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L63
						...vue_babelParserDefaultPlugins,
						'jsx',
						...babelParserPlugins
					],
					sourceType: 'module',
					sourceFilename: filename,
					startLine: script.loc.start.line,
				});

			} catch(ex) {

				log?.('error', 'SFC script', formatError(ex.message, filename, source, ex.loc.line, ex.loc.column + 1) );
				throw ex;
			}


			renameDynamicImport(ast);
			const depsList = parseDeps(ast);

			const transformedScript = await babel_transformFromAstAsync(ast, script.content, {
				sourceMaps: genSourcemap, // https://babeljs.io/docs/en/options#sourcemaps
				plugins: [ // https://babeljs.io/docs/en/options#plugins
					babelPluginTransformModulesCommonjs, // https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs#options
					...additionalBabelPlugins,
				],
				babelrc: false,
				configFile: false,
				highlightCode: false,
			});

			return [ depsList, transformedScript.code ];
		});

		await loadDeps(filename, depsList, options);
		Object.assign(component, interopRequireDefault(createModule(filename, transformedScriptSource, options).exports).default);
	}


	if ( descriptor.template !== null ) {
		// compiler-sfc src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileTemplate.ts#L39
		// compileTemplate eg: https://github.com/vuejs/vue-loader/blob/next/src/templateLoader.ts#L33
		const [ templateDepsList, templateTransformedSource ] = await withCache(compiledCache, [ componentHash, descriptor.template.content ], async ({ preventCache }) => {

			const template = sfc_compileTemplate(compileTemplateOptions);

			if ( template.errors.length ) {

				preventCache();
				for ( const err of template.errors ) {

					// @ts-ignore (Property 'message' does not exist on type 'string | CompilerError')
					log?.('error', 'SFC template', formatError(err.message, filename, source, err.loc.start.line + descriptor.template.loc.start.line - 1, err.loc.start.column) );
				}
			}

			for ( const err of template.tips )
				log?.('info', 'SFC template', err);

			return await transformJSCode(template.code, true, descriptor.filename, options);
		});

		await loadDeps(filename, templateDepsList, options);
		Object.assign(component, createModule(filename, templateTransformedSource, options).exports);
	}


	for ( const descStyle of descriptor.styles ) {

		// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
		if ( descStyle.lang )
			await loadModule(descStyle.lang, options);

		const style = await withCache(compiledCache, [ componentHash, descStyle.content ], async ({ preventCache }) => {

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileStyle.ts#L70
			const compiledStyle = await sfc_compileStyleAsync({
				filename: descriptor.filename,
				source: descStyle.content,
				isProd,
				id: scopeId,
				scoped: descStyle.scoped,
				trim: true,
				preprocessLang: descStyle.lang as PreprocessLang,
				preprocessCustomRequire: id => moduleCache[id],
			});

			if ( compiledStyle.errors.length ) {

				preventCache();
				for ( const err of compiledStyle.errors ) {

					// @ts-ignore (Property 'line' does not exist on type 'Error' and Property 'column' does not exist on type 'Error')
					log?.('error', 'SFC style', formatError(err.message, filename, source, err.line + descStyle.loc.start.line - 1, err.column) );
				}
			}

			return compiledStyle.code;
		});

		addStyle(style, descStyle.scoped ? scopeId : undefined);
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
export async function loadModule(path : string, options_ : Options = throwNotDefined('options')) : Promise<Module> {

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

	if ( path in moduleCache )
		return moduleCache[path];

	if ( loadModule ) {

		const module = await loadModule(path, options);
		if ( module !== undefined )
			return moduleCache[path] = module;
	}


	const moduleHandlers = { ...defaultModuleHandlers, ...additionalModuleHandlers };

	const res = await getFile(path);

	const file = typeof res === 'object' ? res : { content: res, extname: pathHandlers.extname(path) };

	if ( !(file.extname in moduleHandlers) )
		throw new TypeError(`Unable to handle ${ file.extname } files (${ path }), see additionalModuleHandlers`);

	if ( typeof file.content !== 'string' )
		throw new TypeError(`Invalid module content (${path}): ${ file.content }`);

	return moduleCache[path] = await moduleHandlers[file.extname](file.content, path, options);
}
