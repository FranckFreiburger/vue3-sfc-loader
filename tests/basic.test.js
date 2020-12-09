const {	defaultFiles,	getPage } = require('./testsTools.js');

test('text-only tamplate', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World ! <b id="done"/>
				</template>
			`
		}
	});

	await page.waitForSelector('#done');
	await expect(page.$eval('#app', el => el.textContent.trim())).resolves.toBe('Hello World !');
	await page.close();
});


test('properly detect and reports errors in template', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World ! {{ msg } <b id="done"/>
				</template>
			`
		}
	});

	await page.waitForSelector('#done');
	await expect(page.console.some(e => e.type === 'error' && e.content[0] === 'SFC template')).toBe(true);
	await page.close();
});


test('properly detect and reports errors in style', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					Hello World ! <b id="done"/>
				</template>
				<style>
					body
						color: red;
					}
				</style>
			`
		}
	});

	await page.waitForSelector('#done');
	await expect(page.console.some(e => e.type === 'error' && e.content[0] === 'SFC style')).toBe(true);
	await page.close();
});


test('properly detect and reports errors in script', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					test(
				</script>
			`
		}
	});

	await new Promise(resolve => setTimeout(resolve, 500));
	await expect(page.console.some(e => e.type === 'error' && e.content[0] === 'SFC script')).toBe(true);
	await page.close();
});



test('all blocks', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<template>
					<b>Hello {{ msg }} !</b><b id="done"/>
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

	await new Promise(resolve => setTimeout(resolve, 500));
	await expect(!page.console.some(e => e.type === 'error')).toBe(true);
	await page.close();
});


test('invalid require', async () => {

	const page = await getPage({
		files: {
			...defaultFiles,
			'/component.vue': `
				<script>
					require('empty.mjs');
				</script>
			`
		}
	});

	await new Promise(resolve => setTimeout(resolve, 1500));
	await expect(page.console.some(e => e.type === 'pageerror' && String(e.content).includes('HttpError') )).toBe(true);
	await page.close();
});

