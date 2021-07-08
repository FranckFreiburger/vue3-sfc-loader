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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
						<script>
							test(
						</script>
					`
				}
			});

			await expect(output.some(e => e.type === 'error' && e.content[0] === 'parse script')).toBe(true);

		});


		test('all blocks', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
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
					'/main.vue': `
						<script>
							require('empty.mjs');
						</script>
					`
				}
			});

			await expect(output.filter(e => e.type === 'pageerror' && e.text).map(e => e.text)[0]).toMatch('HttpError');

		});


		test('DOM has scope', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
		        '/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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
					'/main.vue': `
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


		test('custom template language with sync buildTemplateProcessor (sync)', async () => {
			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
						<template lang="custom">
							<span>Hello World !</span>
						</template>
					`,
					'/optionsOverride.js': `
						const { buildTemplateProcessor } = window['vue${ vueTarget }-sfc-loader'];
					
						export default (options) => {
							options.moduleCache.custom = buildTemplateProcessor(s => s.replace("Hello World !", "Custom Hello World !"))
						};
					`,
				}
			});

			await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Custom Hello World !');

			await page.close();
		});


		if ( vueTarget !== 3 ) {

			// Vue3 doesn't support async template engine
			// https://github.com/vuejs/vue-next/blob/1fb6fbc8b8c8225441fb23918f128f7994c365ca/packages/compiler-sfc/src/compileTemplate.ts#L82-L85
			test('custom template language with buildTemplateProcessor (async)', async () => {
				const { page, output } = await createPage({
					files: {
						...files,
						'/main.vue': `
							<template lang="custom">
								<span>Hello World !</span>
							</template>
						`,
						'/optionsOverride.js': `
							const { buildTemplateProcessor } = window['vue${ vueTarget }-sfc-loader'];
						
							export default (options) => {
								options.moduleCache.custom = buildTemplateProcessor(s => new Promise((resolve, reject) => {
									resolve(s.replace("Hello World !", "Custom Hello World !"))
							}))};
						`,
					}
				});

				await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Custom Hello World !');

				await page.close();
			});
		}


		test('custom style language', async () => {
			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
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
					'/main.vue': `
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

					'/main.vue': `
						<template src='./template.html'></template>
						<style scoped src='./styles.css'></style>
						<script src="./script.js"></script>
					`
				}
			});

			await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
			await expect(page.$eval('#app .test', el => getComputedStyle(el).color)).resolves.toBe('rgb(255, 0, 0)');

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

					'/main.vue': `
						<template>
							<img :src="require('./image.svg')">
						</template>
					`,
					'/optionsOverride.js': `
						export default (options) => {

							options.handleModule = async (type, getContentData, path, options) => {

								switch (type) {
									case '.svg': return 'data:image/svg+xml,' + await getContentData(false);
								}
							};
						};
					`,
				}
			});

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch('[CDATA[10]]');
		});

		test('should properly include png image', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/image.png': Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAUAAAAHCAAAAADlzNgyAAAAEklEQVQI12P8z8DAwMDEQJgEAConAQ0Jet0iAAAAAElFTkSuQmCC', 'base64'),

					'/main.vue': `
						<template>
							<div>
								<img :src="require('./image.png')">
							</div>
						</template>
					`,
					'/optionsOverride.js': `
						export default (options) => {

							options.handleModule = async (type, getContentData, path, options) => {

								switch (type) {
									case '.png':
										var data = await getContentData(true);
										return 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(data)));
								}
							};
						};
					`,
				}
			});

			await expect(page.$eval('#app img', el => el.naturalWidth)).resolves.toBe(5); // img is 5x7 px
		});


		// https://github.com/vuejs/vue-template-es2015-compiler/blob/master/test.js

		test('should pass vue-template-es2015-compiler test "should work"', async () => {

			const { page, output } = await createPage({
				files: {
					...files,

					'/main.vue': `
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

					'/main.vue': `
						<template>
							<div id="result">{{ JSON.stringify( ((...args) => args)(1,2,3) ) }}</div>
						</template>
					`,
				}
			});

			// original Vue2 expected match: `_vm.store.foo.apply(_vm.store, args)`
			// Vue3 expected match: `_ctx.store.foo(...args)`
			await expect(page.$eval('#result', el => el.textContent)).resolves.toMatch('[1,2,3]');
		});


		if ( vueTarget === 2 ) { // Vue 3 has no $scopedSlots

			test('should pass vue-template-es2015-compiler test "rest spread in scope position"', async () => {

				const { page, output } = await createPage({
					files: {
						...files,

						'/main.vue': `
							<template>
								<foo v-slot="{ foo, ...rest }">{{ JSON.stringify(rest) }}</foo>
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

				await expect(page.$eval('#app div', el => el.innerHTML)).resolves.toMatch( JSON.stringify({ bar: 2, baz: 3 }));
			});
		}

		if ( vueTarget === 2 ) { // Vue3 is not concerned

			test('should pass vue-template-es2015-compiler test "trailing function comma"', async () => {

				const { page, output } = await createPage({
					files: {
						...files,

						'/main.vue': `
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

					'/main.vue': `
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

		test('should support OptionalMemberExpression in template', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
						<template>
							<div>
								<span v-if="foo?.bar?.baz === 123">ok1</span>
								<span v-if="foo?.bar?.['baz'] === 123">ok1a</span>

								<span v-if="foo.bar?.baz === 123">ok2</span>
								<span v-if="foo.bar?.['baz'] === 123">ok2a</span>

								<span v-if="foo?.baz === undefined">ok3</span>
								<span v-if="foo?.['baz'] === undefined">ok3a</span>
							</div>
						</template>
						<script>
							export default {
								data() {

									return {
										foo: {
											bar: {
												baz: 123,
											}
										}
									}
								}
							}
						</script>
					`,
				}
			});

			//await new Promise(resolve => setTimeout(resolve, 1000));

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok1`);
			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok1a`);
			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok2`);
			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok2a`);
			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok3`);
			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch(`ok3a`);
		});


		test('should handle JSX', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': `
						<script>
							export default {
								render() {
									return <div>123</div>;
								},
							}
						</script>
					`,
				}
			});

			await expect(page.$eval('#app', el => el.innerHTML)).resolves.toMatch('123');
		});


		if ( vueTarget === 3 ) { // Vue 2 does not handle cssVars

			test('should handle cssVars', async () => {

				const { page, output } = await createPage({
					files: {
						...files,

						'/main.vue': `

							<template>
							  Hello <span class="example">{{ msg }}</span>
							</template>
							<script>
							  export default {
							    data () {
							      return {
							        msg: 'World !',
							        color: 'blue',
							      }
							    }
							  }
							</script>
							<style scoped>
							  .example {
							    color: v-bind('color')
							  }
							</style>

						`
					}
				});

				await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
				await expect(page.$eval('#app .example', el => getComputedStyle(el).color)).resolves.toBe('rgb(0, 0, 255)');

			});
		}


		test('should have correct vue version', async () => {

			const { page, output } = await createPage({
				files: {
					...files,
					'/main.vue': '',
				}
			});

			const versions = await page.evaluate('[window["vue'+ vueTarget +'-sfc-loader"]?.vueVersion, Vue.version]');
			await expect(versions[0]).toBe(versions[1]);
		});

		if ( vueTarget === 3 ) { // Vue 3 does not have <script setup>
		
			test('should properly handle components in <script setup>', async () => {

				const { page, output } = await createPage({
					files: {
						...files,
						'/main.vue': `
							<template>a<comp/>e</template>
							<script setup>
								import comp from "./comp.vue";
							</script>
						`,
						'/comp.vue': `
							<template>b{{ foo }}d</template>
							<script setup>
								const foo = 'c'
							</script>
						`,
					}
				});

				await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('abcde');
			});
		}


		test('should resolve path consistently', async () => {

			// pathHandlers.resolve({ refPath: '', relPath: './main.vue' }) -> 'component.vue'
			// pathHandlers.resolve({ refPath: '/', relPath: './main.vue' }) -> './main.vue'

			const { page, output } = await createPage({
				files: {
					...files,
					'/optionsOverride.js': `

						const myFiles = {
							'/main.vue': '<template><span>hello</span></template>',
						}
					
						export default (options) => {
							
							options.getFile = (path) => {

								if ( path in myFiles )
									return Promise.resolve(myFiles[path]);
								
								return Promise.reject(new HttpError(path, '404'));
							}
						};
					`,
				}
			});

			await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('hello');
		});

	});


})
