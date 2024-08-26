window.onload = async function() {

    const shouldRemoveHostCandidates = (new URLSearchParams(location.search)).get('hostcandidates') === 'false'; // NO I18N

    await navigator.mediaDevices.getUserMedia({video: true});


    const srdButton = document.getElementById('srdButton'); // NO I18N
    const remoteSDPTextArea = document.getElementById('remoteSDPTextArea'); // NO I18N

    const generateAnswerButton = document.getElementById('generateAnswerButton'); // NO I18N
    const localSDPTextArea = document.getElementById('localSDPTextArea'); // NO I18N

    

    let deviceId = (await navigator.mediaDevices.enumerateDevices()).find(device => device.label.includes('FaceTime'))?.deviceId; // NO I18N
    let stream = await navigator.mediaDevices.getUserMedia({video: {deviceId}});
    document.getElementById('self').srcObject = stream; // NO I18N

    let track = stream.getVideoTracks()[0]


    let turnServer = {
        "urls": [
            "turn:152.70.68.109",
        ],
        "credential": "helloworld",
        "username": "faihan"
    }

    

    let config = {
        iceServers: [
            turnServer
        ]
    }

    let pc = new RTCPeerConnection(config);
    pc.addTrack(track);

    srdButton.onclick = async function() {
        let remoteSDP = JSON.parse(remoteSDPTextArea.value);
        await pc.setRemoteDescription(remoteSDP);
    }

    generateAnswerButton.onclick = async function() {
        let answer = await pc.createAnswer();
        pc.setLocalDescription(answer);

        pc.onicegatheringstatechange = function() {
            document.getElementById('state').innerText = getStateString(pc);
            if (pc.iceGatheringState === 'complete') { // NO I18N
                let sdp = pc.localDescription
                if(shouldRemoveHostCandidates){
                    sdp.sdp = sdp.sdp.split('\r\n').filter(l => !l.includes('host')).join('\r\n');
                }
                localSDPTextArea.value = JSON.stringify(sdp);
            }
        }
    }

    pc.oniceconnectionstatechange = refreshState
    pc.onsignalingstatechange = refreshState
    pc.onconnectionstatechange = refreshState

    pc.ontrack = function(event) {
        document.getElementById('remote').srcObject = new MediaStream([event.track]); // NO I18N
    }

}

function getStateString(peer){

    let str = '';

    str += 'connectionState: ' + peer.connectionState + '\n';
    str += 'iceConnectionState: ' + peer.iceConnectionState + '\n';
    str += 'iceGatheringState: ' + peer.iceGatheringState + '\n';
    str += 'signalingState: ' + peer.signalingState + '\n';

    return str;

}

function refreshState(){
    document.getElementById('state').innerText = getStateString(this);
}

