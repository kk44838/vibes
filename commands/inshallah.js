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

		queueIsEmpty = serverQueue === undefined || serverQueue.songs.length == 0;

        await music.play_next(interaction, "IX51UAJUhhQ", serverQueue);

		if (!queueIsEmpty) {
			await music.skip(interaction);
		}
		
		interaction.editReply("SIUUUUUUUUU");

	},
};
