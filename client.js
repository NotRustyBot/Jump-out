var connection;
let app = new PIXI.Application({
    antialias: true,
});
let loader = PIXI.Loader.shared;
document.body.appendChild(app.renderer.view);

app.renderer.view.width = window.innerWidth;
app.renderer.view.height = window.innerHeight;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.backgroundColor = 0xffe793;

window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

loader.add("player0", "images/player0.png");
loader.onProgress.add(loadingProgress);
loader.load(start);

var playerSprite;
var loaded = false;
var connected = false;
var running = false;

function start() {
    playerSprite = new PIXI.Sprite(loader.resources.player0.texture);
    document.getElementById("loadingBarContainer").style.display = "none";
    playerSprite.scale.set(0.5);
    playerSprite.anchor.set(0.5);
    app.stage.addChild(playerSprite);
    loaded = true;
    app.ticker.add(graphicsUpdate);
    connect();
}
function loadingProgress(e) {
    document.getElementById("loadingBar").style.width = e.progress + "%";
    console.log("loading", e.progress);
}

function connect() {
    console.log(window.location.hostname);
    if (window.location.hostname == "10.200.140.14") {
        connection = new WebSocket("ws://localhost:20003/");
        console.log("Connecting to local...");
    } else {
        connection = new WebSocket("wss://jumpout.ws.coal.games/");
        console.log("Connecting to server...");
    }
    connection.binaryType = "arraybuffer";
    connection.onopen = onConnectionOpen;
    connection.onmessage = onConnectionMessage;
    connection.onclose = onConnectionClose;
}

var localPlayer = new Player();
localPlayer.init();

function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
}
function onConnectionOpen() {
    console.log("Connection opened");
    connected = true;
    //TEMP:
    running = true;
}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    //console.log(ms);
    parseMessage(ms);
}

// 4+4 - pos, 4+4 vel, 4 rot, 4+4 cont
function parseMessage(message) {
    const view = new DataView(message);
    let index = { i: 0 };
    parsePlayer(view, index, localPlayer);
    let controlX = view.getFloat32(index.i);
    index.i += 4;
    let controlY = view.getFloat32(index.i);
    index.i += 4;
    //console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    //console.log(localPlayer);
    playerSprite.x = localPlayer.ship.position.x;
    playerSprite.y = localPlayer.ship.position.y;
    playerSprite.rotation = localPlayer.ship.rotation;
}

function parsePlayer(view, index, player) {
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
    if (running) {
        sendControls();
    }
}

function graphicsUpdate(deltaTimeMs) {
    let deltaTime = deltaTimeMs / 1000;
    playerSprite.x += localPlayer.ship.velocity.x * deltaTime * 20;
    playerSprite.y += localPlayer.ship.velocity.y * deltaTime * 20;
    console.log(localPlayer.ship.velocity);
}

let controlVector = { x: 0, y: 0, afterBurner: 0 };
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
        case "shift":
            controlVector.afterBurner = 1;
            break;
        default:
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
        case "shift":
            controlVector.afterBurner = 1;
            break;
        default:
            break;
    }
});

function sendControls() {
    var index = 0;
    const buffer = new ArrayBuffer(10);
    const view = new DataView(buffer);
    view.setUint8(index, 1);
    index += 1;
    view.setFloat32(index, controlVector.x);
    index += 4;
    view.setFloat32(index, controlVector.y);
    index += 4;
    view.setUint8(index, controlVector.afterBurner);
    index += 1;




    connection.send(buffer);
    //console.log(buffer);
}
