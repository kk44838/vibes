const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays music!')
        .addStringOption(option => option.setName('url').setDescription('Enter Youtube Song URL')),
	async execute(interaction) {
        const songName = interaction.options.getString('url');
		console.log(interaction.options)
		console.log(songName)
        const serverQueue = music.queue.get(interaction.guild.id);

		await interaction.deferReply();
        msg = await music.play(interaction, songName, serverQueue);
		console.log(msg)
		interaction.editReply(msg.msg)

	},
};
