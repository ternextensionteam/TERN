const puppeteer = require('puppeteer');
const path = require('path');
const EXTENSION_PATH = path.resolve(__dirname, '../../dist');
let browser;
let page;
let EXTENSION_ID;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
        ],
    });

    page = await browser.newPage();
    await page.goto('chrome://extensions');

    EXTENSION_ID = await page.evaluate(() => {
        const extensionsItemElement = document.querySelector('body > extensions-manager')
            ?.shadowRoot.querySelector('#items-list')
            ?.shadowRoot.querySelector('extensions-item');

        return extensionsItemElement ? extensionsItemElement.getAttribute('id') : null;
    });

    const extensionURL = `chrome-extension://${EXTENSION_ID}/index.html`;
    await page.goto(extensionURL);
});

afterEach(async () => {
    if (browser) {
        await browser.close();
        browser = null;
    }
});

test('renders tasks correctly', async () => {
    await page.waitForSelector('.todo-list', { timeout: 5000 });

    await page.type('input[placeholder="Task title"]', 'Task 1');
    await page.click('button.change-btn');
    await page.type('input[placeholder="Task title"]', 'Task 2');
    await page.click('button.change-btn');
    
    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const renderedTasks = await page.$$eval('.todo-list .todo-item', (items) =>
        items.map((item) => ({
            text: item.querySelector('.task-text').childNodes[0].textContent.trim(),
        }))
    );

    const expectedTasks = [{ text: 'Task 1' }, { text: 'Task 2' }];

    expect(renderedTasks).toEqual(expectedTasks);
});
