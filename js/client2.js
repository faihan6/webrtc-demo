window.onload = async function() {

    await navigator.mediaDevices.getUserMedia({video: true});


    const srdButton = document.getElementById('srdButton'); // NO I18N
    const remoteSDPTextArea = document.getElementById('remoteSDPTextArea'); // NO I18N

    const generateAnswerButton = document.getElementById('generateAnswerButton'); // NO I18N
    const localSDPTextArea = document.getElementById('localSDPTextArea'); // NO I18N

    

    let deviceId = (await navigator.mediaDevices.enumerateDevices()).find(device => device.label.includes('FaceTime')).deviceId; // NO I18N
    let stream = await navigator.mediaDevices.getUserMedia({video: {deviceId}});
    document.getElementById('self').srcObject = stream; // NO I18N

    let track = stream.getVideoTracks()[0]

    let stunServer = {
        urls: 'stun:con-in2-23.zohomeeting.com:3478' // NO I18N
    }

    let turnServer = {
        "urls": [ // NO I18N
            "turn:turn-in3.zohomeeting.com:443?transport=tcp", // NO I18N
            "turns:turn-in3.zohomeeting.com:443?transport=tcp" // NO I18N
        ],
        credential: "6ReQL5tZTh+j6ryK9HZVJY0ZBOo=", // NO I18N
        username: "1707775754:1096727025_664000154548923_av" // NO I18N
    }

    

    let config = {
        iceServers: [
            stunServer, 
        //    turnServer
        ]
    }

    let pc = new RTCPeerConnection(config);
    pc.addTrack(track);

    srdButton.onclick = async function() {
        let remoteSDP = JSON.parse(remoteSDPTextArea.value);
        await pc.setRemoteDescription(remoteSDP);
    }

    generateAnswerButton.onclick = async function() {
        let offer = await pc.createAnswer();
        pc.setLocalDescription(offer);

        pc.onicegatheringstatechange = function() {
            if (pc.iceGatheringState === 'complete') { // NO I18N
                localSDPTextArea.value = JSON.stringify(pc.localDescription);
            }
        }
    }

    pc.ontrack = function(event) {
        document.getElementById('remote').srcObject = new MediaStream([event.track]); // NO I18N
    }

}
