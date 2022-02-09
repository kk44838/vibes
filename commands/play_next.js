const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play_next')
		.setDescription('Plays music after current song!')
        .addStringOption(option => option.setName('url').setDescription('Enter Youtube Song URL')),
	async execute(interaction) {
        const songName = interaction.options.getString('url');
		console.log(interaction.options)
		console.log(songName)
        const serverQueue = music.queue.get(interaction.guild.id);

		await interaction.deferReply();
        msg =  await music.play_next(interaction, songName, serverQueue);
		await interaction.editReply(msg.msg)
	},
};
