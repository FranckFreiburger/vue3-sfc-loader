const Fs = require('fs');
const Path = require('path');
const puppeteer = require('puppeteer');
const mime = require('mime-types');

const local = new URL('http://local/');

async function createPage({ files, processors= {} }) {

	async function getFile(url) {

		const { origin, pathname } = new URL(url);

		if ( origin !== local.origin )
			return null

		let body = files[pathname]
		if (processors[pathname]) {
			body = processors[pathname](body)
		}

		const res = {
			contentType: mime.lookup(Path.extname(pathname)) || '',
			body,
			status: files[pathname] === undefined ? 404 : 200,
		};

		return res;
	}

	const page = await browser.newPage();
	page.setDefaultTimeout(3000);

	await page.setRequestInterception(true);
	page.on('request', async interceptedRequest => {
		try {

			const file = await getFile(interceptedRequest.url(), 'utf-8');
			if (file) {
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

	page.on('console', async msg => {
		console.log(msg)
		output.push({ type: msg.type(), text: msg.text(), content: await Promise.all( msg.args().map(e => e.jsonValue()) ) })
	} );
	page.on('pageerror', error => {
		console.log(error)
		output.push({ type: 'pageerror', content: error })
	} );

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
	'/optionsOverride.js': `
		export default () => {};
	`,
	'/boot.js': `
		export default ({ options, createApp, mountApp }) => mountApp( createApp(options) );
	`,

	'/index.html': `
		<!DOCTYPE html>
		<html><body>
			<script src="vue"></script>
			<script src="vue3-sfc-loader.js"></script>
			<!-- scripts -->
			<script type="module">

				import boot from '/boot.js'
				import options from '/options.js'
				import optionsOverride from '/optionsOverride.js'

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
				
				optionsOverride(options)

				boot({ options, createApp, mountApp, Vue });

				//window._done && window._done();

			</script>
		</body></html>
	`
}

const defaultFilesVue2 = {
	'/vue2-sfc-loader.js': Fs.readFileSync(Path.join(__dirname, '../dist/vue2-sfc-loader.js'), { encoding: 'utf-8' }),
	'/vue': Fs.readFileSync(Path.join(__dirname, '../node_modules/vue2/dist/vue.js'), { encoding: 'utf-8' }),
	'/options.js': defaultFiles['/options.js'],
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
			<script src="vue2-sfc-loader.js"></script>
			<!-- scripts -->
			<script type="module">
			
				import boot from '/boot.js'
				import options from '/options.js'
				import optionsOverride from '/optionsOverride.js'

				const { loadModule } = window['vue2-sfc-loader'];

				function createApp(options) {
					return loadModule('./component.vue', options).then((component) => new Vue(component));
				}

				function mountApp(app, eltId = 'app') {
				  
				  const mountElId = eltId + 'Mount'
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

				optionsOverride(options)

				boot({ options, createApp, mountApp, Vue });

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
