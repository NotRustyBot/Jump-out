
//#region PIXI INIT
let app = new PIXI.Application({
    antialias: true,
});
let loader = PIXI.Loader.shared;
document.body.appendChild(app.renderer.view);

app.renderer.view.width = window.innerWidth;
app.renderer.view.height = window.innerHeight;
app.renderer.resize(window.innerWidth, window.innerHeight);
//app.renderer.backgroundColor = 0x161A1C;
app.renderer.backgroundColor = 0x1C2327;

window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    screen.center = new Vector(window.innerWidth / 2, window.innerHeight / 2);
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;

    virtualScreenRatio = { w: window.innerWidth / virtualScreen.w, h: window.innerHeight / virtualScreen.h };
    virtualScreen.zoomDiff = (virtualScreenRatio.w + virtualScreenRatio.h) / 2;

    minZoom = virtualScreen.minZoom * virtualScreen.zoomDiff;
    maxZoom = virtualScreen.maxZoom * virtualScreen.zoomDiff;


});

//#endregion

//#region LOADER
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
    .add("light", "images/lightBeam.png")
    .add("lensflare", "images/LensFlare.png")
    .add("lensflare0", "images/lensflare0.png")
    .add("lensflare1", "images/lensflare1.png")
    .add("lensflare2", "images/lensflare2.png")
    .add("beam", "images/beam.png")
    .add("r300_base", "images/entity/r300_base.png")
    .add("r300_dark", "images/entity/r300_dark.png")
    .add("r300_outline", "images/entity/r300_outline.png")
    .add("square600", "images/square600.png")
    .add("shape", "images/shape.png")
    .add("letadlo_base", "images/entity/letadlo_base.png")
    .add("letadlo_dark", "images/entity/letadlo_dark.png")
    .add("letadlo_outline", "images/entity/letadlo_outline.png")
    .add("minimap", "images/minimap/minimap.png")
    .add("marker1", "images/minimap/marker1.png")
    .add("marker2", "images/minimap/marker2.png")
    .add("ship_base", "images/ship_base.png")
    .add("ship_dark", "images/ship_dark.png")
    .add("ship_outline", "images/ship_outline.png")
    .add("asteroid_base", "images/asteroid_base.png")
    .add("asteroid_dark", "images/asteroid_dark.png")
    .add("asteroid_outline", "images/asteroid_outline.png")
    .add("lightMask", "images/mask_base.png")
    .add("outlineMask", "images/mask_outline.png")
    .add("shadow", "images/shadow2.png")
    .add("smooth", "images/smooth.png")
    .add("flame", "images/flame.png")
    ;
loader.onProgress.add(loadingProgress);
loader.load(start);
//#endregion

//#region INIT VARIABLES

//CAMERA INIT

var zoomStep = 1.2;
var minZoom = 0.15;
var maxZoom = 1;

var virtualScreen = { w: 2560, h: 1440, minZoom: minZoom, maxZoom: maxZoom };
var virtualScreenRatio = { w: window.innerWidth / virtualScreen.w, h: window.innerHeight / virtualScreen.h };
virtualScreen.zoomDiff = (virtualScreenRatio.w + virtualScreenRatio.h) / 2;
var camera = { x: 0, y: 0, zoom: 0.5 };

var screen = {
    center: new Vector(window.innerWidth / 2, window.innerHeight / 2),
    width: window.innerWidth,
    height: window.innerHeight
};

isOnScreen = function (position, size) {
    return (
        position.x + size > camera.x - screen.center.x / camera.zoom &&
        position.x - size < camera.x + screen.center.x / camera.zoom &&
        position.y + size > camera.y - screen.center.y / camera.zoom &&
        position.y - size < camera.y + screen.center.y / camera.zoom
    );
}


//CONTAINER INIT
var gameContainer = new PIXI.Container();
var bgContainer = new PIXI.Container();
var entityContainer = new PIXI.Container();
var playerContainer = new PIXI.Container();
var playerEffectsContainer = new PIXI.Container();
var shadowContainer = new PIXI.Container();
var effectsContainer = new PIXI.Container();
var guiContainer = new PIXI.Container();

var collisionContainer = new PIXI.ParticleContainer(10000, {
    scale: true,
    position: true,
    rotation: true,
    tint: true,
});

var gasContainer = new PIXI.Container(10000, {
    scale: true,
    position: true,
    rotation: true,
    tint: true,
});
gasContainer.filters = [new PIXI.filters.AlphaFilter(0.5)];

gameContainer.addChild(bgContainer);
gameContainer.addChild(entityContainer);
gameContainer.addChild(playerContainer);
gameContainer.addChild(playerEffectsContainer);
gameContainer.addChild(gasContainer);
gameContainer.addChild(shadowContainer);
gameContainer.addChild(effectsContainer);
effectsContainer.addChild(collisionContainer);

//GAME VARIABLES
var connection;
var loaded = false;
var connected = false;
var running = false;

var connectionAttempts = 1;
var reconnectInterval = 3000;
var maxReconnectAttempts = 100;

//GAS
var gasLoaded = false;
var gasParticleSpacing = 400;
var gasParticleDisplayAmount = 1; //DOES NOT WORK
var gasCount = 0;





//LOCAL PLAYER
var localPlayer;
var playerSprite, playerLight;
var playerSettings = { nick: "Nixk" };

//FPS
const fps = 60;

//GRAPHICS
var graphics = new PIXI.Graphics();
playerEffectsContainer.addChild(graphics);
//effectsContainer.filters = [new PIXI.filters.AlphaFilter(0.5)];
//graphics.blendMode = PIXI.BLEND_MODES.ADD;


//GAUGES
let gauges = {
    shield: document.getElementById("gaugeShield"),
    hull: document.getElementById("gaugeHull"),
    fuel: document.getElementById("gaugeFuel"),
    cargo: document.getElementById("gaugeCargo"),
}
let gaugeNumbers = {
    shield: document.getElementById("numberShield"),
    hull: document.getElementById("numberHull"),
    fuel: document.getElementById("numberFuel"),
    cargo: document.getElementById("numberCargo"),
}

//#endregion

//#region LOADING SCREEN
var loadingStatus = document.getElementById("loadingStatus");
loadingStatus.textContent = "LOADING";
var loadingDetails = document.getElementById("loadingDetails");
loadingDetails.innerHtml = "&nbsp;";

function loadingProgress(e) {
    document.getElementById("loadingBar").style.width = e.progress + "%";
    console.log("loading", e.progress);
}

function closeLoadingScreen() {
    document.getElementById("loadingBarContainer").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.display = "none";
    }, 1000);
}
//#endregion

//#region GUI INIT
var fpsText = new PIXI.Text();
fpsText.style.fill = 0xFFFFFF;
fpsText.style.fontFamily = "Overpass Mono";
fpsText.position.set(110, 10);
guiContainer.addChild(fpsText);


var miniMap = new PIXI.Container();
miniMap.pivot.set(0.5);
miniMap.position.set(screen.width - 300, screen.height - 300);
guiContainer.addChild(miniMap);

//miniMapBG.anchor.set(0.5);


var miniMapZoom = 300 / (5000 * 80);

var mapGraphics = new PIXI.Graphics();
//miniMap.addChild(mapGraphics);

//#endregion

/*
var glitchSprite = PIXI.Sprite.from("images/glitch.png");
var glitchEffect = new PIXI.filters.DisplacementFilter(glitchSprite,1);
app.stage.filters = [glitchEffect];
glitchEffect.scale.x = 0;
glitchEffect.scale.y = -40;
*/


function start() {
    loadingStatus.textContent = "CONNECTING";

    setInterval(update, 1000 / fps);

    gameContainer.pivot.set(0.5);

    app.stage.addChild(gameContainer);
    app.stage.addChild(guiContainer);
    var miniMapBG = new PIXI.Sprite(loader.resources.minimap.texture);
    miniMapBG.anchor.set(0);
    miniMapBG.scale.set(1);
    //miniMapBG.position.set(-150);
    miniMap.addChild(miniMapBG);


    app.ticker.add(graphicsUpdate);
    loaded = true;
    console.log("LOADED");
    connect();
    virtualScreenRatio = { w: window.innerWidth / virtualScreen.w, h: window.innerHeight / virtualScreen.h };
    virtualScreen.zoomDiff = (virtualScreenRatio.w + virtualScreenRatio.h) / 2;

    minZoom = virtualScreen.minZoom * virtualScreen.zoomDiff;
    maxZoom = virtualScreen.maxZoom * virtualScreen.zoomDiff;
}

//#region UPDATE

function update() {
    if (running) {
        sendControls();
    }
}
let gasHere = 0;

let averageFPS = [];

for (let i = 0; i < 60; i++) {
    averageFPS.push(0);
}

function arrayAverage(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}
function graphicsUpdate(deltaTimeFactor) {
    if (running) {
        averageFPS.push(app.ticker.FPS);
        let deltaTime = app.ticker.deltaMS / 1000;
        let fuel = localPlayer.ship.afterBurnerFuel || 0;
        fpsText.text = "    FPS: " + app.ticker.FPS.toFixed(2) + "\nAvg FPS: " + arrayAverage(averageFPS).toFixed(2) + "\n Factor: " + deltaTimeFactor.toFixed(2) + "\n   Fuel: " + fuel.toFixed(2) + "\n" + textToDisplay + "\nGasHere: " + gasHere + "\n    X/Y: " + Math.floor(localPlayer.ship.position.x / gasParticleSpacing) + " / " + Math.floor(localPlayer.ship.position.y / gasParticleSpacing);
        averageFPS.shift();

        updatePlayers(deltaTime);
        updateParticles(deltaTime);
        updateTrails(deltaTime);
        updateCamera(deltaTime);
        updateGui(deltaTime);

        Player.players.forEach(player => {

            player.lensFlare.update(player.toGlobal(new Vector(-90, 0)).add({ x: -camera.x, y: -camera.y }).mult(camera.zoom));
        });

        Entity.list.forEach(entity => {
            entity.update(deltaTime);
        });

        //gasParticleContainers[5][5].visible = true;
        gasParticleChunksDisplay();

        sunAngle += deltaTime * 0.1;
        //glitchEffect.scale.x = (Math.random()-0.5)*160;

    }
}

function updatePlayers(deltaTime) {
    Player.players.forEach(player => {
        player.ship.update(deltaTime);
        player.nameText.x = player.ship.position.x;
        player.nameText.y = player.ship.position.y - 80;
        player.miniMapMarker.position.set(player.ship.position.x * miniMapZoom, player.ship.position.y * miniMapZoom);

    });
    localPlayer.miniMapMarker.rotation = localPlayer.ship.rotation + Math.PI / 2;
}

function updateCamera(deltaTime) {
    camera.x = localPlayer.ship.position.x;
    camera.y = localPlayer.ship.position.y;
    gameContainer.scale.set(camera.zoom);
    gameContainer.x = -camera.x * camera.zoom + window.innerWidth / 2;
    gameContainer.y = -camera.y * camera.zoom + window.innerHeight / 2;

    if (camera.zoom > maxZoom) camera.zoom = maxZoom;
    if (camera.zoom < minZoom) camera.zoom = minZoom;
}

function updateParticles(deltaTime) {
    if (running) {

        Player.players.forEach(player => {
            if (player.lensFlare) {
                if (player.ship.control.y == 1) {
                    //player.lensFlare.enabled = true;
                }
                else {
                    //player.lensFlare.enabled = false;
                }
                if (player.ship.afterBurnerUsed == 1) {
                    player.lensFlare.tint = 0xFF33AA;
                }
                else {
                    player.lensFlare.tint = 0x22CCFF;
                }
            }
            /*
            let particleSystem = player.particleSystems[0];
            let particleSystem2 = player.particleSystems[1];
            let particleSystem3 = player.particleSystems[2];
            if (player.ship.control.y == 1) {
                particleSystem.settings.enabled = true;
                //particleSystem3.settings.enabled = true;
                player.lensFlare.enabled = true;

            }
            else {
                particleSystem.settings.enabled = false;
                //particleSystem3.settings.enabled = false;
                player.lensFlare.enabled = false;

            }
            if (player.ship.afterBurnerUsed == 1 && player.ship.control.y == 1) {
                //particleSystem2.settings.enabled = true;
                particleSystem.settings.emitRate = 600 * player.ship.afterBurnerFuel / player.ship.stats.afterBurnerCapacity;
                particleSystem.settings.color.min = 0xFFEFAA;
                particleSystem.settings.color.max = 0xff6600;
                particleSystem.settings.randomVelocity = 30;

                //particleSystem3.settings.color.min = 0xAA8855;
                //particleSystem3.settings.color.max = 0xAA2277;
                player.lensFlare.tint = 0xAA6622;
                //particleSystem.settings.emitRate = 300;
            }
            else {
                player.lensFlare.tint = 0x1199FF;
                //particleSystem2.settings.enabled = false;
                particleSystem.settings.color.min = 0xFFFFFF;
                particleSystem.settings.color.max = 0x1199FF;
                particleSystem.settings.emitRate = 200;
                particleSystem.settings.randomVelocity = 2;

                //particleSystem3.settings.color.min = 0xBEDEFE;
                //particleSystem3.settings.color.max = 0x0077FF;
                //particleSystem.settings.emitRate = 150;
            }
            let global = player.toGlobal(new Vector(-30, 0));
            //particleSystem3.updateEmitter((player.ship));
            //particleSystem3.update(deltaTime);
            particleSystem.updateEmitter(player.ship);
            particleSystem.update(deltaTime);


            //particleSystem2.updateEmitter((player.ship));
            //particleSystem2.update(deltaTime);
*/
        });

        ParticleSystem.particleSystems.forEach(ps => {
            ps.update(deltaTime);
        });




    }
}

function updateTrails(deltaTime) {
    graphics.clear();
    Trail.trails.forEach(trail => {
        trail.update(deltaTime);
    });
}

function updateGui(deltaTime) {
    mapGraphics.clear();
    /*mapGraphics.beginFill(0x111133);
    mapGraphics.lineStyle(5, 0x334488);
    mapGraphics.drawCircle(0, 0, 120);
    mapGraphics.endFill();
    */
    mapGraphics.beginFill(0x0000FF);
    mapGraphics.lineStyle(0, 0x000000);
    mapGraphics.drawStar(localPlayer.ship.position.x * miniMapZoom, localPlayer.ship.position.y * miniMapZoom, 3, 6, 3, localPlayer.ship.rotation + Math.PI / 2);
    mapGraphics.endFill();

    let shieldRatio = 75;
    let hullRatio = 75;
    let fuelRatio = localPlayer.ship.afterBurnerFuel / 6;
    let cargoRatio = 0;

    gauges.shield.style.width = shieldRatio + "%";
    gauges.hull.style.width = hullRatio + "%";
    gauges.fuel.style.width = fuelRatio + "%";
    gauges.cargo.style.width = cargoRatio + "%";

    gaugeNumbers.shield.innerHTML = shieldRatio.toFixed(0);
    gaugeNumbers.hull.innerHTML = hullRatio.toFixed(0);
    gaugeNumbers.fuel.innerHTML = fuelRatio.toFixed(0);
    gaugeNumbers.cargo.innerHTML = cargoRatio.toFixed(0);

}

//#endregion

//#region NETWORK



function connect() {
    loadingDetails.textContent = "Attempt "+connectionAttempts+"/"+maxReconnectAttempts;
    //console.log(window.location.hostname);
    if (window.location.hostname == "10.200.140.14") {
        connection = new WebSocket("ws://10.200.140.14:20003/");
        console.log("Connecting to local...");
    } else {
        connection = new WebSocket("wss://jumpout.ws.coal.games/");
        console.log("Connecting to server... Attempt " + connectionAttempts);
    }
    connection.binaryType = "arraybuffer";
    //setTimeout(onConnectionTimeout,reconnectInterval);
    connection.onopen = onConnectionOpen;
    connection.onmessage = onConnectionMessage;
    connection.onclose = onConnectionClose;
}

function reconnect() {
    if (!connected) {
        connectionAttempts++;
        if (connectionAttempts <= maxReconnectAttempts) {
            connect();
        }
        else {
            console.log("Stopped reconnecting after " + (connectionAttempts - 1) + " attempts")
        }
    }
}

function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
    setTimeout(reconnect, reconnectInterval)
}
function onConnectionOpen() {
    console.log("Connection opened");
    connectionAttempts = 0;
    connected = true;
    sendInit();

}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    //console.log(typeof(ms)); //myslím, že je chyba na serveru
    parseMessage(ms);
}

function parseMessage(message) {
    const view = new AutoView(message);
    while (view.index < message.byteLength) {
        let messageType = view.getUint8();
        if (running) {
            switch (messageType) {
                case serverHeaders.update:
                    parsePlayer(view);
                    break;
                case serverHeaders.newPlayers:
                    parseNewPlayers(view);
                    break;
                case serverHeaders.playerLeft:
                    parseLeftPlayers(view);
                    break;
                case serverHeaders.entitySetup:
                    parseEntitySetup(view);
                    break;
                case serverHeaders.collisionEvent:
                    parseCollision(view);
                    break;
                case serverHeaders.debugPacket:
                    parseDebug(view);
                    break;
                case serverHeaders.proximity:
                    parseProximity(view);
                    break;
                case serverHeaders.actionReply:
                    parseActionReply(view);
                    break;
                case serverHeaders.entityRemove:
                    parseEntityRemoved(view);
                    break;
                case serverHeaders.gasUpdate:
                    parseGasUpdate(view);
                    break;
                case serverHeaders.itemCreate:
                    parseItemCreate(view);
                    break;
                case serverHeaders.itemRemove:
                    parseItemRemove(view);
                    break;
                case serverHeaders.inventoryChange:
                    parseInventoryChange(view);
                    break;
            }
        }
        else if (messageType == serverHeaders.initResponse) {
            parseInit(view);
        } else if (messageType == serverHeaders.gasData) {
            parseGas(view);
        }
    }

    //console.log("controlX: " + controlX + " Y:" + controlY + "struct on the next line");
    //console.log(localPlayer);

}

function parseGas(view) {
    gasParticleSpacing = view.getUint16();
    let w = view.getUint16();
    let h = view.getUint16();
    let bytes = 4;
    for (let x = 0; x < w; x++) {
        Universe.gasMap[x] = [];
        for (let y = 0; y < h; y++) {
            const e = view.getUint8();
            bytes++;
            Universe.gasMap[x][y] = e;
        }
    }

    loadingStatus.textContent = "GENERATING MAP";
    loadingDetails.textContent = "Generating gas"

    document.getElementById("loadingBar").style.transition = "none";
    document.getElementById("loadingBar").style.width = 0 + "%";

    setTimeout(function () { generateGas(); }, 0);
}

function parsePlayer(view) {
    let ship = {};
    let id = view.getUint16();

    //console.log("Parsing player update with ID " + id);
    let player = Player.players.get(id);
    if (player != undefined) {
        view.deserealize(ship, Datagrams.shipUpdate);

        Datagrams.shipUpdate.transferData(player.ship, ship);

    }
    else {
        console.log("Undefined player update with ID " + id);
        console.log(view.index);
        console.log(view.view.buffer);
    }
}

function parseInit(view) {
    let id = view.getUint16();
    console.log("Setting up local player with ID " + id);
    localPlayer = new Player(id);
    initLocalPlayer();
    let existingPlayers = view.getUint8();
    for (let i = 0; i < existingPlayers; i++) {
        let p = {};
        view.deserealize(p, Datagrams.initPlayer);
        console.log("Adding existing player with ID " + p.id);

        let pl = new Player(p.id);
        Datagrams.initPlayer.transferData(pl, p);
    }


    running = true;

}

function parseNewPlayers(view) {
    let newPlayers = view.getUint8();
    for (let i = 0; i < newPlayers; i++) {
        let p = {};
        view.deserealize(p, Datagrams.initPlayer);
        if (p.id != localPlayer.id) {
            console.log("Adding new player with ID " + p.id);
            let pl = new Player(p.id);
            Datagrams.initPlayer.transferData(pl, p);
        }
    }
}

function parseEntitySetup(view) { // tady se děje init
    let size = view.getUint16();
    for (let i = 0; i < size; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.EntitySetup);
        let entity = new Entity(temp.type, temp.id);
        Datagrams.EntitySetup.transferData(entity, temp);
        entity.update(0);
    }
}

function parseProximity(view) { // tady se děje update
    let size = view.getUint16();
    for (let i = 0; i < size; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.EntitySetup);
        let entity = Entity.list.get(temp.id);
        if (entity != undefined) {
            Datagrams.EntitySetup.transferData(entity, temp);
            entity.update(0);
        } else {
            console.log(temp.id);
        }
    }
}

function parseEntityRemoved(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.EnitiyRemove);
    Entity.list.get(temp.id).remove();
}

function parseGasUpdate(view) {
    let gasCount = view.getUint16();
    for (let i = 0; i < gasCount; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.GasUpdate);
        Universe.gasMap[temp.position.x][temp.position.y] = temp.value;
    }
}

function parseLeftPlayers(view) {
    let leftPlayersAmount = view.getUint8();
    for (let i = 0; i < leftPlayersAmount; i++) {
        let pid = view.getUint16();
        console.log("Removing player with ID " + pid);
        Player.players.get(pid).delete();
    }
}

function parseCollision(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.CollisionEvent);
    let ship = Player.players.get(temp.shipId).ship;
    let speed = ship.velocity.length() / 800;
    //console.log(speed);
    let p = new ParticleSystem({
        container: collisionContainer,
        infinite: false,
        duration: 0.1,
        offset: new Vector(0, 0),
        enabled: true,
        texture: loader.resources.spark.texture,
        maxParticles: 50 * speed,
        emitRate: 500 * speed,
        inheritVelocity: 0.03,
        inheritRotation: 0,
        rotateToVelocity: true,
        randomRotation: false,
        randomVelocity: 50,
        scale: new Ramp(3, 0),
        alpha: new Ramp(1, 0),
        velocity: new Ramp(400 + 500 * speed, 0),
        color: new ColorRamp(0xffdd88, 0xff9911),
        lifetime: new Ramp(0.1, 0.5 + 0.5 * speed),
        rotationSpeed: new Ramp(0, 0),
    });
    p.setEmitter(temp.position, ship.velocity, ship.rotation);
    //Player.players.get(temp.shipId).ship.rotation
    p.emitter.oldPosition = p.emitter.position;
    //particles go here
}

function parseActionReply(view) {
    let temp = {};
    let type = view.getUint8();
    view.index--;
    view.deserealize(temp, ReplyData[type]);
}

function parseItemCreate(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.ItemCreate);
    //id, position, item, stack
}

function parseItemRemove(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.ItemRemove);
    //id
}

function parseInventoryChange(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.InventoryChange);
    //shipId, slot, item, stack
}

let textToDisplay = "";
function parseDebug(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.DebugPacket);
    textToDisplay = temp.data;
}

const buffer = new ArrayBuffer(1000);
function sendControls() {
    handleInput();
    const view = new AutoView(buffer);
    view.setUint8(1);

    let toSend = { control: controlVector, afterBurnerActive: controlVector.afterBurner, action: 0 };
    view.serialize(toSend, Datagrams.input);

    if (actionID == 1) {
        view.setUint8(clientHeaders.smartAction);
        view.serialize({ handle: 1, actionId: ActionId.placeObject }, Datagrams.SmartAction);
        view.serialize({ structure: 1 }, SmartActionData[ActionId.placeObject]);
    } else if (actionID == 2) {
        view.setUint8(clientHeaders.smartAction);
        view.serialize({ handle: 1, actionId: ActionId.MineRock }, Datagrams.SmartAction);
        view.serialize({}, SmartActionData[ActionId.MineRock]);
    }
    actionID = 0;

    if (serverCommand.length > 0) {
        view.setUint8(clientHeaders.serverConsole);
        view.serialize({ command: serverCommand }, Datagrams.ServerConsole);
        serverCommand = "";
    }

    connection.send(buffer.slice(0, view.index));
    //console.log(buffer);
}

function sendInit() {
    const view = new AutoView(buffer);
    view.setUint8(0);

    view.serialize(playerSettings, Datagrams.playerSettings);

    connection.send(buffer.slice(0, view.index));
}

let serverCommand = ""
function serverExecute(command) {
    serverCommand = command;
}

//#endregion

//#region INPUT
let controlVector = { x: 0, y: 0, afterBurner: 0 };
let actionID = 0;
let keyDown = {};

function handleInput() {
    controlVector.x = 0;
    controlVector.y = 0;
    controlVector.afterBurner = 0;

    if (keyDown.s) controlVector.y = -1;
    if (keyDown.w) controlVector.y = 1;
    if (keyDown.d) controlVector.x = 1;
    if (keyDown.a) controlVector.x = -1;
    if (keyDown.shift) controlVector.afterBurner = 1;

    if (keyDown.f) {
        actionID = 1;
        keyDown.f = false;
    } else if (keyDown.e) {
        actionID = 2;
        keyDown.f = false;
    }

}

window.addEventListener("keydown", function (e) {
    let key = e.key.toLocaleLowerCase();
    keyDown[key] = true;
});

window.addEventListener("keyup", function (e) {
    let key = e.key.toLocaleLowerCase();
    keyDown[key] = false;
});

window.addEventListener("wheel", e => {
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

    if (camera.zoom > maxZoom) camera.zoom = maxZoom;
    if (camera.zoom < minZoom) camera.zoom = minZoom;
});

//#endregion

//#region GAS

let gasCamWidth = 2 * Math.floor(screen.width / gasParticleSpacing / 2 / camera.zoom + 5);
let gasCamHeight = 2 * Math.floor(screen.height / gasParticleSpacing / 2 / camera.zoom + 5);
//let gasColorMap = new ColorRamp(0x161A1C, 0xbf5eff);
//let gasColorMap = new ColorRamp(0x161A1C, 0xa04060);
let gasColorMap = new ColorGraph([0x161A1C, 0xa04060]);
gasColorMap = new ColorGraph([0x006d77, 0x83c5be, 0xedf6f9, 0xffddd2, 0xe29578,]);

gasColorMap = new ColorGraph([0x6f1d1b, 0xbb9457, 0x432818, 0x99582a, 0xffe6a7, 0x6f1d1b, 0xbb9457, 0x432818, 0x99582a, 0xffe6a7,]);

gasColorMap = new ColorGraph([0x397367, 0x63ccca, 0x5da399, 0x42858c, 0x35393c,]);

//gasColorMap = new ColorGraph([0x000000,0x3d2645,0x832161,0xda4167,0xf0eff4]);

//gasColorMap = new ColorGraph([0xedcb96,0xf7c4a5,0x9e7682,0x605770,0x4d4861]);


let gasParticles = [];
let gasDisplay = [];

function gasParticleChunksDisplay() {
    if (gasLoaded) {

        gasCamWidth = 2 * Math.floor(screen.width / gasParticleSpacing / 2 / camera.zoom + 5);
        gasCamHeight = 2 * Math.floor(screen.height / gasParticleSpacing / 2 / camera.zoom + 5);
        let gasPosX = Math.floor(localPlayer.ship.position.x / gasParticleSpacing);
        let gasPosY = Math.floor(localPlayer.ship.position.y / gasParticleSpacing);
        let avalible = [];
        gasHere = Universe.gasMap[gasPosX][gasPosY];

        for (let i = 0; i < gasParticles.length; i++) {
            const g = gasParticles[i];

            let gX = Math.floor(g.x / gasParticleSpacing);
            let gY = Math.floor(g.y / gasParticleSpacing);
            // mimo obrazovke
            if (gX > gasPosX + gasCamWidth / 2 ||
                gX < gasPosX - gasCamWidth / 2 ||
                gY > gasPosY + gasCamHeight / 2 ||
                gY < gasPosY - gasCamHeight / 2
            ) { // zneviditelint
                avalible.push(g);
                gasDisplay[gX][gY] = false;
                g.visible = false;
            } else {
                let e = Universe.gasMap[gX][gY];
                g.alpha = e / 200 + 0.5;
                g.rotation += 0.03 * g.alpha + 0.008;
                g.tint = gasColorMap.evaluate(e / 100);
                g.red = Math.random();
                gasDisplay[gX][gY] = true;
                g.visible = true;
            }
        }


        for (let px = Math.max(gasPosX - gasCamWidth / 2, 0); px < gasPosX + gasCamWidth / 2; px++) {
            for (let py = Math.max(gasPosY - gasCamHeight / 2, 0); py < gasPosY + gasCamHeight / 2; py++) {

                if (!gasDisplay[px][py]) {
                    let g = avalible.pop();
                    if (g != undefined) {
                        let e = Universe.gasMap[px][py];
                        gasDisplay[px][py] = true;
                        g.alpha = e / 200 + 0.5;
                        g.visible = true;
                        g.tint = gasColorMap.evaluate(e / 100);
                        g.position.set(px * gasParticleSpacing + gasParticleSpacing * Math.random(), py * gasParticleSpacing + gasParticleSpacing * Math.random());
                    }
                }
            }
        }
    }

}

function generateGas() {
    console.log("generating");

    document.getElementById("loadingBar").style.transition = "width .2s";


    for (let i = 0; i < 2000; i++) {
        let gasParticle = new PIXI.Sprite(loader.resources.smooth.texture);

        gasParticles[i] = gasParticle;

        gasParticle.anchor.set(0.53);
        gasParticle.scale.set(6);
        gasParticle.rotation = Math.random() * 6.28;

        gasContainer.addChild(gasParticle);

        gasCount++;
    }

    for (let x = 0; x < 1000; x++) {
        gasDisplay[x] = [];
        for (let y = 0; y < 1000; y++) {
            gasDisplay[x][y] = false;
        }
    }

    closeLoadingScreen();
    gasLoaded = true;
}

//#endregion

function initLocalPlayer() {
    localPlayer.nick = playerSettings.nick;
    localPlayer.miniMapMarker.texture = loader.resources.marker2.texture;
    localPlayer.miniMapMarker.anchor.set(0.5, 0.6);
}

