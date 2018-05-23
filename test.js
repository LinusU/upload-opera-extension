const puppeteer = require('puppeteer')

async function runTest() {

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://addons.opera.com');

    var buttonInner = await page.evaluate(() => document.querySelector('a.all').innerText);

    console.log('Link text: ', buttonInner);

    await browser.close()
}

runTest().then(resp => {
    console.log('Done: ', resp);
}).catch(err => {
    console.error('Error: ', err);
});