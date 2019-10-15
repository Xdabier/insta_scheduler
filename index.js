const bot = require('./bot');
const fs = require('fs');
const images = './images/';
const pouch = require('./pouchDb');

/*
puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.emulate(iPhone);
    await page.goto('https://www.instagram.com');
    // other actions...
    await page.screenshot({path: 'scr.png'});
    await browser.close();
});
*/

// bot.postOnInstagram().then(() => console.log('done')).catch((er) => console.log('err = ', er));

const runner = async () => {
    return await bot.postOnInstagram();
};

runner().then((res) => {
    console.log('work done = ', res);
}).catch((err) => {
    console.log('err runner = ', err);
});

