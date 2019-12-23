const bot = require('./bot');
const fs = require('fs');
const images = './images/';
const pouch = require('./pouchDb');
const schedule = require('node-schedule');

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
