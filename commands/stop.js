const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops music!'),
	async execute(interaction) {

		// await interaction.deferReply();
        await music.stop(interaction);
		
	},
};
