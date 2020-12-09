const Fs = require('fs');
const Path = require('path');
const puppeteer = require('puppeteer');
const mime = require('mime-types');


const local = new URL('http://local/');

async function getPage({ files }) {

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

	page.setDefaultTimeout(2000);


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

	page.console = [];

	//page.on('console', msg => page.console.push({ type: msg.type(), content: msg.text() }) );
	page.on('console', async msg => page.console.push({ type: msg.type(), content: await Promise.all( msg.args().map(e => e.jsonValue()) ) }) );
	page.on('pageerror', error => page.console.push({ type: 'pageerror', content: error }) );

	page.on('error', msg => console.log('ERROR', msg));

	//page.done = new Promise(resolve => page.exposeFunction('_done', resolve));

	await page.goto(new URL('/index.html', local));

	return page;
}

let browser;

beforeAll(async () => {

	browser = await puppeteer.launch({
		headless: !false,
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
	'/index.html': `
		<!DOCTYPE html>
		<html><body>
			<div id="app"></div>
			<script src="https://unpkg.com/vue@next"></script>
			<script src="vue3-sfc-loader.js"></script>
			<script>

				class HttpError extends Error {

					constructor(url, res) {

						super('HTTP error ' + res.statusCode);
						Error.captureStackTrace(this, this.constructor);

						// enumerable: default false
						Object.defineProperties(this, {
							name: {
								value: this.constructor.name,
							},
							statusCode: {
								value: res.statusCode,
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

				const { loadModule } = window['vue3-sfc-loader'];
				const app = Vue.createApp(Vue.defineAsyncComponent( () => loadModule('./component.vue', options) ));
				app.mount('#app');

				//window._done && window._done();

			</script>
		</body></html>
	`
}

module.exports = {
	defaultFiles,
	getPage,
}
