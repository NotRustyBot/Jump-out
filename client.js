var connection;
let app = new PIXI.Application({
    antialias: true,
});
let loader = PIXI.Loader.shared;
document.body.appendChild(app.renderer.view);

app.renderer.view.width = window.innerWidth;
app.renderer.view.height = window.innerHeight;
app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.backgroundColor = 0x000000;



window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});

loader
    .add("player0", "images/player0.png")
    .add("kour", "images/kour.png")
    .add("kour2", "images/kour2.png")
    .add("kour3", "images/kour3.png")
    .add("kour4", "images/kour4.png")
    .add("kour5", "images/kour5.png")
    .add("spark", "images/spark.png")
    .add("player1", "images/player2.png")
    ;
loader.onProgress.add(loadingProgress);
loader.load(start);

var playerSprite;
var loaded = false;
var connected = false;
var running = false;


var particleSystem, particleSystem2, particleSystem3;
function start() {
    playerSprite = new PIXI.Sprite(loader.resources.player0.texture);
    document.getElementById("loadingBarContainer").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.display = "none";
    }, 1000);
    playerSprite.scale.set(0.5);
    playerSprite.anchor.set(0.5);


    particleSystem = new ParticleSystem({
        texture: loader.resources.spark.texture,
        maxParticles: 10000,
        emitRate: 200,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomVelocity: 50,
        scale: new Ramp(1, 1),
        alpha: new Ramp(1, 0),
        velocity: new Ramp(600, 0),
        color: new ColorRamp(0xFFFFFF, 0x1199FF),
        lifetime: new Ramp(0.1, 0.5)
    });
    particleSystem2 = new ParticleSystem({
        texture: loader.resources.kour5.texture,
        maxParticles: 10000,
        emitRate: 15,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomVelocity: 20,
        scale: new Ramp(0.5, 5),
        alpha: new Ramp(0.05, 0),
        velocity: new Ramp(500, 0),
        color: new ColorRamp(0xFFFFFF, 0xFDFDFD),
        lifetime: new Ramp(1, 3)
    });
    particleSystem3 = new ParticleSystem({
        enabled:true,
        texture: loader.resources.kour3.texture,
        maxParticles: 10000,
        emitRate: 300,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomVelocity: 0,
        scale: new Ramp(0.15, 0),
        alpha: new Ramp(0.3, 0),
        velocity: new Ramp(0, 0),
        color: new ColorRamp(0x1199FF, 0xFEFEFE),
        lifetime: new Ramp(3, 3)
    });

    app.stage.addChild(playerSprite);

    app.ticker.add(graphicsUpdate);
    loaded = true;
    console.log("LOADED");
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



function updateParticles(deltaTime) {
    if (running) {
        if (localPlayer.ship.control.y == 1) {
            particleSystem.settings.enabled = true;
            particleSystem3.settings.enabled = true;

        }
        else {
            particleSystem.settings.enabled = false;
            particleSystem3.settings.enabled = false;

        }
        if (localPlayer.ship.afterBurnerActive == 1 && localPlayer.ship.control.y == 1) {
            particleSystem2.settings.enabled = true;
            particleSystem.settings.color.max = 0xff8800;
            particleSystem.settings.color.min = 0xFFEEAA;
            //particleSystem.settings.emitRate = 300;
        }
        else {
            particleSystem2.settings.enabled = false;
            particleSystem.settings.color.max = 0x1199FF;
            particleSystem.settings.color.min = 0xFFFFFF;
            //particleSystem.settings.emitRate = 150;
        }
        particleSystem3.updateEmitter((localPlayer.ship));
        particleSystem3.update(deltaTime);
        particleSystem.updateEmitter(localPlayer.ship);
        particleSystem.update(deltaTime);


        particleSystem2.updateEmitter((localPlayer.ship));
        particleSystem2.update(deltaTime);




    }
}

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

function parseMessage(message) {
    const view = new DataView(message);
    let index = { i: 0 };
    let messageType = view.getUint8(index.i);
    index.i += 1;
    switch (messageType) {
        case 1:
            parsePlayer(view, index);
            break;
        case 2:
            parseStats(view, index, localPlayer);
            console.log(localPlayer.ship.stats);
            let playersCount = view.getUint16(index.i);
            index.i += 2;
            for (let i = 0; i < playersCount; i++){
                pl = new Player();
                pl.init();
                parseStats(view,index,pl)
            }
            break;
    }

    //console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    //console.log(localPlayer);
    playerSprite.x = localPlayer.ship.position.x;
    playerSprite.y = localPlayer.ship.position.y;
    playerSprite.rotation = localPlayer.ship.rotation;
}

function parsePlayer(view, index) {
    let id = view.getInt16(index.i);
    index.i += 2;
    //let player = Player.findID(id);
    let player = localPlayer;

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
    player.ship.control.x = view.getFloat32(index.i);
    index.i += 4;
    player.ship.control.y = view.getFloat32(index.i);
    index.i += 4;
    player.ship.afterBurnerActive = view.getUint8(index.i);
    index.i += 1;
    player.ship.afterBurnerFuel = view.getFloat32(index.i); //??
    index.i += 4;
}

function parseStats(view, index, player) {
    player.ship.stats.name = view.getUint8(index.i);
    index.i += 1;
    player.ship.stats.speed = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.acceleration = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.reverseAcceleration = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.rotationSpeed = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.afterBurnerSpeedBonus = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.afterBurnerRotationBonus = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.afterBurnerAccelerationBonus = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.afterBurnerCapacity = view.getFloat32(index.i);
    index.i += 4;
    player.ship.stats.drag = view.getFloat32(index.i);
    index.i += 4;
}

const fps = 60;

setInterval(update, 1000 / fps);

function update() {
    if (running) {
        sendControls();

        //console.log(localPlayer.ship.afterBurnerFuel);
    }
}

var fpsText = new PIXI.Text();
fpsText.style.fill = 0xFFFFFF;
fpsText.style.fontFamily = "Overpass Mono";
app.stage.addChild(fpsText);

function graphicsUpdate(deltaTimeFactor) {
    let deltaTime = app.ticker.deltaMS / 1000;
    fpsText.text = "    FPS: " + app.ticker.FPS.toFixed(2) + "\nMin FPS: " + app.ticker.minFPS + "\nMax FPS: " + app.ticker.maxFPS + "\n Factor: " + deltaTimeFactor.toFixed(2);
    localPlayer.ship.position.x += localPlayer.ship.velocity.x * deltaTime;
    localPlayer.ship.position.y += localPlayer.ship.velocity.y * deltaTime;
    playerSprite.x = localPlayer.ship.position.x;
    playerSprite.y = localPlayer.ship.position.y;
    //console.log(localPlayer.ship.velocity);
    updateParticles(deltaTime);
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
            controlVector.afterBurner = 0;
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
