

window.onload = async function() {

    const shouldRemoveHostCandidates = (new URLSearchParams(location.search)).get('hostcandidates') === 'false'; // NO I18N

    await navigator.mediaDevices.getUserMedia({video: true});

    const generateOfferButton = document.getElementById('generateOfferButton'); // NO I18N
    const localSDPTextArea = document.getElementById('localSDPTextArea'); // NO I18N

    const srdButton = document.getElementById('srdButton'); // NO I18N
    const remoteSDPTextArea = document.getElementById('remoteSDPTextArea'); // NO I18N

    let deviceId = (await navigator.mediaDevices.enumerateDevices()).find(device => device.label.includes('FaceTime'))?.deviceId; // NO I18N
    let stream = await navigator.mediaDevices.getUserMedia({video: {deviceId}, audio: true});
    document.getElementById('self').srcObject = stream;
    document.getElementById('self').muted = true;
    document.getElementById('self').style.transform = 'scaleX(-1)';


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

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    generateOfferButton.onclick = async function() {
        let offer = await pc.createOffer();
        pc.setLocalDescription(offer);

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

    srdButton.onclick = async function() {
        let remoteSDP = JSON.parse(remoteSDPTextArea.value);
        await pc.setRemoteDescription(remoteSDP);
    }

    pc.ontrack = function(event) {

        let track = event.track;

        if(track.kind === 'video'){
            if(!document.getElementById('remote').srcObject){
                document.getElementById('remote').srcObject = new MediaStream([track]);
            }
            else{
                document.getElementById('remote').srcObject.addTrack(track);
            }
            document.getElementById('remote').srcObject = new MediaStream([track]);
        }
        if(track.kind === 'audio'){
            if(!document.getElementById('remote').srcObject){
                document.getElementById('remote').srcObject = new MediaStream([track]);
            }
            else{
                document.getElementById('remote').srcObject.addTrack(track);
            }
        }
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
