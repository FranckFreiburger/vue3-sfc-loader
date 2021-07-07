const Path = require('path');
const zlib = require('zlib')
const fs = require('fs');

const browserslist = require("browserslist");

const Webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const basicIdentifierReplacerPlugin = require('./basicIdentifierReplacerPlugin.js');
const requiredBabelPluginsNamesByBrowserTarget = require('./requiredBabelPluginsNamesByBrowserTarget.js');


const dts = require('dts-bundle');

class DtsBundlePlugin {
	constructor (options) {
		if (!options) {
			options = {};
		}
		this.options = options;
	}

	_bundle (compiler, options) {
		const logger = compiler.getInfrastructureLogger('DtsBundlePlugin');

		return () => {
			const createSFCModuleNewPath = Path.resolve(this.options.baseDir, 'createSFCModule.d.ts')
			const createSFCModuleVue2Path = Path.resolve(this.options.baseDir, 'createVue2SFCModule.d.ts')
			const createSFCModuleVue3Path = Path.resolve(this.options.baseDir, 'createVue3SFCModule.d.ts')

			if (fs.existsSync(createSFCModuleVue2Path)) {
				fs.renameSync(createSFCModuleVue2Path, createSFCModuleNewPath)
			} else if (fs.existsSync(createSFCModuleVue3Path)) {
				fs.renameSync(createSFCModuleVue3Path, createSFCModuleNewPath)
			}

			logger.info("Creating dts bundle")
			dts.bundle(options);
		}
	}

	apply (compiler) {
		const bundle = (compilation) => {
			return this._bundle(compiler, this.options);
		}

		compiler.hooks.afterEmit.tap('DtsBundlePlugin', bundle());
	}
}

// doc: https://github.com/Nyalab/caniuse-api#api
//const caniuse = require('caniuse-api')
const caniuse = require('./caniuse-isSupported.js')

const pkg = require('../package.json');

const configure = ({name, vueTarget, libraryTargetModule}) => (env = {}, { mode = 'production', configName }) => {
	if (configName && !configName.includes(name)) {
		return {name}
	}

	const distPath = Path.resolve(__dirname, '..', 'dist');
	const distTypesPath = Path.resolve(distPath, 'types', `vue${ vueTarget }${ libraryTargetModule ? '-esm' : ''}`)

	const isProd = mode === 'production';

	// doc: https://github.com/browserslist/browserslist#full-list
	// eg. '> 0.5%, last 2 versions, Firefox ESR, not dead, not ie 11'
	const {
		targetsBrowsers = 'defaults',
	} = env;

	const {
		noPresetEnv = !isProd,
		noCompress = !isProd,
		noSourceMap = !isProd,
	} = Object.fromEntries(Object.entries(env).map(([k,v]) => {

		try {

			return [k, JSON.parse(v)];
		} catch {
			
			return [k, v];
		}
	}));

	const genSourcemap = false;

	let actualTargetsBrowsers = targetsBrowsers;

	// "or" / ","" -> union
	// "and" -> intersection
	// "not" -> relative complement

	// excludes cases that make no sense 
	actualTargetsBrowsers += ( libraryTargetModule ? ' and supports es6-module' : '' ) + ( vueTarget == 3 ? ' and supports proxy' : '' );

	console.log('config', { actualTargetsBrowsers, noPresetEnv, noCompress, noSourceMap, genSourcemap, libraryTargetModule, vueTarget });

	if ( browserslist(actualTargetsBrowsers).length === 0 )
		throw new RangeError('browserslist(' + actualTargetsBrowsers + ') selects no browsers');

	const pluginNameList = requiredBabelPluginsNamesByBrowserTarget(actualTargetsBrowsers);
	const ___targetBrowserBabelPlugins = '{' + pluginNameList.map(e => `'${ e }': require('@babel/plugin-${ e }'),\n`).join('') + '}';

	return {
		name,

		experiments: {
			outputModule: libraryTargetModule,
		},

		entry: [
			Path.resolve(__dirname, '../src/bootstrap.js'),
			Path.resolve(__dirname, '../src/index.ts'),
		],

		output: {
			path: distPath,
			filename: `vue${ vueTarget }-sfc-loader${ libraryTargetModule ? '.esm' : '' }.js`,
			...libraryTargetModule ? {

				libraryTarget: 'module',
			} : {

				library: {
					type: 'umd',
					name: `vue${ vueTarget }-sfc-loader`,
				},
			},
			environment: {
				// doc: https://webpack.js.org/configuration/output/#outputenvironment
				...!noPresetEnv ? {
					arrowFunction: caniuse.isSupported('arrow-functions', actualTargetsBrowsers),
					const: caniuse.isSupported('const', actualTargetsBrowsers),
					destructuring: caniuse.isSupported('es6', actualTargetsBrowsers), // see https://github.com/Fyrd/caniuse/issues/5676
					forOf: caniuse.isSupported('es6', actualTargetsBrowsers),
				} : {},
			},
		},

		// doc: https://webpack.js.org/configuration/devtool/#devtool
		devtool: noSourceMap ? false : isProd ? 'source-map' : 'cheap-source-map',

		performance: { hints: false },

		optimization: {
			mangleExports: isProd ? 'size' : false,
			moduleIds: isProd ? 'size' : 'named',
			chunkIds: isProd ? 'size' : 'named',

			minimize: false, // done manually, see below
		},

		plugins: [
			...!libraryTargetModule ? [
/*				
				new DtsBundlePlugin({
					name: `vue${ vueTarget }-sfc-loader`,
					main:`${distTypesPath}/src/index.d.ts`,
					baseDir: `${distTypesPath}/src`,
					out: `${distPath}/vue${ vueTarget }-sfc-loader.d.ts`
				})
*/
			] : [],

			new Webpack.DefinePlugin({

				'process.env.NODE_ENV': JSON.stringify(mode), // see also: https://webpack.js.org/configuration/optimization/#optimizationnodeenv
				'process.env.NODE_DEBUG': 'undefined',
				'process.env.DEBUG': 'undefined',

				'process.env.BABEL_ENV': JSON.stringify(mode),
				'process.env.BABEL_TYPES_8_BREAKING': false,

				'process.env.VUE_ENV': 'client',
				'global.process.env.VUE_ENV': 'client',
				
				// further optimizations (ease dead code elimination)
				'process.stdin': 'null',
				'process.stdout': 'null',
				'process.stderr': 'null',
				'process.browser': 'true',
				'process.env.TERM': 'undefined',

				// config
				'process.env.GEN_SOURCEMAP': JSON.stringify(genSourcemap),
				'process.env.VERSION': JSON.stringify(pkg.version),
			}),

			new Webpack.ProvidePlugin({
				'Buffer': ['buffer', 'Buffer'],
				'process': 'process',
			}),

			// minimize
			...!noCompress ? [
				new TerserPlugin({
					extractComments: false,
					terserOptions: {
						// doc: https://github.com/terser/terser#compress-options
						mangle: true,
						compress: {
							passes: 2,
							drop_console: true,
							...!noPresetEnv ? {
								arrows: caniuse.isSupported('arrow-functions', actualTargetsBrowsers),
								ecma: caniuse.isSupported('es6', actualTargetsBrowsers) ? '2015' : '5', // note ECMAScript 2015 is the sixth edition of the ECMAScript Language Specification standard
							} : {},
							
							// beware, unsafe: true is not suitable for this project !
							// unsafe: true,
							// unsafe_comps: true,
							// unsafe_Function: true,
							// unsafe_math: true,
							// unsafe_symbols: true,
							// unsafe_methods: caniuse.isSupported('es6', actualTargetsBrowsers),
							// unsafe_proto: true,
							// unsafe_regexp: true,
							// unsafe_undefined: true,
						},
					},
				}),
			] : [],

			...isProd ? [

				...!noCompress ? [
					new CompressionPlugin({
						filename: "[path][base].br",
						exclude: [ /\.map$/, /\.ts$/ ],
						algorithm: "brotliCompress",
						compressionOptions: {
							params: {
								[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
							},
						},
					}),
					new CompressionPlugin({
						filename: "[path][base].gz",
						exclude: [ /\.map$/, /\.ts$/ ],
						algorithm: "gzip",
						compressionOptions: {
							level: 9,
						},
					}),
				] : [],

				...!libraryTargetModule ? [

					new DuplicatePackageCheckerPlugin(),
					new BundleAnalyzerPlugin({
						// doc: https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
						analyzerMode: 'static',
						openAnalyzer: false,
						reportFilename: `vue${ vueTarget }-sfc-loader.report${ libraryTargetModule ? '.esm' : '' }.html`
					})

				] : [],
			] : [],

			new Webpack.BannerPlugin(`
${ pkg.name } v${ pkg.version } for vue${ vueTarget }

@description Vue${ vueTarget } ${ pkg.description }.
@author      ${ pkg.author.name } <${ pkg.author.email }>
@license     ${ pkg.license }
@sources     https://github.com/FranckFreiburger/vue3-sfc-loader
		`.trim()),
		],
		resolve: {
			extensions: [".ts", ".js"],
			mainFields: ['browser', 'main', 'module'],
			alias: {

				'util$': require.resolve('util/'),

				'./createSFCModule$': `./createVue${ vueTarget }SFCModule`,

				// dedupe (see DuplicatePackageCheckerPlugin result)
				'bn.js$': require.resolve('bn.js'),
				'safe-buffer$': require.resolve('safe-buffer'),
				//'es-abstract': require.resolve('es-abstract'),

				'semver$': require.resolve('semver'),
				'lru-cache$': require.resolve('lru-cache'),

				'@babel/parser$': require.resolve('@babel/parser'),
				'@babel/template$': require.resolve('@babel/template'),
				'@babel/traverse$': require.resolve('@babel/traverse'),
				'@babel/types$': require.resolve('@babel/types'),
				'@babel/code-frame$': require.resolve('@babel/code-frame'),
				'@babel/core$': require.resolve('@babel/core'),
				'@babel/generator$': require.resolve('@babel/generator'),
				'@babel/helper-member-expression-to-functions$': require.resolve('@babel/helper-member-expression-to-functions'),
				'@babel/helper-module-imports$': require.resolve('@babel/helper-module-imports'),
				'@babel/helper-module-transforms$': require.resolve('@babel/helper-module-transforms'),
				'@babel/helper-replace-supers$': require.resolve('@babel/helper-replace-supers'),
				'@babel/helper-simple-access$': require.resolve('@babel/helper-simple-access'),
				'@babel/helper-validator-identifier$': require.resolve('@babel/helper-validator-identifier'),
				'@babel/helper-split-export-declaration$': require.resolve('@babel/helper-split-export-declaration'),
				'@babel/helper-plugin-utils$': require.resolve('@babel/helper-plugin-utils'),

				'@vue/shared$': require.resolve('@vue/shared'),
				'@vue/compiler-sfc$': require.resolve('@vue/compiler-sfc'),
				'@vue/compiler-dom$': require.resolve('@vue/compiler-dom'),

				// not needed
				'consolidate': false,
				'@vue/compiler-ssr': false,

				'chalk': false,
				'@babel/highlight$': Path.resolve(__dirname, 'noopBabelHighlight.mjs'),

				'emojis-list': false,
				'json5': false,
				'convert-source-map': false,

				'loader-utils': false,
				// '@babel/helpers': false, // required !
				'postcss-modules-values': false,
				'postcss-modules-scope': false,

				// vue2
				'sass': false,
				'stylus': false,
				'less': false,
				'prettier': false,
				'./buble.js$': Path.resolve(__dirname, 'fakeBuble.mjs'), // used by vue-template-es2015-compiler
				'./styleProcessors$': Path.resolve(__dirname, 'vue2StyleProcessors.ts'), // used by @vue/component-compiler-utils

				...!genSourcemap ? {
					'source-map': false,
					'merge-source-map': false,
				} : {},

				...isProd ? {
					'debug$': Path.resolve(__dirname, 'noopDebug.js'),
				} : {},
			},

			fallback: {
				'path': require.resolve('path-browserify'), // only the posix part
				'buffer': false,// require.resolve('buffer/'),
				'url': false, //require.resolve('url/'),
				'crypto': false, // or require.resolve('crypto-browserify'),
				'stream': false, //require.resolve('stream-browserify'),
				'assert': false, //require.resolve('assert/'),
				'util': false, //require.resolve('util/'),
				'process': false, //require.resolve('process/'),
				'vm': false, // or require.resolve('vm-browserify'),
				'fs': false,
				'os': false,
				'module': false,
				'v8': false,
			}
		},

		module: {
			rules: [
				isProd ? {
					test: /\.(mjs|js|cjs|ts)$/,
					exclude: [
						/[\\/]regenerator-runtime[\\/]/, // transpile not needed
						/[\\/]core-js(|-pure)[\\/]/, // Babel should not transpile core-js for correct work.
					],
					use: {
						loader: 'babel-loader',
						options: {
							compact: !noCompress,
							sourceMaps: !noSourceMap,
							sourceType: 'unambiguous', // doc: https://babeljs.io/docs/en/options#sourcetype
							targets: actualTargetsBrowsers,
							presets: [

								...!noPresetEnv ? [
									[
										'@babel/preset-env', {
										}
									]
								] : [],
							],
							plugins: [

								...!noPresetEnv ? [
									[
										basicIdentifierReplacerPlugin, {
											___targetBrowserBabelPlugins
										}
									],

									[
										'polyfill-corejs3', {
											// Allow global scope pollution with polyfills required by actualTargetsBrowsers.
											// This is necessary because the code compiled by vue3-sfc-loader also require these polyfills.
											'method': 'entry-global'
										}
									],

									[
										'polyfill-regenerator', {
											'method': 'usage-pure'
										}
									]
								] : [],

							],
						}
					}
				} : {},

				{
					test: /\.(ts)$/,
					use: {
						loader: 'ts-loader',
						options: {
							// doc: https://github.com/TypeStrong/ts-loader#loader-options
							configFile: Path.resolve(__dirname, 'tsconfig.json'),
							onlyCompileBundledFiles: true,
							compilerOptions: {
								sourceMap: !noSourceMap,
								outDir: distPath,
								declaration: true,
								declarationDir: distTypesPath,
							}
						}
					}
				},


			]
		},

		stats: {
			optimizationBailout: true,
			orphanModules: true,
		}
	}
}

let configs = [
	{name: 'vue2', vueTarget: '2', libraryTargetModule: false },
	{name: 'vue2esm', vueTarget: '2', libraryTargetModule: true },
	{name: 'vue3', vueTarget: '3', libraryTargetModule: false },
	{name: 'vue3esm', vueTarget: '3', libraryTargetModule: true },
]

module.exports = configs.map(configure)
