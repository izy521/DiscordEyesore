var Discord = require('discord.io');
var WebSocket = require('ws');
var utils = require('./utils.js');
var config = require('../config.json');

var wss = new WebSocket.Server({ port: 8080 });
var client = new Discord.Client({
    token: config.token,
    autorun: true
});

var DISCORD_SERVER = config.SERVER;
var DISCORD_VOICE_CHANNEL = config.CHANNEL;
wss.broadcast = function(data, params) {
    return process.nextTick(function() {
        var i = wss.clients.length;
        while(i--) {
            wss.clients[i].send(data, params);
        }
    });
}

var speakers = {};


client.on('ready', handleClientReady);
client.on('any', handleJoinLeave);
wss.on('connection', handleWSConnection);


function handleClientReady() {
    console.log("Logged in as: %s (%s)", client.username, client.id);

    return client.joinVoiceChannel(DISCORD_VOICE_CHANNEL, handleVCJoin);
}

function handleJoinLeave(data) {
    //May handle joining later
    //Doesn't seem needed now.
    if (data.t !== 'VOICE_STATE_UPDATE') return;
    if (data.d.guild_id !== DISCORD_SERVER) return;
    return  !data.d.channel_id ?
            wss.broadcast(Message('leave', speakers[data.d.user_id] || client.users[data.d.user_id])) :
            undefined;
}

function handleWSConnection(ws) {
    console.log("New client connected");
    return console.log("Connected: %d", wss.clients.length);

    //return ws.send(Buffer.from([72, 101, 108, 108, 111]), {binary: true});
}

function handleVCJoin(error, events) {
    events.on('speaking', handleSpeaking);
    return client.getAudioContext({channelID: DISCORD_VOICE_CHANNEL, maxStreamSize: 1}, handleAudioContext);
}

function handleSpeaking(userID, SSRC, speaking) {
    var speaker = speakers[userID];
    if (!speaker) speaker = speakers[userID] = utils.fastClone(client.users[userID]);
    if (speaker.ssrc !== SSRC) speaker.ssrc = SSRC;

    return wss.broadcast(Message('speak', speaker));
}

function handleAudioContext(error, stream) {
    return stream.on('incoming', handleIncomingStream);
}

function handleIncomingStream(SSRC, data) {
    //Storing SSRC in the last 4 bytes
    //Would rather create a buffer outside
    //and populate it, but this is done asynchronously.
    var sliced = Buffer.allocUnsafe(1920 + 4);
    var i = data.length - 5;
    do {
        sliced[ i >> 1 ] = data[i];
    } while( (i-=2) + 1 );
    sliced.writeUInt32LE(SSRC, 1920);
    return wss.broadcast(sliced, {binary: true});
}

function Message(name, data) {
    return JSON.stringify(
        {n: name, d: data}
    );
}