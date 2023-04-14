import WHIPClient from "./WHIPClient.js";
import WHEPClient from "./WHEPClient.js";

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);

const publishUrl = urlParams.get('publishUrl');
const playerUrl = urlParams.get("playerUrl");

const publishUrlInput = document.getElementById('publish-url');
const playerUrlInput = document.getElementById('player-url');

if (publishUrl) {
    publishUrlInput.value = publishUrl;
}

if (playerUrl) {
    playerUrlInput.value = playerUrl;
}

let videoElement = document.getElementById('input-video');
let remoteVideoElement = document.getElementById("remote-video");
let buttonControls = document.querySelector('.stream-controls');

let connectStreamButton = "<button class='start-stream-btn'>Connect Stream</button>";
let playStreamButton = "<button class='play-stream-btn'>Play/Refresh Stream</button>";
let disconnectButton = "<button class='end-stream-btn'>Disconnect Stream</button>";
let videoToggleButton = "<button class='video-btn'>Disable Video</button>";
let audioToggleButton = "<button class='audio-btn'>Disable Audio</button>";

const videoConstraints = {
    height: 852,
    weight: 480,
    frameRate: {ideal: 30, max: 60}
}

// Output from obs should be the same with the settings
let mediaOptions = {
    video: {
        width: {min: 852, ideal: 852, max: 852},
        height: {min: 480, ideal: 480, max: 480},
        frameRate: {ideal: 30, max: 60},
    },
    audio: {
        autoGainControl: false,
        channelCount: 2,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0
    }
}

self.whipClient = new WHIPClient(publishUrl, videoElement, videoConstraints, mediaOptions)

buttonControls.addEventListener('click', (event) => {
    if (event.target.tagName !== 'BUTTON') return;

    if (event.target.classList.contains('start-camera-btn')) {
        document.querySelector('.start-stream-tool').innerHTML = connectStreamButton;
        document.querySelector('.video-tool').innerHTML = videoToggleButton;
        document.querySelector('.audio-tool').innerHTML = audioToggleButton;

        self.whipClient.showMediaSources();
    }

    if (event.target.classList.contains('start-stream-btn')) {
        document.querySelector('.end-stream-tool').innerHTML = disconnectButton;
        document.querySelector('.play-stream-tool').innerHTML = playStreamButton;
        self.whipClient.createConnectionWebrtc()
    }

    if (event.target.classList.contains('play-stream-btn')) {
        callWhepPlayer();
    }

    if (event.target.classList.contains('end-stream-btn')) {
        event.target.remove()
        whipClient.disconnectStream()
    }

    if (event.target.classList.contains('video-btn')) {
        toggleMedia(event.target, 'Video')
    }

    if (event.target.classList.contains('audio-btn')) {
        toggleMedia(event.target, 'Audio')
    }

})

let toggleMedia = (button, mediaType) => {
    const tracks = videoElement.srcObject.getTracks()

    tracks.forEach(track => {
        if (track.kind === mediaType.toLowerCase()) {
            track.enabled = !track.enabled
            button.innerText = track.enabled ? `Disable ${mediaType}` : `Enable ${mediaType}`
        }
    })
}

let callWhepPlayer = async () => {
    self.whepClient = new WHEPClient(playerUrl, remoteVideoElement);
}
