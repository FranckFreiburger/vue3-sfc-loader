const { defaultFilesVue2, defaultFiles, createPage } = require('./testsTools.js');

[
	{desc: "vue 2", vueVersion: 2, files: defaultFilesVue2},
	{desc: "vue 3", vueVersion: 3, files: defaultFiles},
]
.filter(({ vueVersion }) => !process.env.vueVersion || vueVersion === process.env.vueVersion )
.map(e => { console.log('tests vue ' + e.vueVersion); return e })
.forEach(({desc, vueVersion, files}) => {
	describe(desc, () => {
		test('text-only template', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<template>
								<span>Hello World !</span>
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
						...files,
						'/component.vue': `
							<template>
								<span>Hello World ! {{ msg }}<span>
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
						...files,
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

				await expect(output.some(e => e.type === 'error' && e.content[0] === 'SFC style')).toBe(true);

				await page.close();
			});


			test('properly detect and reports errors in script', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
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
						...files,
						'/component.vue': `
							<template>
								<b>Hello {{ msg }} !</b>
							</template>
							<style scoped>
								b { color: red; }
							</style>
							<script>
								export default {
									data: () => ({ msg: 'World' })
								}
							</script>
						`
					}
				});

				await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
				await expect(!output.some(e => e.type === 'error')).toBe(true);

				await page.close();
			});

			test('invalid require', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<script>
								require('empty.mjs');
							</script>
						`
					}
				});

				await expect(output.filter(e => e.type === 'pageerror' && e.text).map(e => e.text)[0]).toMatch(/.*HTTP Error.*/);

				await page.close();
			});

			test('DOM has scope', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<template>
								<span>Hello World !</span>
							</template>
							<style scoped>
								body {
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
						...files,
						'/component.vue': `
							<template>
								<span>Hello World !</span>
							</template>
							<style>
								body {
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

			test('nested mjs import', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
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
						...files,
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
						...files,
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
						...files,
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



			test('nested with slot', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<template>
								<span><foo><bar>test</bar></foo></span>
							</template>
							<script>
								import foo from './foo.vue'
								import bar from './bar.vue'
			
								export default {
									components: {
										foo,
										bar,
									},
									created: () => console.log('main created'),
									mounted: () => console.log('main mounted'),
								}
							</script>
						`,

						'/foo.vue': `
							<template>
								<span>foo (<slot></slot>)</span>
							</template>
							<script>
								export default {
									created: () => console.log('foo created'),
									mounted: () => console.log('foo mounted'),
								}
							</script>
						`,

						'/bar.vue': `
							<template>
								<span>bar (<slot></slot>)</span>
							</template>
							<script>
								export default {
									created: () => console.log('bar created'),
									mounted: () => console.log('bar mounted'),
								}
							</script>
						`
					}
				});

				expect(output.filter(e => e.type === 'log').map(e => e.content).flat().join(',')).toBe('main created,foo created,bar created,bar mounted,foo mounted,main mounted');

				expect(await page.content()).toEqual(expect.stringContaining('<span><span>foo (<span>bar (test)</span>)</span></span>'));

				await page.close();
			});


			test('should handle missing dynamic import', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
			        '/component.vue': `
			            <script>
				            import('./missing_file.js')
				            .catch(ex => console.log('error'))
				            .finally(() => console.log('done'))
			            </script>
			        `,
					}
				});

				expect(output.filter(e => e.type === 'log').map(e => e.content).flat().join(',')).toBe('error,done');

				await page.close();
			});


			test('should handle custom blocks asynchronously', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<script>
								export default {
									mounted() {
			
										console.log( this.$options.bazComponentProperty );
									}
								}
							</script>
			
							<foo>bar</foo>
						`,

						'/boot.js': `
							export default function boot({ options, createApp, mountApp }) {
			
								options.customBlockHandler = async (block, filename, options) => {
			
									console.log(block.type, block.content.trim());
			
									return async (component) => {
			
										component.bazComponentProperty = 'baz';
									}
								}

								createApp(options).then(app => mountApp(app));
							}
						`
					}
				});

				expect(output.filter(e => e.type === 'log').map(e => e.content).flat().join(',')).toBe('foo,bar,baz');

				await page.close();
			});


			test('should use cache', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<script>
								export default {
									mounted() {
										console.log('mounted')
									}
								}
							</script>
							<foo>bar</foo>
						`,
						'/boot.js': `
							export default function boot({ options, createApp, mountApp, Vue }) {
			
								const myCache = {};
			
								Object.assign(options, {
									compiledCache: {
										set(key, str) {
			
											console.log('cache.set')
											myCache[key] = str;
										},
										get(key) {
			
											console.log('cache.get')
											return myCache[key];
										},
									}
								});
			
								createApp(options).then((app) => {
									mountApp(app, 'elt1')
			
									options.moduleCache = {
										vue: Vue
									};
			
									createApp(options).then((app2) => {
										mountApp(app2, 'elt2');
									});
								})
							}
						`
					}
				});

				expect(output.filter(e => e.type === 'log').map(e => e.content).flat().join(',')).toBe('cache.get,cache.set,mounted,cache.get,mounted');

				await page.close();
			});

			test('custom template language', async () => {
				const { page, output } = await createPage({
					files: {
						...files,
						'/component.vue': `
							<template lang="custom">
								<span>Hello World !</span>
							</template>
						`,
						'/optionsOverride.js': `
							export default (options) => {
								options.moduleCache.custom = {render: (s, options, cb) => {
									cb(null, s.replace("Hello World !", "Custom Hello World !"))
								} }
							};
						`,
					}
				});

				await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Custom Hello World !');

				await page.close();
			});

			test('custom style language', async () => {
					const { page, output } = await createPage({
						files: {
							...files,
							'/component.vue': `
								<template>
									<span class="hello-world">Hello World !</span>
								</template>
								<style scoped lang="sass">
									__dot__hello-world {
										background: red;
									}
								</style>
							`,
							// Register a fake sass module that replace "__dot__" with "."
							'/optionsOverride.js': `
								export default (options) => {
									options.moduleCache.sass = {
										renderSync: ({data}) => {
											return {
												css: data.replace("__dot__", "."),
												stats: {}
											}
										}
									}
								};
							`,
						}
					});

					await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
					await expect(page.$eval(
						'head', head => {
							return head.getElementsByTagName('style')[0].textContent.trim()
						}))
						.resolves.toMatch(/\.hello-world.*/);

					await page.close();
				});
	});


})
