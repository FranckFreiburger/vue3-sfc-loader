const Fs = require('fs');
const Path = require('path');
const puppeteer = require('puppeteer');
const mime = require('mime-types');

const local = new URL('http://local/');

const vueVersion = '3';

async function createPage({ files }) {

	async function getFile(url, encoding) {

		const { origin, pathname } = new URL(url);

		if ( origin !== local.origin )
			return null

		const res = {
			contentType: mime.lookup(Path.extname(pathname)) || '',
			body: files[pathname],
			status: files[pathname] === undefined ? 404 : 200,
		};

		return res;
	}

	const page = await browser.newPage();

	page.setDefaultTimeout(3000);


	await page.setRequestInterception(true);
	page.on('request', async interceptedRequest => {

		// console.log(interceptedRequest.url())

		try {

			const file = await getFile(interceptedRequest.url(), 'utf-8');
			if ( file !== null ) {

				return void interceptedRequest.respond({
					...file,
					contentType: file.contentType + '; charset=utf-8',
				});
			}

			interceptedRequest.continue();

		} catch (ex) {

			page.emit('pageerror', ex)
		}
	});

	const output = [];

	page.on('console', async msg => output.push({ type: msg.type(), content: await Promise.all( msg.args().map(e => e.jsonValue()) ) }) );
	page.on('pageerror', error => output.push({ type: 'pageerror', content: error }) );

	page.on('error', msg => console.log('ERROR', msg));

	//page.done = new Promise(resolve => page.exposeFunction('_done', resolve));

	await page.goto(new URL('/index.html', local));

	await new Promise(resolve => setTimeout(resolve, 250));

	return { page, output };
}

let browser;

beforeAll(async () => {

	if ( browser )
		return browser;

	browser = await puppeteer.launch({
		headless: true,
		pipe: true,
		args: [
			'--incognito',
			'--disable-gpu',
			'--disable-dev-shm-usage', // for docker
			'--disable-accelerated-2d-canvas',
			'--deterministic-fetch',
			'--proxy-server="direct://"',
			'--proxy-bypass-list=*',
		]
	});
});

afterAll(async () => {

	await browser.close();
});


const defaultFiles = {
	'/vue3-sfc-loader.js': Fs.readFileSync(Path.join(__dirname, '../dist/vue3-sfc-loader.js'), { encoding: 'utf-8' }),
	'/vue': Fs.readFileSync(Path.join(__dirname, '../node_modules/vue/dist/vue.global.js'), { encoding: 'utf-8' }),

	'/options.js': `

		class HttpError extends Error {

			constructor(url, res) {

				super('HTTP error ' + res.statusCode);
				Error.captureStackTrace(this, this.constructor);

				// enumerable: default false
				Object.defineProperties(this, {
					name: {
						value: this.constructor.name,
					},
					url: {
						value: url,
					},
					res: {
						value: res,
					},
				});
			}
		}


		const options = {

			moduleCache: {
				vue: Vue
			},

			getFile(path) {

				return fetch(path).then(res => res.ok ? res.text() : Promise.reject(new HttpError(path, res)));
			},

			addStyle(textContent) {

				const style = Object.assign(document.createElement('style'), { textContent });
				const ref = document.head.getElementsByTagName('style')[0] || null;
				document.head.insertBefore(style, ref);
			},

			log(type, ...args) {

				console[type](...args);
			}
		}

		export default options;
	`,

	'/boot.js': `
		export default ({ options, createApp, mountApp }) => mountApp( createApp(options) );
	`,

	'/index.html': `
		<!DOCTYPE html>
		<html><body>
			<script src="vue"></script>
			<script src="vue3-sfc-loader.js"></script>
			<script type="module">

				import boot from '/boot.js'
				import options from '/options.js'

				const { loadModule } = window['vue3-sfc-loader'];

				function createApp(options) {

					return Vue.createApp(Vue.defineAsyncComponent( () => loadModule('./component.vue', options) ));
				}

				function mountApp(app, eltId = 'app') {

					if ( !document.getElementById(eltId) ) {

						const parent = document.body;
						const elt = document.createElement('div');
						elt.id = eltId;
						parent.insertBefore(elt, parent.firstChild);
					}

					return app.mount('#' + eltId);
				}

				boot({ options, createApp, mountApp, Vue });

				//window._done && window._done();

			</script>
		</body></html>
	`
}

const defaultFilesVue2 = {
	'/vue2-sfc-loader.js': Fs.readFileSync(Path.join(__dirname, '../dist/vue2-sfc-loader.js'), { encoding: 'utf-8' }),
	'/vue2': Fs.readFileSync(Path.join(__dirname, '../node_modules/vue2/dist/vue.js'), { encoding: 'utf-8' }),
	'/optionsOverride.js': `
		export default () => {};
	`,
	'/appOverride.js': `
		export default () => {};
	`,
	'/index.html': `
		<!DOCTYPE html>
		<html><body>
			<div id="app"><div id="app-vue2"></div></div>
			<script src="vue2"></script>
			<script src="vue2-sfc-loader.js"></script>
			<script type="module">

				import optionsOverride from '/optionsOverride.js'
				import appOverride from '/appOverride.js'

				class HttpError extends Error {

					constructor(url, res) {

						super('HTTP error ' + res.statusCode);
						Error.captureStackTrace(this, this.constructor);

						// enumerable: default false
						Object.defineProperties(this, {
							name: {
								value: this.constructor.name,
							},
							url: {
								value: url,
							},
							res: {
								value: res,
							},
						});
					}
				}


				const options = {

					moduleCache: {
						vue: Vue
					},

					getFile(path) {

						return fetch(path).then(res => res.ok ? res.text() : Promise.reject(new HttpError(path, res)));
					},

					addStyle(textContent) {

						const style = Object.assign(document.createElement('style'), { textContent });
						const ref = document.head.getElementsByTagName('style')[0] || null;
						document.head.insertBefore(style, ref);
					},

					log(type, ...args) {

						console[type](...args);
					}
				}

				optionsOverride(options);

				const { loadModule } = window['vue2-sfc-loader'];
				loadModule('./component.vue', options).then((component) => {
			        const app = new Vue(component).$mount('#app-vue2')
			        appOverride(app);
				});

				//window._done && window._done();

			</script>
		</body></html>
	`
}

module.exports = {
	defaultFiles,
	defaultFilesVue2,
	createPage,
}
