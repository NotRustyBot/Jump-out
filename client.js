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

var camera = {x:0,y:0,zoom:0.5};
var zoomStep = 1.2;
var minZoom = 0.3;
var maxZoom = 6;
var gameContainer = new PIXI.Container();

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
    .add("kour7", "images/kour7.png")
    .add("spark", "images/spark.png")
    .add("circle", "images/circle.png")
    .add("player1", "images/player2.png")
    .add("light", "images/light.png")
    ;
loader.onProgress.add(loadingProgress);
loader.load(start);

var playerSprite, playerLight;
var loaded = false;
var connected = false;
var running = false;


var particleSystem, particleSystem2, particleSystem3;
function start() {
    playerSprite = new PIXI.Sprite(loader.resources.player0.texture);
    playerLight = new PIXI.Sprite(loader.resources.light.texture);
    document.getElementById("loadingBarContainer").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.display = "none";
    }, 1000);
    playerSprite.scale.set(0.5);
    playerSprite.anchor.set(0.5);

    /*playerSprite.addChild(playerLight);
    playerLight.anchor.set(0.25,0.5);
    playerLight.scale.set(10);
    gameContainer.mask = playerLight;*/
    


    particleSystem = new ParticleSystem({
        texture: loader.resources.spark.texture,
        maxParticles: 10000,
        emitRate: 200,
        inheritVelocity: 0,
        inheritRotation: -60,
        rotateToVelocity: true,
        randomRotation:false,
        randomVelocity: 10,
        scale: new Ramp(1, 1),
        alpha: new Ramp(1, 0),
        velocity: new Ramp(1000, 500),
        color: new ColorRamp(0xFFFFFF, 0x1199FF),
        lifetime: new Ramp(0.1, 0.15),
        rotationSpeed: new Ramp(0,0)
    });
    particleSystem2 = new ParticleSystem({
        texture: loader.resources.kour7.texture,
        maxParticles: 10000,
        emitRate: 15,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomRotation:true,
        randomVelocity: 20,
        scale: new Ramp(0.5, 5),
        alpha: new Ramp(0.15, 0),
        velocity: new Ramp(500, 0),
        color: new ColorRamp(0xFFFFFF, 0xFDFDFD),
        lifetime: new Ramp(1, 3),
        rotationSpeed: new Ramp(-1,1)
    });
    particleSystem3 = new ParticleSystem({
        enabled:true,
        texture: loader.resources.kour7.texture,
        maxParticles: 10000,
        emitRate: 120,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomVelocity: 0,
        randomRotation:true,
        scale: new Ramp(0.1, 1.5),
        alpha: new Ramp(0.1, 0),
        velocity: new Ramp(15, 0),
        color: new ColorRamp(0xBEDEFE, 0x0077FF),
        lifetime: new Ramp(40, 10),
        rotationSpeed: new Ramp(-2,2)
    });

    gameContainer.pivot.set(0.5);
    gameContainer.addChild(playerSprite);
    app.stage.addChild(gameContainer);

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
            particleSystem.settings.emitRate = 1800 * localPlayer.ship.afterBurnerFuel/localPlayer.ship.stats.afterBurnerCapacity;
            particleSystem.settings.color.min = 0xFFEFAA;
            particleSystem.settings.color.max = 0xff6600;
            particleSystem.settings.randomVelocity = 30;

            particleSystem3.settings.color.min = 0xAA8855;
            particleSystem3.settings.color.max = 0xAA2277;
            //particleSystem.settings.emitRate = 300;
        }
        else {
            particleSystem2.settings.enabled = false;
            particleSystem.settings.color.min = 0xFFFFFF;
            particleSystem.settings.color.max = 0x1199FF;
            particleSystem.settings.emitRate = 900;
            particleSystem.settings.randomVelocity = 5;

            particleSystem3.settings.color.min = 0xBEDEFE;
            particleSystem3.settings.color.max = 0x0077FF;
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

// 4+4 - pos, 4+4 vel, 4 rot, 4+4 cont
function parseMessage(message) {
    const view = new AutoView(message);
    let messageType = view.view.getUint8(view.index);
    view.index += 1;
    switch (messageType) {
        case 1:
            parsePlayer(view);
            break;
    }

    //console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    //console.log(localPlayer);
    playerSprite.x = localPlayer.ship.position.x;
    playerSprite.y = localPlayer.ship.position.y;
    playerSprite.rotation = localPlayer.ship.rotation;
}

function parsePlayer(view) {
    let ship = {};
    
    let id = view.view.getUint16(view.index);
    view.index += 2; 
    let player = localPlayer ;// Player.findID(id);

    view.deserealize(ship, Datagrams.shipUpdate);

    Datagrams.shipUpdate.transferData(player.ship, ship);
}



const fps = 60;

setInterval(update, 1000 / fps);

function update() {
    if (running) {
        sendControls();
    }
}

var fpsText = new PIXI.Text();
fpsText.style.fill = 0xFFFFFF;
fpsText.style.fontFamily = "Overpass Mono";
app.stage.addChild(fpsText);

function graphicsUpdate(deltaTimeFactor) {
    let deltaTime = app.ticker.deltaMS / 1000;
    let fuel = localPlayer.ship.afterBurnerFuel || 0;
    fpsText.text = "    FPS: " + app.ticker.FPS.toFixed(2) + "\nMin FPS: " + app.ticker.minFPS + "\nMax FPS: " + app.ticker.maxFPS + "\n Factor: " + deltaTimeFactor.toFixed(2) + "\n   Fuel: " + fuel.toFixed(2);
    localPlayer.ship.position.x += localPlayer.ship.velocity.x * deltaTime;
    localPlayer.ship.position.y += localPlayer.ship.velocity.y * deltaTime;
    playerSprite.x = localPlayer.ship.position.x;
    playerSprite.y = localPlayer.ship.position.y;
    //console.log(localPlayer.ship.velocity);
    updateParticles(deltaTime);
    camera.x = localPlayer.ship.position.x;
    camera.y = localPlayer.ship.position.y;
    gameContainer.scale.set(camera.zoom);
    gameContainer.x = -camera.x*camera.zoom+window.innerWidth/2;
    gameContainer.y = -camera.y*camera.zoom+window.innerHeight/2;
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

window.addEventListener("mousewheel", e => {
    //var oldTargetZoom = targetZoom;
    let targetZoom = camera.zoom;
	if (e.deltaY < 0) {
		if (targetZoom <= maxZoom) targetZoom *= zoomStep;
	}
	if (e.deltaY > 0) {
		if (targetZoom >= minZoom) targetZoom /= zoomStep;
	}
	/*if (targetZoom != oldTargetZoom) {
		zoomDuration = 0;
		startZoom = zoom;
	}*/
    camera.zoom = targetZoom;
});

function sendControls() {
    var index = 0;
    const buffer = new ArrayBuffer(1 + Datagrams.input.size);
    const view = new AutoView(buffer);
    view.view.setUint8(view.index, 1);
    view.index += 1;

    let toSend = {control: controlVector, afterBurnerActive: controlVector.afterBurner};

    view.serialize(toSend, Datagrams.input);


    connection.send(buffer);
    //console.log(buffer);
}
