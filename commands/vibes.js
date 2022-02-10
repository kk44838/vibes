const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");
const play_now = require("./play_now.js");

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vibes')
		.setDescription('just vibes')
        .addBooleanOption(option => option.setName('shuffle').setDescription('Shuffle Playlist').setRequired(true)),
	async execute(interaction) {
        const url = "https://www.youtube.com/playlist?list=PLP16jd6hNkwO4eZoknycQv4ZfSEwtgCX3"
        const serverQueue = music.queue.get(interaction.guild.id);

        await interaction.deferReply();

		queueIsEmpty = serverQueue === undefined || serverQueue.songs.length == 0;
        
        msg =  await music.play_next(interaction, url, serverQueue);
        // console.log("sdgohadflks")

        const newServerQueue = music.queue.get(interaction.guild.id);

        const shuffle = interaction.options.getBoolean('shuffle');
        if (shuffle == undefined || shuffle) {
            console.log(newServerQueue.songs)
            shuffleArray(newServerQueue.songs);
        }
    
		// if (!queueIsEmpty) {
		await music.skip(interaction);
		// }

		await interaction.editReply("just vibes **~** ");
        
	},
};
