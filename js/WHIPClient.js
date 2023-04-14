import negotiateConnectionWithClientOffer from "./negotiateConnectionWithClientOffer.js"

export default class WHIPClient {

	constructor(endpoint, videoElement, videoConstraints, mediaOptions) {
		this.mediaOptions = mediaOptions
		this.videoConstraints = videoConstraints
		this.endpoint = endpoint
		this.videoElement = videoElement
	}

	async showMediaSources() {
		navigator.mediaDevices
			.getUserMedia(this.mediaOptions)
			.then((stream) => {
				this.localStream = stream
				this.videoElement.srcObject = stream;
			})
			.catch(console.error)
	}

	async createConnectionWebrtc() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{
					urls: "stun:stun.cloudflare.com:3478",
				},
			],
			bundlePolicy: "max-bundle",
		});
		/**
		 * Listen for negotiationneeded events, and use WHIP as the signaling protocol to establish a connection
		 *
		 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/negotiationneeded_event
		 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html
		 */
		this.peerConnection.addEventListener("negotiationneeded", async (ev) => {
			console.log("WHIP: Connection negotiation starting")
			await negotiateConnectionWithClientOffer(
				this.peerConnection,
				this.endpoint
			);
			console.log("WHIP: Connection negotiation ended")
		});

		this.accessLocalMediaSources()
			.then((stream) => {
				this.localStream = stream;
				this.videoElement.srcObject = stream;
			})
			.catch(console.error);
	}

	async accessLocalMediaSources() {
		return navigator.mediaDevices
			.getUserMedia(this.mediaOptions)
			.then((stream) => {
				stream.getTracks().forEach((track) => {
					const transceiver = this.peerConnection.addTransceiver(track, {
						direction: "sendonly",
					});
					if (track.kind == "video" && transceiver.sender.track) {
						transceiver.sender.track.applyConstraints(this.videoConstraints);
					}
				});
				return stream;
			});
	}

	async disconnectStream() {
		let _a;
		// Cloudflare feature still in progress
		const response = await fetch(this.endpoint, {
		    method: "DELETE",
		    mode: "cors",
		});
		this.peerConnection.close();
		(_a = this.localStream) === null || _a === void 0
			? void 0
			: _a.getTracks().forEach((track) => track.stop());
	}
}