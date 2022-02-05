const { SlashCommandBuilder } = require('@discordjs/builders');
const music = require("../music.js");


function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function songsToString(songs) {
    const queueShowLength = 10
    const slicedArray = songs.slice(0, queueShowLength);
    console.log(`songsToString ${slicedArray}`)
    let msg = 'Songs in Queue:' + '\n';
    slicedArray.forEach((song, index) => {
        msg += `**${index + 1}** ` + song.title + ` **${song.duration}**` + '\n';
    });
    console.log(msg)
    return msg
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffle the queue'),
	async execute(interaction) {
        const serverQueue = music.queue.get(interaction.guild.id);
        // console.log(serverQueue.songs)

        const head = serverQueue.songs[0];

        serverQueue.songs.shift();

        shuffleArray(serverQueue.songs);

        serverQueue.songs.unshift(head);

		await interaction.reply(songsToString(serverQueue.songs))
		
	},
};
