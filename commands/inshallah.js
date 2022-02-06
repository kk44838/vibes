const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inshallah')
		.setDescription('Siuuu'),
	async execute(interaction) {
        const songName = "Inshallah Siuu"
        const serverQueue = music.queue.get(interaction.guild.id);
		await interaction.deferReply();
        await music.play_next(interaction, "IX51UAJUhhQ", serverQueue);
		await music.skip(interaction);
		interaction.editReply("SIUUUUUUUUU");

	},
};
