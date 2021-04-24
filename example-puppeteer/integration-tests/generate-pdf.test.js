const fs = require('fs');
const path = require('path');
const utils = require('util');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const readFile = utils.promisify(fs.readFile);
const assert = require('assert');

let browser;
let page;

const configPuppeter = {
	args: [
		// Required for Docker version of Puppeteer
		'--no-sandbox',
		'--disable-setuid-sandbox',
		// This will write shared memory files into /tmp instead of /dev/shm,
		// because Docker’s default for /dev/shm is 64MB
		'--disable-dev-shm-usage',
	],
};

before(async () => {
	browser = await puppeteer.launch(configPuppeter);
	const browserVersion = await browser.version();
	console.log(`Started ${browserVersion}`);
});

// beforeEach(async () => {
// 	page = await browser.newPage();
// });

// afterEach(async () => {
// 	await page.close();
// });

after(async () => {
	await browser.close();
});

describe('App', () => {
	it('download template pdf', async () => {
		
		await generatePdf();
	});
});

async function getTemplateHtml() {
	try {
		const invoicePath = path.resolve('./integration-tests/invoice.html');
		return await readFile(invoicePath, 'utf8');
	} catch (err) {
		return Promise.reject('Could not load html template');
	}
}
async function generatePdf() {
	let data = {};
	await getTemplateHtml()
		.then(async (res) => {
			const template = handlebars.compile(res, { strict: true });
			const result = template(data);
			const html = result;
			page = await browser.newPage();
			await page.setContent(html);
			await page.pdf({ path: `/screenshots/invoice.pdf`, format: 'A4' });
			await page.close();
		})
		.catch((err) => {
			console.error(err);
		});
}