console.log("Connecting...");
connection = new WebSocket("wss://jumpout.ws.coal.games/");
connection.binaryType = "arraybuffer";
connection.onopen = onConnectionOpen;
connection.onmessage = onConnectionMessage;
connection.onclose = onConnectionClose;

let struct = {};
struct.x = 0;
struct.y = 0;
struct.velx = 0;
struct.vely = 0;
struct.rotation = 0;


function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
}
function onConnectionOpen() {
    console.log("Connection opened");
}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    console.log(ms);
    parseMessage(ms);
}

// 4+4 - pos, 4+4 vel, 4 rot, 4+4 cont
function parseMessage(message){
    const view = new DataView(message);
    let index = {i:0};
    getPlayerFromMessage(view,index)
    let controlX = view.getFloat32(index.i);
    index.i += 4;
    let controlY = view.getFloat32(index.i);
    index.i += 4;
    console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    console.log(struct);
}

function getPlayerFromMessage(view, index){
    struct.x = view.getFloat32(index.i);
    index.i += 4;
    struct.y = view.getFloat32(index.i);
    index.i += 4;
    struct.velx = view.getFloat32(index.i);
    index.i += 4;
    struct.vely = view.getFloat32(index.i);
    index.i += 4;
    struct.rotation = view.getFloat32(index.i);
    index.i += 4;
}

const fps = 1;

setInterval(update, 1000 / fps);

function update() {
    sendControls();
}

let controlVector = { x: 0, y: 0 };
window.addEventListener("keydown", function (e) {
    let key = e.key.toLocaleLowerCase();
    switch (key) {
        case "w":
            controlVector.y = 1;
            break;
        case "s":
            controlVector.y = -1;
            break;
        case "d":
            controlVector.x = 1;
            break;
        case "a":
            controlVector.x = -1;
            break;
    }
});

window.addEventListener("keyup", function (e) {
    let key = e.key.toLocaleLowerCase();
    switch (key) {
        case "w":
        case "s":
            controlVector.y = 0;
            break;
        case "d":
        case "a":
            controlVector.x = 0;
            break;
    }
});

function sendControls() {
    var index = 0;
    const buffer = new ArrayBuffer(9);
    const view = new DataView(buffer);
    view.setUint8(index,1);
    index+=1;
    view.setFloat32(index,controlVector.x);
    index+=4;
    view.setFloat32(index,controlVector.y);

    connection.send(buffer);
    console.log(buffer);
}
