// astexplorer: https://astexplorer.net/
// babel-core doc: https://babeljs.io/docs/en/babel-core

import {
	traverse,
	NodePath,
	transformFromAstAsync as babel_transformFromAstAsync,
	types as t,
} from '@babel/core';

import {
	parse as babel_parse,
} from '@babel/parser';


import {
	codeFrameColumns,
	SourceLocation,
} from '@babel/code-frame';

// @ts-ignore (Could not find a declaration file for module '@babel/plugin-transform-modules-commonjs')
import babelPluginTransformModulesCommonjs from '@babel/plugin-transform-modules-commonjs'

// @ts-ignore (TS7016: Could not find a declaration file for module '@babel/plugin-transform-typescript'.)
import babelPlugin_typescript from '@babel/plugin-transform-typescript'

import SparkMD5 from 'spark-md5'

import {
	Cache,
	Options,
	ValueFactory,
	ModuleExport,
	Module,
	LoadingType,
	PathContext,
	AbstractPath,
	File,
} from './types'

import { createSFCModule } from './createSFCModule'


/**
 * @internal
 */
const genSourcemap : boolean = !!process.env.GEN_SOURCEMAP;

const version : string = process.env.VERSION as string;


// tools
/**
 * @internal
 */
export function formatError(message : string, path : string, source : string) : string {
	return path + '\n' + message;
}


/**
 * @internal
 */
export function formatErrorLineColumn(message : string, path : string, source : string, line? : number, column? : number) : string {
	if (!line) {
		return formatError(message, path, source)
	}

  const location = {
    start: { line, column },
  };

  return formatError(codeFrameColumns(source, location, { message }), path, source)
}

/**
 * @internal
 */
export function formatErrorStartEnd(message : string, path : string, source : string, start : number, end? : number) : string {
	if (!start) {
	  return formatError(message, path, source)
  }

  const location: SourceLocation = {
    start: { line: 1, column: start }
  };
  if (end) {
    location.end = {line: 1, column: end}
  }

  return formatError(codeFrameColumns(source, location, { message }), path, source)
}


/**
 * @internal
 */
 export function hash(...valueList : any[]) : string {

	return valueList.reduce((hashInstance, val) => hashInstance.append(String(val)), new SparkMD5()).end();
}



/**
 * Simple cache helper
 * preventCache usage: non-fatal error
 * @internal
 */
export async function withCache( cacheInstance : Cache|undefined, key : any[], valueFactory : ValueFactory ) : Promise<any> {

	let cachePrevented = false;

	const api = {
		preventCache: () => cachePrevented = true,
	}

	if ( cacheInstance === undefined )
		return await valueFactory(api);

	const hashedKey = hash(...key);
	const valueStr = await cacheInstance.get(hashedKey);
	if ( valueStr !== undefined )
		return JSON.parse(valueStr);

	const value = await valueFactory(api);

	if ( cachePrevented === false )
		await cacheInstance.set(hashedKey, JSON.stringify(value));

	return value;
}

/**
 * @internal
 */
export class Loading {

	promise : Promise<ModuleExport>;

	constructor(promise : Promise<ModuleExport>) {

		this.promise = promise;
	}
}



/**
 * @internal
 */
export function interopRequireDefault(obj : any) : any {

  return obj && obj.__esModule ? obj : { default: obj };
}

// node types: https://babeljs.io/docs/en/babel-types
// handbook: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md

/**
 * import is a reserved keyword, then rename
 * @internal
 */
export function renameDynamicImport(fileAst : t.File) : void {

	traverse(fileAst, {
		CallExpression(path : NodePath<t.CallExpression>) {

			if ( t.isImport(path.node.callee) )
				path.replaceWith(t.callExpression(t.identifier('__vsfcl_import__'), path.node.arguments))
		}
	});
}


/**
 * @internal
 */
export function parseDeps(fileAst : t.File) : string[] {

	const requireList : string[] = [];

	traverse(fileAst, {
		ExportAllDeclaration(path: NodePath<t.ExportAllDeclaration>) {

			requireList.push(path.node.source.value);
		},		
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


// @ts-ignore
const targetBrowserBabelPlugins = { ...(typeof ___targetBrowserBabelPlugins !== 'undefined' ? ___targetBrowserBabelPlugins : {}) };


/**
 * @internal
 */
export async function transformJSCode(source : string, moduleSourceType : boolean, filename : AbstractPath, additionalBabelParserPlugins : Options['additionalBabelParserPlugins'], additionalBabelPlugins : Options['additionalBabelPlugins'], log : Options['log'], devMode : boolean = false) : Promise<[string[], string]> {

	let ast: t.File;
	try {

		ast = babel_parse(source, {
			// doc: https://babeljs.io/docs/en/babel-parser#options
			sourceType: moduleSourceType ? 'module' : 'script',
			sourceFilename: filename.toString(),
			plugins:  [
//				'optionalChaining',
//				'nullishCoalescingOperator',
				...additionalBabelParserPlugins !== undefined ? additionalBabelParserPlugins : [],
			],
		});
	} catch(ex) {

		log?.('error', 'parse script', formatErrorLineColumn(ex.message, filename.toString(), source, ex.loc.line, ex.loc.column + 1) );
		throw ex;
	}

	renameDynamicImport(ast);
	const depsList = parseDeps(ast);

	const transformedScript = await babel_transformFromAstAsync(ast, source, {
		sourceMaps: genSourcemap, // doc: https://babeljs.io/docs/en/options#sourcemaps
		plugins: [ // https://babeljs.io/docs/en/options#plugins
			...moduleSourceType ? [ babelPluginTransformModulesCommonjs ] : [], // https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs#options
			// @ts-ignore
			...Object.values(targetBrowserBabelPlugins),
			...additionalBabelPlugins !== undefined ? Object.values(additionalBabelPlugins) : [],
		],
		babelrc: false,
		configFile: false,
		highlightCode: false,
		compact: !devMode, // doc: All optional newlines and whitespace will be omitted when generating code in compact mode.
		comments: devMode,
		retainLines: devMode,
		//envName: devMode ? 'development' : 'production', see 'process.env.BABEL_ENV': JSON.stringify(mode),

		//minified,
		sourceType: moduleSourceType ? 'module' : 'script',
	});

	if ( transformedScript === null || transformedScript.code == null ) { // == null or undefined

		const msg = `unable to transform script "${filename.toString()}"`;
		log?.('error', msg);
		throw new Error(msg)
	}

	return [ depsList, transformedScript.code ];
}



// module tools


export async function loadModuleInternal(pathCx : PathContext, options : Options) : Promise<ModuleExport> {

	const { moduleCache, loadModule, handleModule } = options;

	const { id, path, getContent } = options.getResource(pathCx, options);

	if ( id in moduleCache ) {

		if ( moduleCache[id] instanceof Loading )
			return await (moduleCache[id] as Loading).promise;
		else
			return moduleCache[id];
	}


	moduleCache[id] = new Loading((async () => {

		// note: null module is accepted
		let module : ModuleExport | undefined | null = undefined;

		if ( loadModule )
			module = await loadModule(id, options);

		if ( module === undefined ) {

			const { getContentData, type } = await getContent();

			if ( handleModule !== undefined )
				module = await handleModule(type, getContentData, path, options);

			if ( module === undefined )
				module = await handleModuleInternal(type, getContentData, path, options);

			if ( module === undefined )
				throw new TypeError(`Unable to handle ${ type } files (${ path })`);
		}

		return moduleCache[id] = module;

	})());

	return await (moduleCache[id] as LoadingType<ModuleExport>).promise;
}




/**
 * Create a cjs module
 * @internal
 */
export function defaultCreateCJSModule(refPath : AbstractPath, source : string, options : Options) : Module {

	const { moduleCache, pathResolve, getResource } = options;

	const require = function(relPath : string) {

		const { id } = getResource({ refPath, relPath }, options);
		if ( id in moduleCache )
			return moduleCache[id];

		throw new Error(`require(${ JSON.stringify(id) }) failed. module not found in moduleCache`);
	}

	const importFunction = async function(relPath : string) {

		return await loadModuleInternal({ refPath, relPath }, options);
	}

	const module = {
		exports: {}
	}

	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L195-L198
	// see https://github.com/nodejs/node/blob/a46b21f556a83e43965897088778ddc7d46019ae/lib/internal/modules/cjs/loader.js#L1102
	const moduleFunction = Function('exports', 'require', 'module', '__filename', '__dirname', '__vsfcl_import__', source);
	moduleFunction.call(module.exports, module.exports, require, module, refPath, pathResolve({ refPath, relPath: '.' }, options), importFunction);

	return module;
}


/**
 * @internal
 */
export async function createJSModule(source : string, moduleSourceType : boolean, filename : AbstractPath, options : Options) : Promise<ModuleExport> {

	const { compiledCache, additionalBabelParserPlugins, additionalBabelPlugins, createCJSModule, log } = options;

	const [depsList, transformedSource] =
		await withCache(
			compiledCache,
			[
				version,
				source,
				filename,
				options.devMode,
				additionalBabelParserPlugins ? additionalBabelParserPlugins : '',
				additionalBabelPlugins ? Object.keys(additionalBabelPlugins) : '',
			],
			async () => {

		return await transformJSCode(source, moduleSourceType, filename, additionalBabelParserPlugins, additionalBabelPlugins, log, options.devMode);
	});

	await loadDeps(filename, depsList, options);
	return createCJSModule(filename, transformedSource, options).exports;
}


/**
 * Just load and cache given dependencies.
 * @internal
 */
export async function loadDeps(refPath : AbstractPath, deps : AbstractPath[], options : Options) : Promise<void> {

	await Promise.all(deps.map(relPath => loadModuleInternal({ refPath, relPath }, options)))
}


/**
 * Default implementation of handleModule
 */
 async function handleModuleInternal(type : string, getContentData : File['getContentData'], path : AbstractPath, options : Options) : Promise<ModuleExport | undefined> {

	switch (type) {
		case '.vue': return createSFCModule((await getContentData(false)) as string, path, options);
		case '.js': return createJSModule((await getContentData(false)) as string, false, path, options);
		case '.mjs': return createJSModule((await getContentData(false)) as string, true, path, options);
		case '.ts': return createJSModule((await getContentData(false)) as string, true, path, {
			...options,
			additionalBabelParserPlugins: [ 'typescript', ...(options.additionalBabelParserPlugins ?? []) ],
			additionalBabelPlugins: { typescript: babelPlugin_typescript, ...(options.additionalBabelPlugins ?? {}) }
		});
	}

	return undefined;
}
