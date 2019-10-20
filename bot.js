
const puppeteer = require('puppeteer-core'),
    devices = require('puppeteer-core/DeviceDescriptors'),
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
    await page.keyboard.type(config.captions[Math.floor(Math.random() * config.captions.length)] + ". Get your coconutbowl TODAY! 🥥 💚 😍 LINK IN BIO! .... " + "   " + generateHastags());
    await page.click(config.selectors.share_button);
    await page.waitForNavigation();
}

async function removePopUps(page) {
    //Close Turn On Notification modal after login
    if (await page.$(config.selectors.not_now_button) !== null) {
        console.log('save login dialog found --- clicking .. ');
        await page.click(config.selectors.not_now_button);
    } else console.log('save login dialog not found --- not clicking! :/ passing it so ... ');

    await page.waitFor(5000);
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
	await page.waitFor(4000);
        const fileInput = await page.$(config.selectors.file_input);
        if (await page.$(config.selectors.new_post_button) && (await page.$(config.selectors.no_home_screen_button) === null)) {

            // const [fileChooser] = await Promise.all([
                // page.waitForFileChooser(),
               await page.click(config.selectors.new_post_button)
            // ]);
            let file = '';

            fs.readdir(imagesFolder, async (err, files) => {
               if (!err) {
		file = await chooseFile(files);
		console.log(file);
	        // await fileChooser.cancel();
		// await page.keyboard.press('Escape');
		await fileInput.uploadFile(imagesFolder + file);
	       } else {console.log(err)}
            });
		await page.waitFor(5000);
            // const input = await page.$(config.selectors.file_input);
            // await input.uploadFile('./images/1.jpg');
            console.log(file ? 'file chosen' : 'no more files!');
            if (file.length > 1) {
        	await clickOnNext(page);
            	await writeAltText(page);
            	await writeCaption(page);
            	console.log('posted picture!');
            	await pouchDb.addPost(file);
            	console.log('posted and saved!');
            	return true;
	    } else return false;
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
    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    let loaded = await loginAndLoadHomePage(page);
    let posted = false;
    if (loaded)
        posted = await chooseFileAndPost(page);
    if (posted) {
        await browser.close();
        return 'posted!';
    } else {
    await browser.close();
    return 'no more files';
    }
}

module.exports = {postOnInstagram, chooseFile};
