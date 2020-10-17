if (window.location.hostname.length == 0) {
    //connection = new WebSocket("ws://localhost:20003/");
    connection = new WebSocket("wss://jumpout.ws.coal.games/");
    console.log("Connecting to local...");
}else{
    connection = new WebSocket("wss://jumpout.ws.coal.games/");
    console.log("Connecting to server...");
}

connection.binaryType = "arraybuffer";
connection.onopen = onConnectionOpen;
connection.onmessage = onConnectionMessage;
connection.onclose = onConnectionClose;


var localPlayer = new Player();
localPlayer.init();


function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
}
function onConnectionOpen() {
    console.log("Connection opened");
}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    //console.log(ms);
    parseMessage(ms);
}

// 4+4 - pos, 4+4 vel, 4 rot, 4+4 cont
function parseMessage(message){
    const view = new DataView(message);
    let index = {i:0};
    parsePlayer(view,index,localPlayer);
    let controlX = view.getFloat32(index.i);
    index.i += 4;
    let controlY = view.getFloat32(index.i);
    index.i += 4;
    console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    console.log(localPlayer);
    document.getElementById("player").style.left =  localPlayer.ship.position.x + "px";
    document.getElementById("player").style.top =  localPlayer.ship.position.y + "px";
    document.getElementById("player").style.transform =  "rotate("+localPlayer.ship.rotation + "rad)";
}

function parsePlayer(view, index, player){
    player.ship.position.x = view.getFloat32(index.i);
    index.i += 4;
    player.ship.position.y = view.getFloat32(index.i);
    index.i += 4;
    player.ship.velocity.x = view.getFloat32(index.i);
    index.i += 4;
    player.ship.velocity.y = view.getFloat32(index.i);
    index.i += 4;
    player.ship.rotation = view.getFloat32(index.i);
    index.i += 4;
}

const fps = 30;

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
    //console.log(buffer);
}

