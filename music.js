const { VoiceChannel } = require('discord.js');
const { joinVoiceChannel, entersState,
    createAudioPlayer,
	createAudioResource,
    NoSubscriberBehavior,
	StreamType,
	AudioPlayerStatus,
    demuxProbe,
	VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const play = require('play-dl');
const ytSearch = require('yt-search');

const queue = new Map()

const audioPlayer = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Pause,
	},
});

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

async function createContract(interaction, voiceChannel, song) {
    // Creating the contract for our queue
    const queueContruct = {
        textChannel: interaction.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };
    // Setting the queue using our contract
    queue.set(interaction.guild.id, queueContruct);
    // Pushing the song to our songs array
    queueContruct.songs.push(song);
    
    try {
        // Here we try to join the voicechat and save our connection into our object.
        const connection = await connectToChannel(voiceChannel);
        queueContruct.connection = connection;
        // Calling the play function to start a song
        play_song(interaction, queueContruct.songs[0], connection);
    } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.log(err);
        queue.delete(interaction.guild.id);
        return interaction.channel.send(err);
    }
}

const play_song = async (interaction, song, connection) => {
    const song_queue = queue.get(interaction.guild.id);

    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.voiceChannel.leave();
        queue.delete(interaction.guild.id);
        return;
    }


    //Create Stream from Youtube URL
    const stream = await play.stream(song.url)

    //Create AudioResource from Stream
    let resource = createAudioResource(stream.stream, {
        inputType: stream.type
    })

    //Play resource
    audioPlayer.play(resource)

    connection.subscribe(audioPlayer)

    // const stream = ytdl(song.url, { filter: 'audioonly' });

    // console.log(stream)

    // const resource = createAudioResource(stream, {
    //     metadata: song,
    // });

    // resource.playStream.on('error', error => {
    //     console.error('Error:', error.message, 'with track', resource.metadata.title);
    // });
    
    // audioPlayer.play(resource);

    await interaction.reply(`🎶 Now playing **${song.title}**`)
}


module.exports = {
    queue: queue,

	async play(interaction, message, serverQueue) {
        const channel = interaction.member?.voice.channel;

        if (channel) {
                try {
                    // const connection = await connectToChannel(channel);
                    // connection.subscribe(player);
                    console.log(message)
                    // const args = message.split(" ");
                    // console.log(args)
                    let song = {};

                    if (ytdl.validateURL(message)) {

                    } else {
                        const video_finder = async (query) =>{
                            const video_result = await ytSearch(query);
                            return (video_result.videos.length > 1) ? video_result.videos[0] : null;
                        }
        
                        const video = await video_finder(message);
                        if (video){
                            song = { title: video.title, url: video.url }
                            console.log(song)
                        } else {
                            return interaction.reply('Error finding video.');
                        }

                    }
                    
                    if (!serverQueue) {
                        return createContract(interaction, channel, song)

                    } else {
                        serverQueue.songs.push(song);
                        console.log(serverQueue.songs);
                        return interaction.reply(`${song.title} has been added to the queue!`);
                    }
                    
                } catch (error) {
                    console.error(error);
                }
            } else {
                interaction.reply('Join a voice channel then try again!');
        }
        
        // return await interaction.reply(message); 
	},
};