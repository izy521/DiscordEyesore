(function() {

if (navigator.hardwareConcurrency < 4) {
	//I don't like using alerts, but I didn't develop any UI.
	alert(
		`This webapp was designed for devices with 4 or more cores.
		It'll probably still work but expect degraded performance.`
	);
}

var audioCtx = new AudioContext();

var W1S = `
	console.log('Websocket Worker Spawned!');

	var ws = new WebSocket("ws://127.0.0.1:8080");
		ws.binaryType = "arraybuffer";

	ws.addEventListener('open', function() {
		console.log("Worker Websocket Open!");
	});

	ws.addEventListener('message', function(e) {
		if (e.data.constructor === ArrayBuffer) {
			return postMessage(e.data, [e.data]);
		}
		return postMessage(JSON.parse(e.data));
	});
`

var W2S = `
	console.log("Conversion Worker Spawned");

	var SCALE = 1.0 / 32768;

	this.onmessage = function(e) {
		var workerCh0 = new Float32Array(960); //Framesize from main script
		var u8a = new Uint8Array(e.data);
		for (var i = 0; i<u8a.length; i+=2) {
			workerCh0[i >> 1] = toF32(readS16LE(u8a, i));
		}
		this.postMessage({
			ssrc: read32LE(u8a, 1920),
			buffer: workerCh0.buffer
		}, [workerCh0.buffer]);
		
		//this.postMessage(workerCh0.buffer, [workerCh0.buffer]);
	}

	function readS16LE(array, offset) {
		var v = array[offset] | (array[offset + 1] << 8);
		return (v & 0x8000) ? v | 0xFFFF0000 : v;
	}

	function read32LE(array, offset) {
		return ((array[offset]) | 
			(array[offset + 1] << 8) | 
			(array[offset + 2] << 16)) + 
			(array[offset + 3] * 0x1000000);
	}

	function toF32(v) {
		v = SCALE * v;
		if (v > 1) return 1;
		if (v < -1) return -1;
		return v;
	}
`

/*
	These workers are equivalent to the ones in the 'workers' folder.
	The reason I'm using the Blob method is because you can't spawn
	workers with no origin ('file:///').
*/
var Worker1 = new Worker( URL.createObjectURL( new Blob([W1S], {type: 'text/javascript'}) ) );
var Worker2 = new Worker( URL.createObjectURL( new Blob([W2S], {type: 'text/javascript'}) ) );

var translator = {};

Worker1.onmessage = function(e) {
	/* ArrayBuffer OR { n, d: { username, id, avatar, ssrc } } */

	if (e.data.constructor === ArrayBuffer) {
		return Worker2.postMessage(e.data, [e.data]);
	}

	var data = e.data;
	var user, temp;

	switch(data.n) {
		case "speak":
			user = translator[data.d.ssrc];
			if ( !user || user.id !== data.d.id ) {
				if ( temp = document.getElementById(data.d.id) ) {
					temp.parentNode.removeChild(temp);
				}
				translator[data.d.ssrc] = new Speaker(data.d, audioCtx);
			}
			return;
		case "leave":
			if ( temp = document.getElementById(data.d.id) ) {
				temp.parentNode.removeChild(temp);
			}
			if ( translator[data.d.ssrc] ) {
				return void(translator[data.d.ssrc] = null);
			}
			for (var key in translator) {
				if (translator[key].id !== data.d.id) continue;
				return void(translator[key] = null);
			}
			return;
	}
}
Worker2.onmessage = function(e) {
	/*{ ssrc, buffer }*/

	var speaker;
	if ( !(speaker = translator[e.data.ssrc]) )  return;

	if (speaker.frames < Speaker.maxFrames) {
		return speaker.channel.set(new Float32Array(e.data.buffer), Speaker.frameSize * speaker.frames++);
	}

	var node = audioCtx.createBufferSource();
	node.buffer = speaker.buffer;
	node.connect(speaker.analyser);
	node.start();
	speaker.frames = 0;
}

})();