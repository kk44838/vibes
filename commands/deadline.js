const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deadline')
		.setDescription('Set a deadline reminder!'),
	async execute(interaction) {
		await interaction.reply('Deadline set');
	},
};
