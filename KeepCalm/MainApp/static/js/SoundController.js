


export default class SoundController {
    constructor(turnOn = true) {
        if (SoundController._instance) {
            return SoundController._instance;
        }
        SoundController._instance = this;

        if (turnOn) {
            this.turnOnController();
        }
    }

    turnOnController() {
        const btnMusic = document.getElementById('btnMusic');
        const btnSfx = document.getElementById('btnSfx');
        const sliderMusic = document.getElementById('sliderMusic');
        const sliderSfx = document.getElementById('sliderSfx');

        btnMusic.addEventListener('click', () => {
            sliderMusic.parentElement.classList.toggle('d-none');
        });

        btnSfx.addEventListener('click', () => {
            sliderSfx.parentElement.classList.toggle('d-none');
        });

        sliderMusic.addEventListener('input', () => {
            audioManager.changeSoundLevel('music', parseInt(sliderMusic.value, 10));
        });

        sliderSfx.addEventListener('input', () => {
            audioManager.changeSoundLevel('sfx', parseInt(sliderSfx.value, 10));
        });
    }
}