const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Queue'),
	async execute(interaction) {
        const serverQueue = music.queue.get(interaction.guild.id);
        console.log(serverQueue.songs)
		await interaction.reply("queue")
		
	},
};
