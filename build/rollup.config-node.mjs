import { fileURLToPath } from 'url'

import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

import pkg from '../package.json' assert { type: 'json' };

const vueTarget = '3';
const outputFormat = 'module';
const genSourcemap = false;


let vueVersion; // expected vue version
switch ( vueTarget ) {
    case '2':
        vueVersion = (await import('vue-template-compiler/package.json', { assert: { type: 'json' } })).default.version;
        break;
    case '3':
        vueVersion = (await import('@vue/compiler-sfc/package.json', { assert: { type: 'json' } })).default.version;
        break;
    default:
        throw new Error(`invalid vueTarget: ${ vueTarget }`)
}


/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: './src/index.ts',
	output: {
		file: `dist/vue${ vueTarget }-sfc-loader-node.${ outputFormat === 'module' ? 'mjs' : 'js' }`,
		format: outputFormat,
	},
    plugins: [
        replace({
            preventAssignment: true,
            values: {
				'process.env.GEN_SOURCEMAP': JSON.stringify(genSourcemap),
				'process.env.VERSION': JSON.stringify(pkg.version),
                'process.env.VUE_VERSION': JSON.stringify(vueVersion),
            },
        }),
        alias({
            entries: [
                { find: './createSFCModule', replacement: `./createVue${ vueTarget }SFCModule` },
            ]
        }),
        typescript({
            compilerOptions: {
                target: 'ES2017', // keep async/await
                allowSyntheticDefaultImports: true,
            }
        }), // beware: order is important !
        terser({
            compress: false,
            mangle: false,
            output: {
              comments: false,
              beautify: true,
            },
        }),
    ],
};

export default config;
