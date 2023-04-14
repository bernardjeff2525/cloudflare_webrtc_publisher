import negotiateConnectionWithClientOffer from './negotiateConnectionWithClientOffer.js';

export default class WHEPClient {
	constructor(endpoint, videoElement) {
		this.endpoint = endpoint;
		this.videoElement = videoElement;
		this.stream = new MediaStream();

		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{
					urls: 'stun:stun.cloudflare.com:3478',
				},
			],
			bundlePolicy: 'max-bundle',
		});

		this.peerConnection.addTransceiver('video', {
			direction: 'recvonly',
		});
		this.peerConnection.addTransceiver('audio', {
			direction: 'recvonly',
		});

		this.peerConnection.ontrack = event => {
			const track = event.track;
			const currentTracks = this.stream.getTracks();
			const streamAlreadyHasVideoTrack = currentTracks.some(track => track.kind === 'video');
			const streamAlreadyHasAudioTrack = currentTracks.some(track => track.kind === 'audio');

			switch (track.kind) {
				case 'video':
					if (streamAlreadyHasVideoTrack) {
						break;
					}
					this.stream.addTrack(track);
					break;
				case 'audio':
					if (streamAlreadyHasAudioTrack) {
						break;
					}
					this.stream.addTrack(track);
					break;
				default:
					console.log('got unknown track ' + track);
			}
		};

		this.peerConnection.addEventListener('connectionstatechange', ev => {
			console.log('WHEP connection state is:', this.peerConnection.connectionState)

			if (this.peerConnection.connectionState !== 'connected') {
				return;
			}

			if (!this.videoElement.srcObject) {
				this.videoElement.srcObject = this.stream;
			}
		});

		this.peerConnection.addEventListener('negotiationneeded', ev => {
			console.log("WHEP: Connection negotiation starting")
			negotiateConnectionWithClientOffer(this.peerConnection, this.endpoint);
			console.log("WHEP: Connection negotiation ended")
		});
	}
}
