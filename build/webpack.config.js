const Path = require('path');
const zlib = require("zlib");

const Webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');


// doc: https://github.com/Nyalab/caniuse-api#api
const caniuse = require('caniuse-api')

const pkg = require('../package.json');


const distPath = Path.resolve(__dirname, '..', 'dist');

const configure = ({name, vueTarget}) => (env = {}, { mode = 'production', configName }) => {
	if (configName && !configName.includes(name)) {
		return {name}
	}

	const isProd = mode === 'production';

	// doc: https://github.com/browserslist/browserslist#full-list
	// eg. '> 0.5%, last 2 versions, Firefox ESR, not dead, not ie 11'
	const {
		targetsBrowsers = 'defaults',
		noPresetEnv = !isProd,
		noCompress = !isProd,
		noSourceMap = !isProd,
		libraryTargetModule = false,
	} = env;

	const genSourcemap = false;

	console.log('config', { targetsBrowsers, noPresetEnv, noCompress, noSourceMap, genSourcemap, libraryTargetModule, vueTarget });

	return {
		name,

		experiments: {
			outputModule: libraryTargetModule,
		},

		entry: [
			'regenerator-runtime',
			Path.resolve(__dirname, '../src/index.ts'),
		],

		output: {
			path: distPath,
			filename: `vue${ vueTarget }-sfc-loader.js`,
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
					arrowFunction: caniuse.isSupported('arrow-functions', targetsBrowsers),
					const: caniuse.isSupported('const', targetsBrowsers),
					destructuring: caniuse.isSupported('es6', targetsBrowsers), // see https://github.com/Fyrd/caniuse/issues/5676
					forOf: caniuse.isSupported('es6', targetsBrowsers),
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
			new Webpack.DefinePlugin({

				'process.env.NODE_ENV': JSON.stringify(mode), // see also: https://webpack.js.org/configuration/optimization/#optimizationnodeenv
				'process.env.NODE_DEBUG': 'undefined',
				'process.env.DEBUG': 'undefined',

				'process.env.BABEL_ENV': JSON.stringify(mode),
				'process.env.BABEL_TYPES_8_BREAKING': false,

				// further optimizations (ease dead code elimination)
				'process.stdin': 'null',
				'process.stdout': 'null',
				'process.stderr': 'null',
				'process.browser': 'true',

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
								arrows: caniuse.isSupported('arrow-functions', targetsBrowsers),
								ecma: caniuse.isSupported('es6', targetsBrowsers) ? '2015' : '5', // note ECMAScript 2015 is the sixth edition of the ECMAScript Language Specification standard
							} : {},
							unsafe: true,
							unsafe_comps: true,
							unsafe_Function: true,
							unsafe_math: true,
							unsafe_symbols: true,
							unsafe_methods: caniuse.isSupported('es6', targetsBrowsers),
							unsafe_proto: true,
							unsafe_regexp: true,
							unsafe_undefined: true,
						},
					},
				}),
			] : [],

			...isProd ? [

				...!noCompress ? [
					new CompressionPlugin({
						filename: "[path][base].br",
						algorithm: "brotliCompress",
						compressionOptions: {
							params: {
								[zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
							},
						},
					}),
					new CompressionPlugin({
						filename: "[path][base].gz",
						algorithm: "gzip",
						compressionOptions: {
							level: 9,
						},
					}),
				] : [],
				new DuplicatePackageCheckerPlugin(),
				new BundleAnalyzerPlugin({
					// doc: https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
					analyzerMode: 'static',
					openAnalyzer: false,
					reportFilename: `vue${ vueTarget }-sfc-loader.report.html`
				})
			] : [],

			new Webpack.BannerPlugin(`
${ pkg.name } v${ pkg.version } for vue${ vueTarget }

@description ${ pkg.description }.
@author      ${ pkg.author.name } <${ pkg.author.email }>
@license     ${ pkg.license }
@sources     https://github.com/FranckFreiburger/vue3-sfc-loader
		`.trim()),
		],
		resolve: {
			extensions: [".ts", ".js"],
			mainFields: ['browser', 'main', 'module'],
			alias: {

				'./createSFCModule': `./createVue${ vueTarget }SFCModule`,

				// dedupe (see DuplicatePackageCheckerPlugin result)
				'bn.js': require.resolve('bn.js'),
				'safe-buffer': require.resolve('safe-buffer'),
				//'es-abstract': require.resolve('es-abstract'),

				'semver': require.resolve('semver'),
				'lru-cache': require.resolve('lru-cache'),

				'@babel/parser': require.resolve('@babel/parser'),
				'@babel/template': require.resolve('@babel/template'),
				'@babel/traverse': require.resolve('@babel/traverse'),
				'@babel/types': require.resolve('@babel/types'),
				'@babel/code-frame': require.resolve('@babel/code-frame'),
				'@babel/core': require.resolve('@babel/core'),
				'@babel/generator': require.resolve('@babel/generator'),
				'@babel/helper-member-expression-to-functions': require.resolve('@babel/helper-member-expression-to-functions'),
				'@babel/helper-module-imports': require.resolve('@babel/helper-module-imports'),
				'@babel/helper-module-transforms': require.resolve('@babel/helper-module-transforms'),
				'@babel/helper-replace-supers': require.resolve('@babel/helper-replace-supers'),
				'@babel/helper-simple-access': require.resolve('@babel/helper-simple-access'),
				
				'@vue/shared': require.resolve('@vue/shared'),
				'@vue/compiler-sfc': require.resolve('@vue/compiler-sfc'),
				'@vue/compiler-dom': require.resolve('@vue/compiler-dom'),

				// not needed
				'consolidate': false,
				'@vue/compiler-ssr': false,

				'chalk': false,
				'@babel/highlight': Path.resolve(__dirname, 'noopBabelHighlight.mjs'),

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
				'./buble.js': Path.resolve(__dirname, 'fakeBuble.mjs'), // used by vue-template-es2015-compiler
				'./styleProcessors': Path.resolve(__dirname, 'vue2StyleProcessors.ts'), // used by @vue/component-compiler-utils

				...!genSourcemap ? {
					'source-map': false,
					'merge-source-map': false,
				} : {},

				...isProd ? {
					'debug': Path.resolve(__dirname, 'noopDebug.js'),
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
					test: /\.(mjs|js|ts)$/,
					use: {
						loader: 'babel-loader',
						options: {
							compact: true,
							sourceMaps: !noSourceMap,

							presets: [

								...!noPresetEnv ? [
									[
										'@babel/preset-env',
										{
											useBuiltIns: 'entry', // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
											corejs: {
												version: 3,
												proposals: true
											},
											targets: {
												browsers: targetsBrowsers,
											},
										}
									]
								] : [],
							],

							plugins: [
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
								declarationDir: Path.resolve(distPath, 'types'),
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
	{name: 'vue2', vueTarget: '2' },
	{name: 'vue3', vueTarget: '3' }
]

module.exports = configs.map(configure)
