const { defaultFiles, createPage } = require('./testsTools.js');


test('text-only template', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World !
				</template>
			`
		}
	});

	await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');

	await page.close();
});


test('properly detect and reports errors in template', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World ! {{ msg }
				</template>
			`
		}
	});

	//await page.waitForSelector('#done');
	await expect(output.some(e => e.type === 'error' && e.content[0] === 'SFC template')).toBe(true);
	//await new Promise(resolve => page.on('consoleValues', ({ type, args }) => type === 'error' && args[0] === 'SFC template' && resolve() ));

	await page.close();
});


test('properly detect and reports errors in style', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World !
				</template>
				<style>
					body
						color: red;
					}
				</style>
			`
		}
	});

	await expect(output.some(e => e.type === 'error' && e.content[0] === 'SFC style')).toBe(true);

	await page.close();
});


test('properly detect and reports errors in script', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					test(
				</script>
			`
		}
	});

	await expect(output.some(e => e.type === 'error' && e.content[0] === 'SFC script')).toBe(true);

	await page.close();
});



test('all blocks', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					<b>Hello {{ msg }} !</b>
				</template>
				<style scoped>
					b { color: red; }
				</style>
				<script>
					export default {
						data: () => ({ msg: 'world' })
					}
				</script>
			`
		}
	});

	await expect(!output.some(e => e.type === 'error')).toBe(true);

	await page.close();
});


test('invalid require', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					require('empty.mjs');
				</script>
			`
		}
	});

	await expect(output.some(e => e.type === 'pageerror' && String(e.content).includes('HttpError') )).toBe(true);

	await page.close();
});


test('DOM has scope', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					<span>Hello World !</span>
				</template>
				<style scoped>
					body
						color: red;
					}
				</style>
			`
		}
	});

	await expect(page.evaluate(() =>

		[...document.querySelector('#app > span').attributes].some(e => e.name.startsWith('data-v-'))

	)).resolves.toBe(true);

	await page.close();
});


test('DOM has no scope', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					<span>Hello World !</span>
				</template>
				<style>
					body
						color: red;
					}
				</style>
			`
		}
	});

	await expect(page.evaluate(() =>

		[...document.querySelector('#app > span').attributes].some(e => e.name.startsWith('data-v-'))

	)).resolves.toBe(false);

	await page.close();
});


test.only('nested mjs import', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					import { test } from './foo/test.mjs'
					console.log( test() );
				</script>
			`,

			'/foo/test.mjs': `
				export function test() {

					return require('../bar/test.mjs').test();
				}
			`,

			'/bar/test.mjs': `
				export function test() {

					return 'test_ok';
				}
			`
		}
	});

	await expect(output.some(e => e.type === 'log' && e.content[0] === 'test_ok' )).toBe(true);

	await page.close();
});


test('nested js require', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					const { test } = require('./foo/test.js')
					console.log( test() );
				</script>
			`,

			'/foo/test.js': `
				exports.test = function() {

					return require('../bar/test.js').test();
				}
			`,

			'/bar/test.js': `
				exports.test = function() {

					return 'test_ok';
				}
			`
		}
	});

	await expect(output.some(e => e.type === 'log' && e.content[0] === 'test_ok' )).toBe(true);

	await page.close();
});



test('access es6 module default from cjs', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					const { test } = require('./foo/test.js')
					console.log( test() );
				</script>
			`,

			'/foo/test.js': `
				exports.test = function() {

					return require('../bar/test.mjs').default();
				}
			`,

			'/bar/test.mjs': `
				export default function() {

					return 'test_ok';
				}
			`
		}
	});

	await expect(output.some(e => e.type === 'log' && e.content[0] === 'test_ok' )).toBe(true);

	await page.close();
});



test('access cjs module default from es6', async () => {

	const { page, output } = await createPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					const { test } = require('./foo/test.mjs')
					console.log( test() );
				</script>
			`,

			'/foo/test.mjs': `

				import test1 from '../bar/test.js'
				export function test() {

					return test1();
				}
			`,

			'/bar/test.js': `
				module.exports = function() {

					return 'test_ok';
				}
			`
		}
	});

	await expect(output.some(e => e.type === 'log' && e.content[0] === 'test_ok' )).toBe(true);

	await page.close();
});

