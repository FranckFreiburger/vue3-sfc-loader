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

