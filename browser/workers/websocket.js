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