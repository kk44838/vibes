const { SlashCommandBuilder } = require('@discordjs/builders');
const { Options } = require('discord.js');
const deadlineHelper = require('../helpers/deadlineHelper.js');
const moment = require('moment');

function checkDateTimeString(dateString) {
    return moment(dateString, 'DD/MM/YYYY HH:mm',true).isValid()
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('deadline')
		.setDescription('Set a deadline reminder')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('name of deadline')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('date (DD/MM/YYYY)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('time (HH:mm)')
                .setRequired(true)),
	async execute(interaction) {
        const name = interaction.options.getString('name');
        const date = interaction.options.getString('date');
        const time = interaction.options.getString('time');
        
        console.log(`got command: ${name}, ${date}, ${time}`)

        var dateTime = moment(date + ' ' + time, 'DD/MM/YYYY HH:mm');

        checkDateTimeString(dateTime)
        if (checkDateTimeString(dateTime)) {
            await deadlineHelper.addDeadline(name, dateTime);
            await interaction.reply(`${name} deadline set for ${date} ${time}`);
        }  else {
            await interaction.reply(`Invalid date or time string`);
        }

	},
};
