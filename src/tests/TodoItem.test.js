const puppeteer = require('puppeteer');
const path = require('path');
const { render } = require('@testing-library/react');

const EXTENSION_PATH = path.resolve(__dirname, '../../dist');
let browser;
let page;
let EXTENSION_ID;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,
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
    await browser.close();
});

test('renders task details correctly', async () => {
    const taskTitle = 'Test Task';
    const today = new Date(); 
    today.setHours(23, 59, 0, 0);
    const formattedToday = today.toLocaleString('en-US', { hour12: true });

    await page.type('input[placeholder="Task title"]', taskTitle);
    
    const todayPresetSelector = '.preset-date-btn'; 
    await page.evaluate(() => {
        document.querySelector('.preset-date-btn').click();
    });

    await page.click('button.change-btn'); 
    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const renderedTitle = await page.$eval('.todo-item .task-text', (el) => el.textContent.trim());
    expect(renderedTitle).toContain(taskTitle);

    const renderedDueDate = await page.$eval('.todo-item .text-muted', (el) => el.textContent.trim());
    expect(renderedDueDate).toBe(`Due: ${formattedToday}`)
});


test('toggles task reminders correctly', async () => {
    await page.type('input[placeholder="Task title"]', 'Task with Reminder');
    await page.click('button.change-btn');
    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const taskText = await page.$eval('.todo-item .task-text', (el) =>
        Array.from(el.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent.trim())
            .join('')
    );
    expect(taskText).toBe('Task with Reminder');

    const reminderButton = await page.$('.todo-item .btn[title="Toggle Reminder"]');
    await reminderButton.click();
    const reminderSet = await page.$eval('.todo-item .btn[title="Toggle Reminder"]', (el) => !!el);
    expect(reminderSet).toBe(true);
    // toggle reminder OFF
    await reminderButton.click();
    const reminderUnset = await page.$eval('.todo-item .btn[title="Toggle Reminder"] svg.text-warning', (el) => !el).catch(() => false);
    expect(reminderUnset).toBe(false);
});

test('deletes a task correctly', async () => {
    await page.type('input[placeholder="Task title"]', 'Task to Delete');
    await page.click('button.change-btn');

    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const taskCountBeforeDelete = await page.$$eval('.todo-item', (items) => items.length);
    expect(taskCountBeforeDelete).toBe(1);

    await page.click('.todo-item .btn[title="Delete Task"]');

    const taskCountAfterDelete = await page.$$eval('.todo-item', (items) => items.length);
    expect(taskCountAfterDelete).toBe(0);
});

test('triggers edit functionality when the edit button is clicked', async () => {
    await page.type('input[placeholder="Task title"]', 'Task to Edit');
    await page.click('button.change-btn');

    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const taskId = await page.$eval('.todo-item', (item) => item.getAttribute('data-key'));

    const consoleLogs = [];
    page.on('console', (message) => {
        if (message.type() === 'log') {
            consoleLogs.push(message.text());
        }
    });
    const editButton = await page.$('.todo-item .btn[title="Edit Task"]');
    await editButton.click();

    const expectedLog = `TODO implement Edit task with ID: ${taskId}`;
    expect(consoleLogs).toContain(expectedLog);
});
