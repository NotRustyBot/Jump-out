console.log("Connecting...");
connection = new WebSocket('wss://jumpout.ws.coal.games/');
connection.binaryType = "arraybuffer";
connection.onopen = onConnectionOpen;
connection.onmessage = onConnectionMessage;
connection.onclose = onConnectionClose;

function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);

}
function onConnectionOpen() {
    console.log("Connection opened");
}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    console.log(ms);
    //parseMessage(ms);
}