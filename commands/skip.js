const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skips the current song!'),
	async execute(interaction) {

		await interaction.deferReply();
        msg = await music.skip(interaction);
		interaction.editReply(msg.msg)
		
	},
};
