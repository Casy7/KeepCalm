export default class AudioManager {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.channels = {}; // channelName -> GainNode
        this.sounds = {};   // soundName -> AudioBuffer
    }

    createChannel(channelName) {
        if (this.channels[channelName]) return; // уже есть
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = 1.0;
        gainNode.connect(this.audioCtx.destination);
        this.channels[channelName] = gainNode;
    }

    async buffer(soundName, soundPath) {
        const response = await fetch(soundPath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        this.sounds[soundName] = audioBuffer;
    }

    play(soundName, channelName, channelRelativeVolume = 100, loop = false) {
        if (!this.sounds[soundName]) {
            console.log(`Sound '${soundName}' not buffered`);
            return;
        }
        if (!this.channels[channelName]) {
            console.error(`Channel '${channelName}' not found`);
            return;
        }

        const source = this.audioCtx.createBufferSource();
        source.buffer = this.sounds[soundName];
        source.loop = loop;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = channelRelativeVolume / 100;

        source.connect(gainNode);
        gainNode.connect(this.channels[channelName]);

        source.start();
        return source; // вернём, чтобы можно было потом .stop()
    }


    changeSoundLevel(channelName, volume) {
        if (!this.channels[channelName]) {
            console.error(`Channel '${channelName}' not found`);
            return;
        }
        this.channels[channelName].gain.value = volume / 100;
    }
}
