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

(async () => {
    fs.readdir(images, async (err, files) => {
        try {
            let file = await bot.chooseFile(files);
            console.log('file to upload = ', file);
            let uploaded = await pouch.addPost(file);
            console.log('file uploaded = ', uploaded);
            file = await bot.chooseFile(files);
            console.log('file to upload = ', file);
        } catch (e) {
            console.log('err = ', e)
        }
    });
})();

