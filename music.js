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

function idToURL(videoId) {
    return 'https://www.youtube.com/watch?v=' + videoId;
}


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

async function createContract(interaction, voiceChannel, songs) {
    // Creating the contract for our queue
    const queueContruct = {
        textChannel: interaction.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: songs,
        volume: 5,
        playing: true,
    };
    // Setting the queue using our contract
    queue.set(interaction.guild.id, queueContruct);
    console.log(songs)
    console.log(songs[0])

    try {
        // Here we try to join the voicechat and save our connection into our object.
        const connection = await connectToChannel(voiceChannel);
        queueContruct.connection = connection;
        // Calling the play function to start a song
        const audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        
        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            queueContruct.songs.shift();
            play_song(interaction, queueContruct.songs[0], connection, audioPlayer);
        });

        console.log(queueContruct.songs[0])

        
        await play_song(interaction, queueContruct.songs[0], connection, audioPlayer);
    } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.log(err);
        queue.delete(interaction.guild.id);
        return interaction.channel.send(err);
    }
}

const play_song = async (interaction, song, connection, audioPlayer) => {
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

    await interaction.editReply(`🎶 Now playing **${song.title}**`)
}


function isSingleVideoURL(str) {
    return str.includes('watch?v=');
}

function isPlaylistURL(str) {
    return str.includes('playlist?list=');
}

async function findVideo(query, interaction) {
    const video_finder = async (query) =>{
        const video_result = await ytSearch(query);
        return (video_result.videos.length > 1) ? video_result.videos[0] : null;
    }

    const video = await video_finder(query);
    if (video){

        console.log({ title: video.title, url: video.url })
        return { title: video.title, url: video.url, duration: video.duration.timestamp }
        
    } else {
        console.log("Error finding video")
        interaction.reply('Error finding video.');
        throw new Error
    }
}

module.exports = {
    queue: queue,
    async stop(interaction) {
        const channel = interaction.member?.voice.channel;
        if (channel) {
            const song_queue = queue.get(interaction.guild.id);

            song_queue.connection.destroy();
            queue.delete(interaction.guild.id)
            interaction.reply('**Music Stopped!**');

        } else {
            interaction.reply('Join a voice channel then try again!');
        }
    },
	async play(interaction, message, serverQueue) {
        const channel = interaction.member?.voice.channel;

        if (channel) {
                try {
                    // const connection = await connectToChannel(channel);
                    // connection.subscribe(player);
                    console.log(message)
                    // const args = message.split(" ");
                    // console.log(args)
                    const songs = []

                    if (isPlaylistURL(message)) {
                        console.log("is playlist url")
                        // query = {
                        //     "listId": 
                        // };

                        const list = await ytSearch( { "listId": message.split('=')[1] } );

                        console.log( 'playlist title: ' + list.title );
                        list.videos.forEach( function ( video ) {
                            console.log( video )
                            console.log("ALEFGASDFHLSADJFIOS")
                            console.log({ title: video.title, url: idToURL(video.videoId) })
                            songs.push({ title: video.title, url: idToURL(video.videoId), duration: video.duration.timestamp })

                        } );
                        

                    } else {

                        if (isSingleVideoURL(message)) {
                            console.log("video url")
                            query = {
                                "videoId": message.split('=')[1]
                            };
                            query = message.split('=')[1];
                        } else {
                            console.log("word search")
                            query = message
                        }

                        const song = await findVideo(query, interaction)
                        console.log(song)
                        songs.push(song)
                    }
                    
                    if (!serverQueue) {
                        return createContract(interaction, channel, songs)

                    } else {
                        serverQueue.songs.concat(songs);
                        console.log(serverQueue.songs);
                        return interaction.editReply(`${song.title} has been added to the queue!`);
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