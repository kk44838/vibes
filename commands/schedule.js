const { SlashCommandBuilder } = require('@discordjs/builders');
const { Options } = require('discord.js');
const deadlineHelper = require('../helpers/deadlineHelper.js');
const moment = require('moment');

function deadlinesToString(deadlines) {
    console.log(`deadlinestostring ${deadlines}`)
    let msg = 'UPCOMING DEADLINES:' + '\n';
    deadlines.forEach(deadline => {
        msg += deadline.name + ' ' +  deadline.time + '\n';
    });
    console.log(msg)
    return msg
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('See all upcoming deadlines'),
	async execute(interaction) {
        
        const deadlines = await deadlineHelper.viewDeadlines();
        console.log(deadlines)


        await interaction.reply(deadlinesToString(deadlines));
       
	},
};
