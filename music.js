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
// const play_next = require('./commands/play_next');

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
        audioPlayer: null,
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
        
        queueContruct.audioPlayer = audioPlayer

        audioPlayer.on(AudioPlayerStatus.Idle, async () => {
            queueContruct.songs.shift();
            await play_song(interaction, queueContruct.songs[0], connection, audioPlayer);
        });

        console.log(queueContruct.songs[0])

        return await play_song(interaction, queueContruct.songs[0], connection, audioPlayer);
    } catch (err) {
        // Printing the error message if the bot fails to join the voicechat
        console.log(err);
        queue.delete(interaction.guild.id);
        return await interaction.channel.send(err);
    }
}

const play_song = async (interaction, song, connection, audioPlayer) => {
    const song_queue = queue.get(interaction.guild.id);

    //If no song is left in the server queue. Leave the voice channel and delete the key and value pair from the global queue.
    if (!song) {
        song_queue.connection.destroy();
        queue.delete(interaction.guild.id)
        
        // return interaction.reply('**Music Stopped!**');
        return { "msg": '**Music Stopped!**' };
    }

    
    try {
        //Create Stream from Youtube URL
        const stream = await play.stream(song.url)
        //Create AudioResource from Stream
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })

        //Play resource
        audioPlayer.play(resource)

        connection.subscribe(audioPlayer)

        // await interaction.editReply(`🎶 Now playing **${song.title}**`)
        return { "msg": `🎶 Now playing **${song.title}**` };
    } catch (err) {
        return module.exports.skip(interaction);
    }
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
        // interaction.editReply('Error finding video.');
        throw new Error
    }
}

async function getSongs(interaction, message) {
    console.log(message)

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
    return songs
}



module.exports = {
    queue: queue,
    async skip(interaction) {
        const channel = interaction.member?.voice.channel;
        if (channel) {
            const song_queue = queue.get(interaction.guild.id);

            if (song_queue) {
                song_queue.songs.shift();
                return await play_song(interaction, song_queue.songs[0], song_queue.connection, song_queue.audioPlayer);
            } else {
                // interaction.editReply('**Nothing to Skip.**');
                return { "msg": '**Nothing to Skip.**'}
            }

        } else {
            // interaction.editReply('Join a voice channel then try again!');
            return { "msg": 'Join a voice channel then try again!'}
        }
    },
    async stop(interaction) {
        const channel = interaction.member?.voice.channel;
        if (channel) {
            const song_queue = queue.get(interaction.guild.id);

            song_queue.connection.destroy();
            queue.delete(interaction.guild.id)
            // interaction.editReply('**Music Stopped!**');
            return { "msg": '**Music Stopped!**'}


        } else {
            // interaction.editReply('Join a voice channel then try again!');
            return { "msg": 'Join a voice channel then try again!'}

        }
    },

    async play_next(interaction, message, serverQueue) {
        const channel = interaction.member?.voice.channel;

        if (channel) { 
            try {
                const songs = await getSongs(interaction, message);

                if (!serverQueue) {
                    return await createContract(interaction, channel, JSON.parse(JSON.stringify(songs)))

                } else {
                    const head = serverQueue.songs[0];

                    serverQueue.songs.shift();
            
                    serverQueue.songs = songs.concat(serverQueue.songs);
            
                    serverQueue.songs.unshift(head);
                    console.log("PLAYNEXT___________________________");
                    console.log(serverQueue.songs);
                    // return interaction.editReply(`${songs[0].title} has been added to the front of the queue!`);
                    return { "msg": `${songs[0].title} has been added to the front of the queue!` }
                }
                
            } catch (error) {
                console.error(error);
            }
        } else {
            // interaction.editReply('Join a voice channel then try again!');

            return { "msg": 'Join a voice channel then try again!'}
        }

    },
	async play(interaction, message, serverQueue) {
        const channel = interaction.member?.voice.channel;

        if (channel) {
            try {
                const songs = await getSongs(interaction, message);

                if (!serverQueue) {
                    return await createContract(interaction, channel, JSON.parse(JSON.stringify(songs)))

                } else {
                    serverQueue.songs.concat(songs);
                    console.log(serverQueue.songs);
                    // return interaction.editReply(`${songs[0].title} has been added to the queue!`);
                    
                    return { "msg": `${songs[0].title} has been added to the front of the queue!` }
                }
                
            } catch (error) {
                console.error(error);
            }
        } else {
            // interaction.editReply('Join a voice channel then try again!');

            return { "msg": 'Join a voice channel then try again!'}
        }
        
	},
};