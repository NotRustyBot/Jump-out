/**
 * @type {WebSocket}
 */
let connection;


onmessage = function (e) {
    let messageData = e.data;

    switch (messageData.type) {
        case 1: //init
            connection = new WebSocket(messageData.address);
            connection.binaryType = "arraybuffer";
            connection.onopen = onConnectionOpen;
            connection.onmessage = onConnectionMessage;
            connection.onclose = onConnectionClose;
            console.log("winit");
            break;
        case 2: //send
            connection.send(messageData.data);
            break;

        default:
            break;
    }
}

function onConnectionOpen() {
    console.log("w1");
    postMessage({ type: 1 });
}

function onConnectionMessage(e) {
    postMessage({ type: 2, data: e.data });
}

function onConnectionClose(e) {
    console.log("w3");

    postMessage({ type: 3, data: { code: e.code, reason: e.reason } });
}