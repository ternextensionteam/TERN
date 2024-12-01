const puppeteer = require('puppeteer');
const path = require('path');

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

test("renders the InputBar component correctly", async () => {
    const taskInput = await page.$("input[placeholder='Task title']");
    expect(taskInput).toBeTruthy();

    const taskHeading = await page.$eval("h2.task-heading", (el) => el.textContent);
    expect(taskHeading).toBe("Add New To-Do List Task");

    const presetButtons = await page.$$eval(".preset-date-btn", (els) => els.length);
    expect(presetButtons).toBe(3);

    const addButton = await page.$("button.change-btn");
    expect(addButton).toBeTruthy();
});

test("allows user to input a task title", async () => {
const taskInput = await page.$("input[placeholder='Task title']");
await taskInput.type("Test Task");

const inputValue = await page.$eval("input[placeholder='Task title']", (el) => el.value);
expect(inputValue).toBe("Test Task");
});

test("handles preset selection and updates due date and time", async () => {
const todayPreset = await page.$(".preset-date-btn");
await todayPreset.click();

const checkedRadio = await page.$eval("input[type='radio']:checked", (el) => el.value);
expect(checkedRadio).toContain("23:59"); 
});

test("toggles the reminder checkbox", async () => {
const reminderCheckboxSelector = "input#reminder-checkbox";
const reminderLabelSelector = ".bell-checkbox";

const checkboxExists = await page.evaluate(() => !!document.querySelector("input#reminder-checkbox"));
expect(checkboxExists).toBe(true);

await page.waitForSelector(reminderLabelSelector);

await page.click(reminderLabelSelector);
const uncheckedState = await page.$eval(reminderCheckboxSelector, (el) => el.checked);
expect(uncheckedState).toBe(false);

await page.click(reminderLabelSelector);
const checkedState = await page.$eval(reminderCheckboxSelector, (el) => el.checked);
expect(checkedState).toBe(true);
});


test("submits a task with the correct values", async () => {
const taskInputSelector = "input[placeholder='Task title']";
const addTaskButtonSelector = "button.change-btn";

await page.waitForSelector(taskInputSelector);
await page.type(taskInputSelector, "Test Task");
await page.click(addTaskButtonSelector);

const inputValue = await page.$eval(taskInputSelector, (el) => el.value);
expect(inputValue).toBe("");
});


test("clears the form after submission", async () => {
    const taskInputSelector = "input[placeholder='Task title']";
    const reminderLabelSelector = ".bell-checkbox";
    const reminderCheckboxSelector = "input#reminder-checkbox";
    const addTaskButtonSelector = "button.change-btn";
  
    await page.waitForSelector(taskInputSelector);
    await page.type(taskInputSelector, "Another Test Task");
    await page.click(reminderLabelSelector);
    await page.click(addTaskButtonSelector);
  
    const inputValue = await page.$eval(taskInputSelector, (el) => el.value);
    expect(inputValue).toBe("");
  
    const reminderCheckboxState = await page.$eval(reminderCheckboxSelector, (el) => el.checked);
    expect(reminderCheckboxState).toBe(true);
  });