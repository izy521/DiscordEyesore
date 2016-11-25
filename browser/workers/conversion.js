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