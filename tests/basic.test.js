const { defaultFilesFactory, createPage } = require('./testsTools.js');

[
	{ desc: "vue 2", vueTarget: 2 },
	{ desc: "vue 3", vueTarget: 3 },
]
.filter(({ vueTarget }) => !process.env.vueTarget || vueTarget === Number(process.env.vueTarget) )
.forEach(({ desc, vueTarget }) => {
	describe(desc, () => {

		const files = defaultFilesFactory({ vueTarget });

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

							return createApp(options).then(app => mountApp(app));
						}
					`
				}
			});

			expect(output.filter(e => e.type === 'log').map(e => e.content).flat().join(',')).toBe('foo,bar,baz');

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

							return createApp(options).then((app) => {
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

		});


		test('error when using import/export in .js', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/test.js': `
						export function test() {
						}
					`,
					'/component.vue': `
						<script>
						  import './test.js'
						</script>
						<template>
						</template>
					`
				}
			});

			await expect(output.filter(e => e.type === 'pageerror' && e.text).map(e => e.text)[0]).toMatch(`SyntaxError: 'import' and 'export' may appear only with 'sourceType: "module"'`);

		});



		test('should handle src attribute', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/template.html': `
						<span class="test">
							Hello {{ abc }} !
						</span>
					`,

					'/styles.css': `
						.test {
							color: red
						}
					`,

					'/script.js': `
						export default {
							data() {
								return {
									abc: "World"
								}
							}
						}
					`,

					'/component.vue': `
						<template src='./template.html'></template>
						<style scoped src='./styles.css'></style>
						<script src="./script.js"></script>
					`
				}
			});

			await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
			await expect(page.$eval('#app .test', el => JSON.parse(JSON.stringify(getComputedStyle(el))))).resolves.toMatchObject( { color: 'rgb(255, 0, 0)' } );

		});



		test('should properly include svg image', async () => {


			const { page, output } = await createPage({
				files: {
					...files,

					'/image.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 125 80">
  <text y="75" font-size="100" font-family="serif"><![CDATA[10]]></text>
</svg>
					`.trim(),

					'/component.vue': `
						<template>
							<img :src="require('./image.svg')">
						</template>
					`,
					'/optionsOverride.js': `
						export default (options) => {

							options.additionalModuleHandlers = {
								'.svg': (source, path, options) => 'data:image/svg+xml,' + source,
							};
						};
					`,
				}
			});

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch('[CDATA[10]]');
		});


		// https://github.com/vuejs/vue-template-es2015-compiler/blob/master/test.js

		test('should pass vue-template-es2015-compiler test "should work"', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/component.vue': `
						<template>
							<div><div>{{ foo }}</div><div v-for="{ name } in items">{{ name }}</div><div v-bind="{ ...a, ...b }"/></div>
						</template>
						<script>
							export default {
								data() {

									return {
										foo: 'hello',
										items: [
											{ name: 'foo' },
											{ name: 'bar' }
										],
										a: { id: 'foo' },
										b: { class: 'bar' }
									}
								}
							}
						</script>
					`,
				}
			});

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`<div><div>hello</div><div>foo</div><div>bar</div><div id="foo" class="bar"></div></div>`);
		});


		test('should pass vue-template-es2015-compiler test "arg spread"', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/component.vue': `
						<template>
							 <button @click="(...args) => { store.foo(...args) }">Go</button>
						</template>
					`,
				}
			});

			// original Vue2 expected match: `_vm.store.foo.apply(_vm.store, args)`
			// Vue3 expected match: `_ctx.store.foo(...args)`
			await expect(page.$eval('#app', el => el.vueApp.$options.render.toString()) ).resolves.toMatch(`.store.foo(...args)`);
		});


		if ( vueTarget === 2 ) { // Vue 3 has no $scopedSlots

			test('should pass vue-template-es2015-compiler test "rest spread in scope position"', async () => {

				const { page, output } = await createPage({
					files: {
						...files,

						'/component.vue': `
							<template>
								<foo v-slot="{ foo, ...rest }">{{ rest }}</foo>
							</template>
							<script>
								export default {
									components: {
										foo: {
											render(h) {
												return h('div', this.$scopedSlots.default({
													foo: 1,
													bar: 2,
													baz: 3
												}))
											}
										}
									}
								}
							</script>
						`,
					}
				});

				await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch( JSON.stringify({ bar: 2, baz: 3 }, null, 2));
			});
		}

		if ( vueTarget === 2 ) { // Vue3 is not concerned

			test('should pass vue-template-es2015-compiler test "trailing function comma"', async () => {

				const { page, output } = await createPage({
					files: {
						...files,

						'/component.vue': `
							<template>
								<button @click="spy(1,)" />
							</template>
						`,
					}
				});

				await expect(page.$eval('#app', el => el.vueApp.$options.render.toString()) ).resolves.toMatch(`return _vm.spy(1);`);
			});
		}


		test('should pass vue-template-es2015-compiler test "v-model code"', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/component.vue': `
						<template>
							 <input v-model="text" />
						</template>
						<script>
							export default {
								data() {

									return {
										text: 'foo'
									}
								}
							}
						</script>
					`,
				}
			});

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`<input>`);
		});


	});


})
