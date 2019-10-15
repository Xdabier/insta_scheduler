const puppeteer = require('puppeteer'),
    devices = require('puppeteer/DeviceDescriptors'),
    iPhone = devices['iPhone 6'],
    pouchDb = require('./pouchDb'),
    fs = require('fs'),
    imagesFolder = './images/',
    config = require('./config');

async function writeAltText(page) {
    await page.waitFor(2000);
    await page.click(config.selectors.advanced_settings);
    await page.waitFor(2000);
    await page.click(config.selectors.write_alt_text_button);
    await page.waitFor(2000);
    await page.click(config.selectors.alt_text_field);
    await page.keyboard.type(config.alt_text);

    for (let i = 0; i < 2; i++) {
        await page.waitFor(1000);
        await page.click(config.selectors.back_button);
    }
}

// return the first file in the images folder that doesn't exist in pouchdb!
const chooseFile = async (filesList = []) => {
    try {
        let postedFiles = await pouchDb.getPosts();
        console.log(postedFiles.rows[0]);
        if (postedFiles.total_rows > 0) {
            for (let i = 0; i < filesList.length; i++) {
                if (postedFiles.rows.findIndex(x => filesList[i] === x.doc.name) < 0) {
                    console.log(filesList[i]);
                    return filesList[i];
                }
            }
        } else {
            return filesList[0];
        }
    } catch (e) {
        console.log('error choosing file = ', e);
        if (e.status === 404)
            return filesList[0];
    }
};

// to make sure the returned hash-tag doesn't exist in the array already
const getUniqueElement = (array = []) => {
    let element = config.hashtags[Math.floor(Math.random() * config.hashtags.length)];
    if (array.findIndex(x => x === element) === -1) {
        return element;
    }
};


// returns a string with random hash-tags from the config file
const generateHastags = () => {
    let newHash = [];
    for (let i = 0; i < 20; i++) {
        const el = getUniqueElement(newHash);
        if (el) {
            newHash[i] = el;
        }
    }
    return '#' + newHash.filter((x) => x !== undefined).join(' #');
};

async function writeCaption(page) {
    await page.waitFor(2000);
    await page.click(config.selectors.caption_textarea);
    await page.keyboard.type(config.captions[0]);
    await page.click(config.selectors.share_button);
    await page.waitForNavigation();
}

async function removePopUps(page) {
    //Close Turn On Notification modal after login
    if (await page.$(config.selectors.not_now_button) !== null) {
        console.log('save login dialog found --- clicking .. ');
        await page.click(config.selectors.not_now_button);
    } else console.log('save login dialog not found --- not clicking! :/ passing it so ... ');

    await page.waitFor(3500);
    if (await page.$(config.selectors.no_home_screen_button) !== null) {
        console.log('add to home screen dialog found --- clicking .. ');
        await page.click(config.selectors.no_home_screen_button);
    } else console.log('add to home screen dialog not found --- not clicking! :/ passing it so ... ');
}

async function loginAndLoadHomePage(page) {
    await page.emulate(iPhone);
    await page.goto(config.base_url, {
        "waitUntil": ["load", "networkidle2"]
    });
    await page.waitFor(2500);

    /* Click on the username field using the field selector*/
    await page.click(config.selectors.username_field);
    await page.keyboard.type(config.username);
    await page.click(config.selectors.password_field);
    await page.keyboard.type(config.password);
    await page.click(config.selectors.login_button);
    await page.waitForNavigation();

    await removePopUps(page);

    console.log('home page loaded!!');
    return true;
}

const clickOnNext = async (page) => {
    try {
        await page.click(config.selectors.next_button);
        return true;
    } catch (e) {
        console.log('not found next btn! .. re-clicking!', e);
        await page.waitFor(1000);
        await clickOnNext(page);
    }
};

async function chooseFileAndPost(page) {
    try {
        if (await page.$(config.selectors.new_post_button)) {
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser(),
                page.click(config.selectors.new_post_button)
            ]);
            fs.readdir(imagesFolder, async (err, files) => {
            });
                await fileChooser.accept(['./images/1.jpg']);
            // await page.click(config.selectors.new_post_button);
            // const input = await page.$(config.selectors.file_input);
            // await input.uploadFile('./images/1.jpg');
            console.log('file chosen');

            await clickOnNext(page);
            await writeAltText(page);
            await writeCaption(page);
            console.log('posted picture!')
        } else {
            console.log('did not find button!');
            await removePopUps(page);
            await chooseFileAndPost(page);
        }
    } catch (e) {
        console.log('err posting file = ', e)
    }
}

async function postOnInstagram() {
    puppeteer.launch({headless: false, args: ['--no-sandbox']}).then(async (browser) => {
        const page = await browser.newPage();
        await loginAndLoadHomePage(page);

        await chooseFileAndPost(page);

    }).catch((err) => {
        console.log('couldn\'t launch!! === ', err)
    });
}

module.exports = {postOnInstagram, chooseFile};
