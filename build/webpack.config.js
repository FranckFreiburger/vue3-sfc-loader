const Path = require('path');

const Webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');


// doc: https://github.com/Nyalab/caniuse-api#api
const caniuse = require('caniuse-api')

const pkg = require('../package.json');


const distPath = Path.resolve(__dirname, '..', 'dist');

module.exports = (env = {}, { mode = 'production' }) => {

	// doc: https://github.com/browserslist/browserslist#full-list
	// eg. '> 0.5%, last 2 versions, Firefox ESR, not dead, not ie 11'
	const { targetsBrowsers = 'defaults' } = env;

	const isProd = mode === 'production';

	const genSourcemap = false;

	return {
		entry: [
			'regenerator-runtime',
			Path.resolve(__dirname, '../src/index.ts'),
		],

		output: {
			path: distPath,
			filename: 'vue3-sfc-loader.js',
			library: {
				type: 'umd',
				name: 'vue3-sfc-loader',
			},
			environment: {
				// doc: https://webpack.js.org/configuration/output/#outputenvironment
				...isProd ? {
					arrowFunction: caniuse.isSupported('arrow-functions', targetsBrowsers),
					const: caniuse.isSupported('const', targetsBrowsers),
					destructuring: caniuse.isSupported('es6', targetsBrowsers), // see https://github.com/Fyrd/caniuse/issues/5676
					forOf: caniuse.isSupported('es6', targetsBrowsers),
				} : {},
			},
		},

		// doc: https://webpack.js.org/configuration/devtool/#devtool
		devtool: isProd ? 'cheap-source-map' : 'cheap-source-map',

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
			...isProd ? [
				new TerserPlugin({
					extractComments: false,
					terserOptions: {
						// doc: https://github.com/terser/terser#compress-options
						mangle: true,
						compress: {
							drop_console: true,
							arrows: caniuse.isSupported('arrow-functions', targetsBrowsers),
							ecma: caniuse.isSupported('es6', targetsBrowsers) ? '2015' : '5', // note ECMAScript 2015 is the sixth edition of the ECMAScript Language Specification standard
						},
					},
				}),
			] : [],

			...isProd ? [
				new DuplicatePackageCheckerPlugin(),
				new BundleAnalyzerPlugin({
					// doc: https://github.com/webpack-contrib/webpack-bundle-analyzer#options-for-plugin
					analyzerMode: 'static',
					openAnalyzer: false,
				})
			] : [],

			new Webpack.BannerPlugin(`
${ pkg.name } v${ pkg.version }

@description ${ pkg.description }.
@author      ${ pkg.author.name } <${ pkg.author.email }>
@license     ${ pkg.license }
			`.trim()),
		],

		resolve: {
			mainFields: ['browser', 'main', 'module'],
			alias: {

				// dedupe (see DuplicatePackageCheckerPlugin result)
				'bn.js': require.resolve('bn.js'),
				'safe-buffer': require.resolve('safe-buffer'),
				//'es-abstract': require.resolve('es-abstract'),

				// '@babel/parser': require.resolve('@babel/parser'),
				// '@babel/template': require.resolve('@babel/template'),
				// '@babel/traverse': require.resolve('@babel/traverse'),
				// '@babel/types': require.resolve('@babel/types'),


				// not needed
				'consolidate': false,
				'@vue/compiler-ssr': false,
				'@babel/code-frame': false,

				...!genSourcemap ? {
					'source-map': false,
				} : {},

				...isProd ? {
					'debug': Path.resolve(__dirname, 'noopDebug.mjs'),
				} : {},
			},

			fallback: {
				'path': require.resolve('path-browserify'),
				'buffer': require.resolve('buffer/'),
				'url': require.resolve('url/'),
				'crypto': require.resolve('crypto-browserify'),
				'stream': require.resolve('stream-browserify'),
				'assert': require.resolve('assert/'),
				'util': require.resolve('util/'),
				'process': require.resolve('process/'),
				'vm': false, // or require.resolve('vm-browserify'),
				'fs': false,
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

							presets: [
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
								sourceMap: false,
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

