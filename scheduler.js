const bot = require('./bot');
const fs = require('fs');
const images = './images/';
const pouch = require('./pouchDb');
const schedule = require('node-schedule');

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

const rule = new schedule.RecurrenceRule();

rule.minute = 15;
rule.hour = [3, 4, 7, 20, 21];


const runner = async () => {
    return await bot.postOnInstagram();
};
(() => {
schedule.scheduleJob(rule, () => {
	console.log('running');
	runner().then((res) => {
    		console.log('work done = ', res);
        }).catch((err) => {
	    console.log('err runner = ', err);
	});

});

})();
