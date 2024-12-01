const puppeteer = require('puppeteer');
const path = require('path');
const EXTENSION_PATH = path.resolve(__dirname, '../../dist');
let browser;
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
    await browser.close();
});

test('renders InputBar, TodoList, and Save Tasks button correctly', async () => {
    await page.waitForSelector('.sidebar.container.p-3', { timeout: 5000 });

    const inputBarExists = await page.$('.input-bar');
    expect(inputBarExists).not.toBeNull();

    const todoListExists = await page.$('.todo-list');
    expect(todoListExists).not.toBeNull(); 

    const saveTasksButtonExists = await page.$('#save-tasks');
    expect(saveTasksButtonExists).not.toBeNull(); 

    const saveTasksButtonText = await page.$eval('#save-tasks', (el) => el.textContent.trim());
    expect(saveTasksButtonText).toBe('Save Tasks'); 
});


test('adds a task and renders it in the task list', async () => {
    const taskTitle = 'New Task';
    
    await page.type('input[placeholder="Task title"]', taskTitle);
    await page.click('button.change-btn'); 
    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    const renderedTaskTitle = await page.$eval('.todo-item .task-text', (el) => el.textContent.trim());
    expect(renderedTaskTitle).toContain(taskTitle);
});


test('saves tasks correctly when clicking Save Tasks', async () => {
    const taskTitle = 'Task to Save';
    await page.type('input[placeholder="Task title"]', taskTitle);
    await page.click('button.change-btn'); 
    await page.waitForSelector('.todo-list .todo-item', { timeout: 5000 });

    await page.click('#save-tasks');

    const savedTasks = await page.evaluate(() => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['tasks'], (result) => {
                resolve(result.tasks || []);
            });
        });
    });

    const savedTaskTitles = savedTasks.map((task) => task.text);
    expect(savedTaskTitles).toContain(taskTitle);
});