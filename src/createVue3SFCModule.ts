// compiler-sfc src: https://github.com/vuejs/vue-next/blob/master/packages/compiler-sfc/src/index.ts#L1
import {
	parse as sfc_parse,
	compileStyleAsync as sfc_compileStyleAsync,
	compileScript as sfc_compileScript,
	compileTemplate as sfc_compileTemplate,
	SFCAsyncStyleCompileOptions,
	SFCTemplateCompileOptions,
	SFCBlock
} from '@vue/compiler-sfc'

import {
	babelParserDefaultPlugins as vue_babelParserDefaultPlugins
} from '@vue/shared'

import * as vue_CompilerDOM from '@vue/compiler-dom'

import {
	parse as babel_parse,
	ParserPlugin as babel_ParserPlugin
} from '@babel/parser';

import {
	transformFromAstAsync as babel_transformFromAstAsync,
	types as t,
} from '@babel/core';

// @ts-ignore (Could not find a declaration file for module '@babel/plugin-transform-modules-commonjs')
import babelPluginTransformModulesCommonjs from '@babel/plugin-transform-modules-commonjs'


import { formatError, withCache, hash, renameDynamicImport, parseDeps, interopRequireDefault, transformJSCode, loadDeps, createModule } from './tools.ts'

import { Options, LoadModule, ModuleExport, CustomBlockCallback } from './types.ts'


/**
 * @ignore
 */
type PreprocessLang = SFCAsyncStyleCompileOptions['preprocessLang'];


// SFCBlock : https://github.com/vuejs/vue-next/blob/cc975c1292978dc796c581b32d4b51c32c2e6370/packages/compiler-sfc/src/parse.ts#L24-L32
//export { SFCBlock } from '@vue/compiler-sfc';

/**
 * the version of the library (process.env.VERSION is set by webpack, at compile-time)
 */
const version : string = process.env.VERSION;

const genSourcemap : boolean = !!process.env.GEN_SOURCEMAP;

/**
 * @internal
 */
const isProd : boolean = process.env.NODE_ENV === 'production';



/**
 * @internal
 */

export async function createSFCModule(source : string, filename : string, options : Options, loadModule : LoadModule) : Promise<ModuleExport> {

	const component = {};


	const { delimiters, moduleCache, compiledCache, addStyle, log, additionalBabelPlugins = [], customBlockHandler } = options;

	// vue-loader next: https://github.com/vuejs/vue-loader/blob/next/src/index.ts#L91
	const { descriptor, errors } = sfc_parse(source, {
		filename,
		sourceMap: genSourcemap,
	});


	const customBlockCallbacks : CustomBlockCallback[] = customBlockHandler !== undefined ? await Promise.all( descriptor.customBlocks.map((block : SFCBlock) => customBlockHandler(block, filename, options)) ) : [];

	const componentHash = hash(filename, version);
	const scopeId = `data-v-${componentHash}`;

	// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
	if ( descriptor.template && descriptor.template.lang )
		await loadModule(descriptor.template.lang, options);


	const hasScoped = descriptor.styles.some(e => e.scoped);

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


	if ( descriptor.script || descriptor.scriptSetup ) {

		// eg: https://github.com/vuejs/vue-loader/blob/6ed553f70b163031457acc961901313390cde9ef/src/index.ts#L136

		const [ depsList, transformedScriptSource ] = await withCache(compiledCache, [ componentHash, descriptor.script.content ], async ({ preventCache }) => {

			const babelParserPlugins : babel_ParserPlugin[] = [];

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L43
			const scriptBlock = sfc_compileScript(descriptor, {
				isProd,
				id: scopeId,
				babelParserPlugins,
				templateOptions: compileTemplateOptions,
			});

			let ast;
			if ( !scriptBlock.scriptAst ) {

				// need to re-parse because script compilation errors are not reported by sfc_compileScript
				try {

					ast = babel_parse(scriptBlock.content, {
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
						startLine: scriptBlock.loc.start.line,
					});

				} catch(ex) {

					log?.('error', 'SFC script', formatError(ex.message, filename, source, ex.loc.line, ex.loc.column + 1) );
					throw ex;
				}
			} else {

				// scriptBlock.scriptAst is not type:Program, need to construct one
				//   see t.file: https://babeljs.io/docs/en/babel-types#file
				//   see t.program: https://babeljs.io/docs/en/babel-types#program
				ast = t.file(t.program(scriptBlock.scriptAst, [], 'module'));
			}


			renameDynamicImport(ast);
			const depsList = parseDeps(ast);

			const transformedScript = await babel_transformFromAstAsync(ast, scriptBlock.content, {
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

		await loadDeps(filename, depsList, options, loadModule);
		Object.assign(component, interopRequireDefault(createModule(filename, transformedScriptSource, options, loadModule).exports).default);
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

		await loadDeps(filename, templateDepsList, options, loadModule);
		Object.assign(component, createModule(filename, templateTransformedSource, options, loadModule).exports);
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

	if ( customBlockHandler !== undefined )
		await Promise.all(customBlockCallbacks.map(cb => cb?.(component)));

	return component;
}
