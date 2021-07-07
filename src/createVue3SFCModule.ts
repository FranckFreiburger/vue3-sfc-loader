// compiler-sfc src: https://github.com/vuejs/vue-next/blob/master/packages/compiler-sfc/src/index.ts#L1
import {
	parse as sfc_parse,
	compileStyleAsync as sfc_compileStyleAsync,
	compileScript as sfc_compileScript,
	compileTemplate as sfc_compileTemplate,
	SFCAsyncStyleCompileOptions,
	SFCTemplateCompileOptions,
} from '@vue/compiler-sfc'

import {
	babelParserDefaultPlugins as vue_babelParserDefaultPlugins
} from '@vue/shared'

import * as vue_CompilerDOM from '@vue/compiler-dom'

// https://github.com/vuejs/jsx-next
import jsx from '@vue/babel-plugin-jsx'

import {
	formatErrorLineColumn,
	formatError,
	withCache,
	hash,
	interopRequireDefault,
	transformJSCode,
	loadDeps,
	createCJSModule,
	loadModuleInternal,
} from './tools'

import {
	Options,
	ModuleExport,
	CustomBlockCallback,
	AbstractPath
} from './types'

// @ts-ignore (Cannot find module '@vue/compiler-sfc/../../package.json' or its corresponding type declarations.)
//export { version as vueVersion } from '@vue/compiler-sfc/../../package.json'
export { version as vueVersion } from '@vue/compiler-sfc/package.json'

/**
 * @ignore
 */
type PreprocessLang = SFCAsyncStyleCompileOptions['preprocessLang'];

/**
 * the version of the library (process.env.VERSION is set by webpack, at compile-time)
 */
const version : string = process.env.VERSION;

// @ts-ignore
const targetBrowserBabelPluginsHash : string = hash(...Object.keys({ ...(typeof ___targetBrowserBabelPlugins !== 'undefined' ? ___targetBrowserBabelPlugins : {}) }));

const genSourcemap : boolean = !!process.env.GEN_SOURCEMAP;

/**
 * @internal
 */
const isProd : boolean = process.env.NODE_ENV === 'production';



/**
 * @internal
 */

export async function createSFCModule(source : string, filename : AbstractPath, options : Options) : Promise<ModuleExport> {

	const strFilename = filename.toString();

	const component : { [key: string]: any } = {};

	const { delimiters, moduleCache, compiledCache, getResource, addStyle, log, additionalBabelParserPlugins = [], additionalBabelPlugins = {}, customBlockHandler } = options;

	// vue-loader next: https://github.com/vuejs/vue-loader/blob/next/src/index.ts#L91
	const { descriptor, errors } = sfc_parse(source, {
		filename: strFilename,
		sourceMap: genSourcemap,
	});


	const customBlockCallbacks : CustomBlockCallback[] = customBlockHandler !== undefined ? await Promise.all( descriptor.customBlocks.map((block) => customBlockHandler(block, filename, options)) ) : [];

	const componentHash = hash(strFilename, version, targetBrowserBabelPluginsHash);
	const scopeId = `data-v-${componentHash}`;

	const hasScoped = descriptor.styles.some(e => e.scoped);

	if ( hasScoped ) {

		// see https://github.com/vuejs/vue-next/blob/4549e65baea54bfd10116241a6a5eba91ec3f632/packages/runtime-core/src/component.ts#L87
		// vue-loader: https://github.com/vuejs/vue-loader/blob/65c91108e5ace3a8c00c569f08e9a847be5754f6/src/index.ts#L223
		component.__scopeId = scopeId;
	}

	// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
	if ( descriptor.template && descriptor.template.lang )
		await loadModuleInternal({ refPath: filename, relPath: descriptor.template.lang }, options);


	const compileTemplateOptions : SFCTemplateCompileOptions = descriptor.template ? {
		// hack, since sourceMap is not configurable an we want to get rid of source-map dependency. see genSourcemap
		compiler: { ...vue_CompilerDOM, compile: (template, options) => vue_CompilerDOM.compile(template, { ...options, sourceMap: genSourcemap }) },
		source: descriptor.template.src ? (await (await getResource({ refPath: filename, relPath: descriptor.template.src }, options).getContent()).getContentData(false)) as string : descriptor.template.content,
		filename: descriptor.filename,
		isProd,
		scoped: hasScoped,
		id: scopeId,
		slotted: descriptor.slotted,
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

		// doc: <script setup> cannot be used with the src attribute.
		// TBD: check if this is the right solution
		if ( descriptor.script?.src )
			descriptor.script.content = (await (await getResource({ refPath: filename, relPath: descriptor.script.src }, options).getContent()).getContentData(false)) as string;

		// TBD: handle <script setup src="...

		const [ depsList, transformedScriptSource ] = await withCache(compiledCache, [ componentHash, descriptor.script?.content, descriptor.scriptSetup?.content, additionalBabelParserPlugins, Object.keys(additionalBabelPlugins) ], async ({ preventCache }) => {

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileScript.ts#L43
			const scriptBlock = sfc_compileScript(descriptor, {
				isProd,
				id: scopeId,
				// @ts-ignore (unstable resolution: node_modules/@babel/parser/typings/babel-parser vs node_modules/@types/babel__core/node_modules/@babel/parser/typings/babel-parser)
				babelParserPlugins: additionalBabelParserPlugins, //  [...babelParserDefaultPlugins, 'jsx'] + additionalBabelParserPlugins // babelParserDefaultPlugins = [ 'bigInt', 'optionalChaining', 'nullishCoalescingOperator' ]
				// doc: https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md#inline-template-mode
				// vue-loader next : https://github.com/vuejs/vue-loader/blob/12aaf2ea77add8654c50c8751bad135f1881e53f/src/resolveScript.ts#L59
				inlineTemplate: false,
				templateOptions: compileTemplateOptions,
			});

			// see https://github.com/vuejs/vue-loader/blob/12aaf2ea77add8654c50c8751bad135f1881e53f/src/templateLoader.ts#L54
			if ( compileTemplateOptions !== null )
				compileTemplateOptions.compilerOptions.bindingMetadata = scriptBlock.bindings;

			return await transformJSCode(scriptBlock.content, true, strFilename, [ ...additionalBabelParserPlugins, ...vue_babelParserDefaultPlugins, 'jsx' ], { ...additionalBabelPlugins,  jsx }, log);

		});

		await loadDeps(filename, depsList, options);
		Object.assign(component, interopRequireDefault(createCJSModule(filename, transformedScriptSource, options).exports).default);
	}


	if ( descriptor.template !== null ) {
		// compiler-sfc src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileTemplate.ts#L39
		// compileTemplate eg: https://github.com/vuejs/vue-loader/blob/next/src/templateLoader.ts#L33
		const [ templateDepsList, templateTransformedSource ] = await withCache(compiledCache, [ componentHash, compileTemplateOptions.source ], async ({ preventCache }) => {

			const template = sfc_compileTemplate(compileTemplateOptions);

			if ( template.errors.length ) {

				preventCache();
				for ( const err of template.errors ) {
					if (typeof err === 'object') {
						if (err.loc) {
							log?.('error', 'SFC template', formatErrorLineColumn(err.message, strFilename, source, err.loc.start.line + descriptor.template.loc.start.line - 1, err.loc.start.column) );
						} else {
							log?.('error', 'SFC template', formatError(err.message, strFilename, source) );
						}
					} else {
						log?.('error', 'SFC template', formatError(err, strFilename, source) );
					}
				}
			}

			for ( const err of template.tips )
				log?.('info', 'SFC template', err);

			return await transformJSCode(template.code, true, descriptor.filename, additionalBabelParserPlugins, additionalBabelPlugins, log);
		});

		await loadDeps(filename, templateDepsList, options);
		Object.assign(component, createCJSModule(filename, templateTransformedSource, options).exports);
	}


	for ( const descStyle of descriptor.styles ) {

		// hack: asynchronously preloads the language processor before it is required by the synchronous preprocessCustomRequire() callback, see below
		if ( descStyle.lang )
			await loadModuleInternal({ refPath: filename, relPath: descStyle.lang }, options);

		const src = descStyle.src ? (await (await getResource({ refPath: filename, relPath: descStyle.src }, options).getContent()).getContentData(false)) as string : descStyle.content;

		const style = await withCache(compiledCache, [ componentHash, src ], async ({ preventCache }) => {

			// src: https://github.com/vuejs/vue-next/blob/15baaf14f025f6b1d46174c9713a2ec517741d0d/packages/compiler-sfc/src/compileStyle.ts#L70
			const compiledStyle = await sfc_compileStyleAsync({
				filename: descriptor.filename,
				source: src,
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
					log?.('error', 'SFC style', formatErrorLineColumn(err.message, filename, source, err.line + descStyle.loc.start.line - 1, err.column) );
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
