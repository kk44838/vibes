const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play_now')
		.setDescription('Plays music now!')
        .addStringOption(option => option.setName('url').setDescription('Enter Youtube Song URL')),
	async execute(interaction) {
        const serverQueue = music.queue.get(interaction.guild.id);
        const songName = interaction.options.getString('url');

		await interaction.deferReply();

		queueIsEmpty = serverQueue === undefined || serverQueue.songs.length == 0;

        msg =  await music.play_next(interaction, songName, serverQueue);

		if (!queueIsEmpty) {
			await music.skip(interaction);
		}
		
		interaction.editReply(msg.msg);

	},
};
