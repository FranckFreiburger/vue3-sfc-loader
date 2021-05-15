const Fs = require('fs');
const Path = require('path');
const puppeteer = require('puppeteer');
const mime = require('mime-types');

const local = new URL('http://local/');

// DEV
// 1/ call: DEV=1 yarn run tests
// 2/ use test.only(

const isDev = !!JSON.parse(process.env.DEV ?? 0);

if ( isDev )
	jest.setTimeout(1e9);


const pendingPages = [];

async function createPage({ files, processors= {}}) {

	async function getRequestResource(url) {

		const { origin, pathname } = new URL(url);

		if ( origin !== local.origin )
			return null

		let body = files[pathname]

		if ( body === undefined ) {
			
			return {
				status: 404,
			}
		}

		if ( typeof body !== 'string' && !(body instanceof Buffer) )
			throw new Error('response body must be a string of a Buffer');

		if (processors[pathname]) {

			body = processors[pathname](body)
		}

		const contentType = mime.lookup(Path.extname(pathname)) || '';
		const charset = mime.charset(contentType);

		const res = {
			contentType: contentType + (charset ? '; charset=' + charset : ''),
			body,
		};

		return res;
	}

	const page = await browser.newPage();
	page.setDefaultTimeout(3000);

	await page.setRequestInterception(true);
	page.on('request', async interceptedRequest => {
		try {
			const response = await getRequestResource(interceptedRequest.url());
			if (response)
				return void interceptedRequest.respond(response);

			interceptedRequest.continue();
		} catch (ex) {
			page.emit('pageerror', ex)
		}
	});

	const output = [];

	page.on('console', async msg => {

		const entry = { type: msg.type(), text: msg.text(), content: await Promise.all( msg.args().map(e => e.jsonValue()) ) };
		if ( isDev )
			console.log(expect.getState().currentTestName, entry);
		output.push(entry);
	} );

	page.on('pageerror', error => {

		// Emitted when an uncaught exception happens within the page.

		const entry = { type: 'pageerror', text: error.message, content: error };
		console.log(expect.getState().currentTestName, entry);
		output.push(entry);
	} );

	page.on('error', msg => {

		// Emitted when the page crashes.

		console.log(expect.getState().currentTestName, 'error', msg);
	});

	
	await page.goto(new URL('/index.html', local));

	await Promise.race([
		page.waitForTimeout(350),
		//page.waitForSelector('#done'),
		//new Promise(resolve => page.exposeFunction('_done', resolve)),
	]);

	pendingPages.push(page);

	return { page, output };
}


// close all pending pages from previous test
beforeEach(async () => {

	await Promise.all(pendingPages.map(e => e.isClosed() ? undefined : e.close()));
	pendingPages.length = 0;

});


// if dev, suspend on first test
afterEach(async () => {

	if ( isDev )
		await new Promise(() => {});

});


let browser;

beforeAll(async () => {

	if ( browser )
		return browser;

	browser = await puppeteer.launch({
		headless: !isDev,
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


const defaultFilesFactory = ({ vueTarget }) => ({

	[`/vue${ vueTarget }-sfc-loader.js`]: Fs.readFileSync(Path.join(__dirname, `../dist/vue${ vueTarget }-sfc-loader.js`), { encoding: 'utf-8' }),

	'/vue': Fs.readFileSync(Path.join(__dirname, [,,'../node_modules/vue2/dist/vue.runtime.js','../node_modules/vue/dist/vue.global.js'][vueTarget]), { encoding: 'utf-8' }),

	'/options.js': `

		class HttpError extends Error {
			constructor(url, res) {
				super('HTTP Error: ' + (res && res.statusCode ? res.statusCode : '(no status code)'));
				Error.captureStackTrace(this, this.constructor);

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

			async getFile(path) {
				//return fetch(path).then(res => res.ok ? res.text() : Promise.reject(new HttpError(path, res)));

				const res = await fetch(path);
				if ( !res.ok )
					throw new HttpError(path, res);

				return {
					//type: res.headers.get('content-type'),
					getContentData(asBinary) {

						return asBinary ? res.arrayBuffer() : res.text();
					}
				}

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


	'/optionsOverride.js': `
		export default () => {};
	`,

	'/boot.js': `
		export default ({ options, createApp, mountApp }) => createApp(options).then(app => mountApp(app));
	`,

	'/index.html': `
		<!DOCTYPE html>
		<html><body>
			<script src="vue"></script>
			<script src="vue${ vueTarget }-sfc-loader.js"></script>
			<!-- scripts -->
			<script type="module">

				import boot from '/boot.js'
				import options from '/options.js'
				import optionsOverride from '/optionsOverride.js'

				const { loadModule } = window['vue${ vueTarget }-sfc-loader'];

				function createApp(options) {

					switch ( ${ vueTarget } ) {
						case 3: {

							return loadModule('/main.vue', options).then((component) => Vue.createApp(component));
						}

						case 2: {

							return loadModule('/main.vue', options).then((component) => new Vue(component));
						}
					}
				}

				function mountApp(app, eltId = 'app') {

					switch ( ${ vueTarget } ) {
						case 3: {

							if ( !document.getElementById(eltId) ) {

								const parent = document.body;
								const elt = document.createElement('div');
								elt.id = eltId;
								parent.insertBefore(elt, parent.firstChild);
							}

							return app.mount('#' + eltId);
						}

						case 2: {

							const mountElId = eltId + 'Mount';

							if ( !document.getElementById(mountElId) ) {

								const parent = document.body;
								const appElt = document.createElement('div');
								appElt.id = eltId;

								const mountElt = document.createElement('div');
								mountElt.id = mountElId;

								appElt.insertBefore(mountElt, appElt.firstChild);
								parent.insertBefore(appElt, parent.firstChild);
							}

							return app.$mount('#' + mountElId);
						}
					}
				}

				optionsOverride(options)

				boot({ options, createApp, mountApp, Vue })
				.then(app => app && (app.$el.parentNode.vueApp = app));

			</script>
		</body></html>
	`,
});


module.exports = {
	defaultFilesFactory,
	createPage,
}
