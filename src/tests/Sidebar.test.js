const puppeteer = require('puppeteer');
const path = require('path');
const EXTENSION_PATH = path.resolve(__dirname, '../../dist');let browser;
let page;
let EXTENSION_ID;

beforeEach(async() => {
    browser = await puppeteer.launch({
        headless:false,
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

test('Sidebar renders TaskSection correctly', async () => {
    const sidebar = await page.$('.sidebar.container.p-3');
    expect(sidebar).not.toBeNull();

    const taskSection = await page.$('.sidebar.container.p-3 > div');
    expect(taskSection).not.toBeNull();
});

test("Sidebar renders TaskSection with key elements", async () => {
    await page.waitForSelector(".sidebar.container.p-3", { timeout: 5000 });
  
    const inputBar = await page.$(".input-bar");
    expect(inputBar).not.toBeNull();
  
    const todoList = await page.$(".todo-list");
    expect(todoList).not.toBeNull();
  
    const saveTasksButton = await page.$('button[id="save-tasks"]');
    expect(saveTasksButton).not.toBeNull();   
  });

