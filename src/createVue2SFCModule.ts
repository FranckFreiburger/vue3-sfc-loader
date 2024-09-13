import {
	compileStyleAsync as sfc_compileStyleAsync,
	compileTemplate as sfc_compileTemplate,
	parse as sfc_parse, StyleCompileOptions,
} from '@vue/component-compiler-utils'

import * as vueTemplateCompiler from 'vue-template-compiler'
import { VueTemplateCompiler } from '@vue/component-compiler-utils/dist/types'
import { TemplateCompileOptions } from '@vue/component-compiler-utils/dist/compileTemplate'

// https://github.com/vuejs/jsx
// @ts-ignore
import jsx from '@vue/babel-plugin-transform-vue-jsx'
// @ts-ignore
import babelSugarInjectH from '@vue/babel-sugar-inject-h'

// @ts-ignore (TS7016: Could not find a declaration file for module '@babel/plugin-transform-typescript'.)
import babelPlugin_typescript from '@babel/plugin-transform-typescript'

import {
	formatError,
	formatErrorStartEnd,
	withCache,
	hash,
	interopRequireDefault,
	transformJSCode,
	loadDeps,
	loadModuleInternal,
} from './tools'

import {
	Options,
	ModuleExport,
	CustomBlockCallback,
	AbstractPath
} from './types'

import {
	processors,
	StylePreprocessor,
} from '../build/vue2StyleProcessors'



/**
 * the version of the library
 */
import { version, vueVersion } from './index'

// @ts-ignore
const targetBrowserBabelPluginsHash : string = hash(...Object.keys({ ...(typeof ___targetBrowserBabelPlugins !== 'undefined' ? ___targetBrowserBabelPlugins : {}) }));

const genSourcemap : boolean | "inline" = process.env.GEN_SOURCEMAP;

/**
 * @internal
 */
const isProd : boolean = process.env.NODE_ENV === 'production';



/**
 * @internal
 */

export async function createSFCModule(source : string, filename : AbstractPath, options : Options) : Promise<ModuleExport> {

	const strFilename = filename.toString();

	const component = {};

	const {
		delimiters,
		whitespace,
		moduleCache,
		compiledCache,
		getResource,
		addStyle,
		log,
		additionalBabelParserPlugins = [],
		additionalBabelPlugins = {},
		customBlockHandler,
		devMode = false,
		createCJSModule,
		processStyles,
	} = options;

	const descriptor = sfc_parse({
		source,
		filename: strFilename,
		needMap: !!genSourcemap,
		compiler: vueTemplateCompiler as VueTemplateCompiler}
		);

	const customBlockCallbacks : (CustomBlockCallback|undefined)[] = customBlockHandler !== undefined ? await Promise.all( descriptor.customBlocks.map((block ) => customBlockHandler(block, filename, options)) ) : [];

	const scopeId = `data-v-${hash(strFilename)}`;

	// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
	if ( descriptor.template && descriptor.template.lang )
		await loadModuleInternal({ refPath: filename, relPath: descriptor.template.lang }, options);


	const hasScoped = descriptor.styles.some(e => e.scoped);

	// https://github.com/vuejs/vue-loader/blob/b53ae44e4b9958db290f5918248071e9d2445d38/lib/runtime/componentNormalizer.js#L36
	if (hasScoped) {
		Object.assign(component, {_scopeId: scopeId});
	}

	const compileTemplateOptions : TemplateCompileOptions|null = descriptor.template ? {
		// hack, since sourceMap is not configurable an we want to get rid of source-map dependency. see genSourcemap
		source: descriptor.template.src ? (await (await getResource({ refPath: filename, relPath: descriptor.template.src }, options).getContent()).getContentData(false)) as string : descriptor.template.content,
		filename: strFilename,
		compiler: vueTemplateCompiler as VueTemplateCompiler,
		compilerOptions: {
			delimiters,
			whitespace,
			outputSourceRange: true,
			scopeId: hasScoped ? scopeId : null,
			comments: true
		} as any,
		isProduction: isProd,
		prettify: devMode,
	} : null;

	// Vue2 doesn't support preprocessCustomRequire, so we have to preprocess manually
	if (descriptor.template?.lang) {
		const preprocess = moduleCache[descriptor.template.lang] as any;
		compileTemplateOptions.source =
			await withCache(
				compiledCache,
				[
					vueVersion,
					compileTemplateOptions.source,
					descriptor.template.lang,
				],
				async ({ preventCache }) => {

			return await new Promise((resolve, reject) => {
				preprocess.render(compileTemplateOptions.source, compileTemplateOptions.preprocessOptions, (_err : any, _res : any) => {

					if (_err)
						reject(_err)
					else
						resolve(_res)
				})
			})

		});
	}

	if ( descriptor.script ) {

		// eg: https://github.com/vuejs/vue-loader/blob/v15.9.6/lib/index.js

		const src = descriptor.script.src ? (await (await getResource({ refPath: filename, relPath: descriptor.script.src }, options).getContent()).getContentData(false)) as string : descriptor.script.content;

		const [depsList, transformedScriptSource] =
			await withCache(
				compiledCache,
				[
					vueVersion,
					isProd,
					devMode,
					src,
					descriptor.script.lang,
					additionalBabelParserPlugins,
					Object.keys(additionalBabelPlugins),
					targetBrowserBabelPluginsHash,
				],
				async ({ preventCache }) => {

			let contextBabelParserPlugins : Options['additionalBabelParserPlugins'] = ['jsx'];
			let contextBabelPlugins: Options['additionalBabelPlugins'] = { jsx, babelSugarInjectH };
			
			if (descriptor.script?.lang === 'ts' ) {
				
				contextBabelParserPlugins = [ ...contextBabelParserPlugins, 'typescript' ];
				contextBabelPlugins = { ...contextBabelPlugins, typescript: babelPlugin_typescript };
			}

			return await transformJSCode(src, true, strFilename, [ ...contextBabelParserPlugins, ...additionalBabelParserPlugins ], { ...contextBabelPlugins, ...additionalBabelPlugins }, log, devMode);
		});

		await loadDeps(filename, depsList, options);
		Object.assign(component, interopRequireDefault(createCJSModule(filename, transformedScriptSource, options).exports).default);
	}


	if ( descriptor.template !== null ) {

		const [templateDepsList, templateTransformedSource] =
			await withCache(
				compiledCache,
				[
					vueVersion,
					devMode,
					compileTemplateOptions.source,
					delimiters,
					whitespace,
					scopeId,
					additionalBabelParserPlugins,
					Object.keys(additionalBabelPlugins),
					targetBrowserBabelPluginsHash,
				],
				async ({ preventCache }) => {

			const template = sfc_compileTemplate(compileTemplateOptions);
			// "@vue/component-compiler-utils" does NOT assume any module system, and expose render in global scope.
			template.code += `\nmodule.exports = { render: render, staticRenderFns: staticRenderFns }`

			if ( template.errors.length ) {

				preventCache();
				for ( let err of template.errors ) {
					if (typeof err !== 'object') {
						err = {
							msg: err,
							start: undefined,
							end: undefined
						}
					}

					log?.('error', 'SFC template', formatErrorStartEnd(err.msg, strFilename, compileTemplateOptions.source.trim(), err.start, err.end ));
				}
			}

			for ( let err of template.tips ) {
				if (typeof err !== 'object') {
					err = {
						msg: err,
						start: undefined,
						end: undefined
					}
				}

				log?.('info', 'SFC template', formatErrorStartEnd(err.msg, strFilename, source, err.start, err.end ));
			}

			return await transformJSCode(template.code, true, filename, additionalBabelParserPlugins, additionalBabelPlugins, log, devMode);
		});

		await loadDeps(filename, templateDepsList, options);
		Object.assign(component, createCJSModule(filename, templateTransformedSource, options).exports);
	}


	for ( const descStyle of descriptor.styles ) {

		const srcRaw = descStyle.src ? (await (await getResource({ refPath: filename, relPath: descStyle.src }, options).getContent()).getContentData(false)) as string : descStyle.content;

		const style = await withCache(
			compiledCache,
			[
				vueVersion,
				srcRaw,
				descStyle.lang,
				scopeId,
				descStyle.scoped,
		],
			async ({ preventCache }) => {

			const src = processStyles !== undefined ? await processStyles(srcRaw, descStyle.lang, filename, options) : srcRaw;

			if ( src === undefined )
				preventCache();
	
			const compileStyleOptions: StyleCompileOptions = {
				source: src,
				filename: strFilename,
				id: scopeId,
				scoped: descStyle.scoped !== undefined ? descStyle.scoped : false,
				trim: false,
				...processStyles === undefined ? {
					preprocessLang: descStyle.lang,
					preprocessOptions: {
						preprocessOptions: {
							customRequire: (id: string) => moduleCache[id]
						}
					}
				} : {},
			}

			// Vue2 doesn't support preprocessCustomRequire, so we have to preprocess manually
			if ( descStyle.lang && processors[descStyle.lang] === undefined )
				processors[descStyle.lang] = await loadModuleInternal({ refPath: filename, relPath: descStyle.lang }, options) as StylePreprocessor;

			const compiledStyle = await sfc_compileStyleAsync(compileStyleOptions);
			if ( compiledStyle.errors.length ) {

				preventCache();
				for ( const err of compiledStyle.errors ) {

					log?.('error', 'SFC style', formatError(err, strFilename, source));
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
