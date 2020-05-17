var conn = new WebSocket('ws://127.0.0.1:8080/PeerStream/socket');
var qvgaConraints = {
		video: { 
		    mandatory: { 
		        maxWidth: 320, 
		        maxHeight: 180 
		     } 
		  }
}
var vgaConraints = {
		video: { 
		    mandatory: { 
		        maxWidth: 640, 
		        maxHeight: 360 
		     } 
		  },audio: true
}
var hdConstraints = {
//		audio: true, 
		video:true
//        video: { 
//            facingMode: "user", 
//            width: { min: 640, ideal: 1280, max: 1920 },
//            height: { min: 480, ideal: 720, max: 1080 } 
//        } 
}
var mobileConstraints = {video: { 
    exact: { 
        maxWidth: 480, 
        maxHeight: 320 
     },
  },audio: true};
var constraints;
if(/Android|iPhone|iPad/i.test(navigator.userAgent)) { 
	    constraints = vgaConraints;   
	} else { 
	   constraints = hdConstraints; 
	}
const configuration = {"iceServers": [{"urls": "stun:stun2.1.google.com:19302"},
	//{urls:"https://networktraversal.googleapis.com/v1alpha/iceconfig?key=AIzaSyA2WoxRAjLTwrD7upuk9N2qdlcOch3D2wU"},
	{
    "urls": 'turn:127.0.0.1:3478?transport=udp',
    'credential': 'test',
    'username': 'test'
  },
  {
    "urls": 'turn:127.0.0.1:3478?transport=tcp',
    'credential': 'test',
    'username': 'test'
  }
]};

function hasUserMedia() { 
	   //check if the browser supports the WebRTC 
	   return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
	      navigator.mozGetUserMedia); 
}
const pc = new RTCPeerConnection(configuration);
var selfView = document.querySelector('#localVideo'); 
var remoteView = document.querySelector('#remoteVideo'); 

// send any ice candidates to the other peer
pc.onicecandidate = (event) => conn.send(JSON.stringify({candidate: event.candidate}));

// let the "negotiationneeded" event trigger offer generation
pc.onnegotiationneeded = async () => {
  
};

// once media for a remote track arrives, show it in the remote video element
pc.ontrack = (event) => {
  // don't set srcObject again if it is already set.
  //if (remoteView.srcObject) return;
  //remoteView.srcObject = event.streams[0];
	if (!remoteView.srcObject) {
        remoteView.srcObject = new MediaStream();
      }
      remoteView.srcObject.addTrack(event.track);
};

// call start() to initiate
async function start() {
  try {
    // get a local stream, show it in a self-view and add it to be sent
//	  if (navigator.mediaDevices === undefined){
//          navigator.mediaDevices = {};
//          navigator.mediaDevices.getUserMedia = function(hdConraints) {
//              var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//              if (!getUserMedia) {
//                  return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
//              }
//              return new Promise(function(resolve, reject) {
//                  getUserMedia.call(navigator, constraintObj, resolve, reject);
//              });
//          }
//      }
	
    const stream = await navigator.mediaDevices.getUserMedia(hdConstraints);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    selfView.srcObject = stream;
    
     
    try {
        //await pc.setLocalDescription(await pc.createOffer());
        // send the offer to the other peer
        //conn.send(JSON.stringify(pc.localDescription));
        
        pc.createOffer().then(function(offer){
        	return pc.setLocalDescription(offer);
        }).then(function(){
        	conn.send(JSON.stringify({desc: pc.localDescription}));
        }).catch(function(err){});
      } catch (err) {
        console.error(err);
      }
   
  } catch (err) {
    console.error(err);
  }
}

conn.onmessage = async (event) => {
  try {
	  const message = JSON.parse(event.data);
    if (message.desc) {
    	desc = message.desc;
      // if we get an offer, we need to reply with an answer
      if (desc.type == 'offer') {
        await pc.setRemoteDescription(desc);
        const stream = await navigator.mediaDevices.getUserMedia(hdConstraints);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        await pc.setLocalDescription(await pc.createAnswer());
        conn.send(JSON.stringify({desc: pc.localDescription}));
      } else if (desc.type == 'answer') {
        await pc.setRemoteDescription(desc);
      } else {
        console.log('Unsupported SDP type. Your code may differ here.');
      }
    } else if (message.candidate) {
      await pc.addIceCandidate(message.candidate);
    }
  } catch (err) {
    console.error(err);
  }
};