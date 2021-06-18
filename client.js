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
    .add("debug_base", "images/ships/debug_base.png")
    .add("debug_dark", "images/ships/debug_dark.png")
    .add("debug_outline", "images/ships/debug_outline.png")
    .add("fuel_base", "images/ships/fuel_base.png")
    .add("fuel_dark", "images/ships/fuel_dark.png")
    .add("fuel_outline", "images/ships/fuel_outline.png")
    .add("hacker_base", "images/ships/hacker_base.png")
    .add("hacker_dark", "images/ships/hacker_dark.png")
    .add("hacker_outline", "images/ships/hacker_outline.png")
    .add("asteroid_base", "images/asteroid_base.png")
    .add("asteroid_dark", "images/asteroid_dark.png")
    .add("asteroid_outline", "images/asteroid_outline.png")
    .add("lightMask", "images/mask_base.png")
    .add("outlineMask", "images/mask_outline.png")
    .add("shadow", "images/shadow2.png")
    .add("smooth", "images/smooth.png")
    .add("flame", "images/flame.png")
    .add("item_base", "images/item_base.png")
    .add("item_dark", "images/item_dark.png")
    .add("item_outline", "images/item_outline.png")
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
    if (detachCamera) {
        return (
            position.x + size > localPlayer.ship.position.x - screen.center.x / camera.zoom &&
            position.x - size < localPlayer.ship.position.x + screen.center.x / camera.zoom &&
            position.y + size > localPlayer.ship.position.y - screen.center.y / camera.zoom &&
            position.y - size < localPlayer.ship.position.y + screen.center.y / camera.zoom
        );
    }
    return (
        position.x + size > camera.x - screen.center.x / camera.zoom &&
        position.x - size < camera.x + screen.center.x / camera.zoom &&
        position.y + size > camera.y - screen.center.y / camera.zoom &&
        position.y - size < camera.y + screen.center.y / camera.zoom
    );
}

function screenToWorldPos(position) {
    return (new Vector(
        camera.x + (position.x - screen.center.x) / camera.zoom,
        camera.y + (position.y - screen.center.y) / camera.zoom
    ));
}
function worldToScreenPos(position) {
    return (new Vector(
        (position.x - camera.x) * camera.zoom + screen.center.x,
        (position.y - camera.y) * camera.zoom + screen.center.y
    ));
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
var networker = new Worker("networker.js");
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
/**
 * @type {Player}
 */
var localPlayer;
var playerSprite, playerLight;
var playerSettings = { nick: "Nixk" };

//FPS
const fps = 30;

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
    speed: document.getElementById("gaugeSpeed"),
    maxSpeed: document.getElementById("gaugeSpeed2"),
}
let gaugeNumbers = {
    shield: document.getElementById("numberShield"),
    hull: document.getElementById("numberHull"),
    fuel: document.getElementById("numberFuel"),
    cargo: document.getElementById("numberCargo"),
    speed: document.getElementById("numberSpeed"),
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

var loadingScreenOpen = true;

function closeLoadingScreen() {
    loadingScreenOpen = false;
    document.getElementById("loadingBarContainer").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.display = "none";
    }, 1000);
}
function openLoadingScreen() {
    loadingScreenOpen = true;
    document.getElementById("loadingBarContainer").style.display = "flex";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.opacity = "1";
    }, 100);
}
//#endregion

//#region GUI INIT
var fpsText = new PIXI.Text();
fpsText.style.fill = 0xFFFFFF;
fpsText.style.fontFamily = "Overpass Mono";
fpsText.position.set(110, 10);
guiContainer.addChild(fpsText);

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
    if (running && connected) {
        sendControls();
    }
}
let gasHere = 0;

let averageFPS = [];

for (let i = 0; i < 60; i++) {
    averageFPS.push(0);
}

let minFPS = [];

for (let i = 0; i < 360; i++) {
    minFPS.push(1000);
}

function arraySum(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
}

function arrayAverage(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}


function arrayMin(array) {
    let min = array[0];
    for (let i = 1; i < array.length; i++) {
        min = Math.min(min, array[i]);
    }
    return min;
}

let performanceData = {
    data: [],
    lastTime: 0,
    logIndex: 0,
    streaming: false,
    start: function () {
        this.lastTime = window.performance.now();
        this.logIndex = 0;
    },
    log: function () {
        if (this.data[this.logIndex] == undefined) {
            this.data[this.logIndex] = 0;
        }
        this.data[this.logIndex] += window.performance.now() - this.lastTime;
        this.logIndex++;
    },
    next: function () {
        this.lastTime = window.performance.now();
    },
    logAndNext: function () {
        this.log();
        this.next();
    },
    stop: function () {
        if (this.data[this.logIndex] == undefined) {
            this.data[this.logIndex] = 0;
        }
        this.data[this.logIndex]++;

        if (this.streaming) {
            for (let i = 0; i < this.data.length; i++) {
                this.data[i] = this.data[i] * 0.99;
            }
            window.localStorage.setItem("performanceData", performanceData.string());
        }
    },
    string: function () {
        let out = "";
        this.data.forEach(e => {
            out += Math.floor(e) + ",";
        });
        return out.substring(0, out.length - 1);
    }
}

function updateAppend(dt) {

}

let sunAngle = 0;
function graphicsUpdate(deltaTimeFactor) {
    if (running) {

        averageFPS.push(app.ticker.FPS);
        minFPS.push(app.ticker.FPS);
        let deltaTime = app.ticker.deltaMS / 1000;
        let fuel = localPlayer.ship.afterBurnerFuel || 0;
        netTimer += deltaTime;
        fpsText.text = "    FPS: " + app.ticker.FPS.toFixed(2) + "\nAvg FPS: " + arrayAverage(averageFPS).toFixed(2) + "\nMin FPS: " + arrayMin(minFPS).toFixed(2) + "\n Factor: " + deltaTimeFactor.toFixed(2) + "\n" + textToDisplay + "\nGasHere: " + gasHere + "\n    X/Y: " + Math.floor(localPlayer.ship.position.x / gasParticleSpacing) + " / " + Math.floor(localPlayer.ship.position.y / gasParticleSpacing) + "\n" + "Network: " + (downBytesDisplay / 1000).toFixed(1) + "KB▼ | " + (upBytesDisplay / 1000).toFixed(1) + "KB▲" + " | " + ping.toFixed(0) + "ms" + "\n" + (performance.streaming ? "streaming..." : "");
        if (netTimer >= 1) {
            downBytesDisplay = downBytes;
            downBytes = 0;
            upBytesDisplay = upBytes;
            upBytes = 0;
            netTimer = 0;
        }
        averageFPS.shift();
        minFPS.shift();
        performanceData.start();
        updatePlayers(deltaTime);
        updateParticles(deltaTime);
        updateTrails(deltaTime);
        updateCamera(deltaTime);
        performanceData.logAndNext();
        updateGui(deltaTime);
        updateAppend(deltaTime);
        performanceData.logAndNext();

        Player.players.forEach(player => {
            if (player.lensFlare)
                player.lensFlare.update(player.toGlobal(new Vector(-90, 0)).add({ x: -camera.x, y: -camera.y }).mult(camera.zoom));
        });

        Entity.list.forEach(entity => {
            entity.update(deltaTime);
        });

        DroppedItem.list.forEach(item => {
            item.update(deltaTime);
        });

        performanceData.logAndNext();

        //gasParticleContainers[5][5].visible = true;
        gasParticleChunksDisplay(deltaTime);
        performanceData.logAndNext();
        performanceData.stop();

        sunAngle += deltaTime * 0.1;
        sunDirection = [Math.cos(sunAngle), Math.sin(sunAngle)];
        //glitchEffect.scale.x = (Math.random()-0.5)*160;
    }
}

function updatePlayers(deltaTime) {
    Player.players.forEach(player => {
        player.ship.update(deltaTime);
        player.nameText.x = player.ship.position.x;
        player.nameText.y = player.ship.position.y - 180;

    });
}

let detachCamera = false;
let disconnectCamera = false;

let screentangle = new PIXI.Graphics();
gameContainer.addChild(screentangle);


function updateCamera(deltaTime) {
    if (!detachCamera && !disconnectCamera) {
        camera.x = localPlayer.ship.position.x + localPlayer.ship.velocity.x / 10;
        camera.y = localPlayer.ship.position.y + localPlayer.ship.velocity.y / 10;
    }

    screentangle.visible = false;
    if (detachCamera) {
        screentangle.visible = true;
        screentangle.clear();
        screentangle.lineStyle(10, 0xffaa00);
        screentangle.drawRect(localPlayer.ship.position.x - screen.center.x / camera.zoom,
            localPlayer.ship.position.y - screen.center.y / camera.zoom,
            screen.width / camera.zoom,
            screen.height / camera.zoom);
    }

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
    let shieldRatio = 75;
    let hullRatio = 75;
    let fuelRatio = localPlayer.ship.afterBurnerFuel / 6;
    let cargoRatio = localPlayer.ship.inventory.used / localPlayer.ship.inventory.capacity * 100;
    let cargoPreviewRatio = cargoRatio;
    if (draggingItem) {
        let slot = localPlayer.ship.inventory.slots[draggedItemOrigin.dataset.slotId];
        if (slot.filter == -1) {
            cargoPreviewRatio = (localPlayer.ship.inventory.used - draggedItemInfo.stack) / localPlayer.ship.inventory.capacity * 100;
        }
    }
    else if (hoveredSlot) {
        let slot = localPlayer.ship.inventory.slots[hoveredSlot.dataset.slotId]
        let stack = slot.item.stack;
        if (stack > 0 && slot.filter == -1) {
            cargoPreviewRatio = (localPlayer.ship.inventory.used - stack) / localPlayer.ship.inventory.capacity * 100;
        }
    }
    let speedG = localPlayer.ship.velocity.length();
    let maxSpeedG = (1 - localPlayer.ship.debuff / 110) * 2000;
    let speedRatio = speedG / 20;
    let maxSpeedRatio = maxSpeedG / 20;

    gauges.shield.style.width = shieldRatio + "%";
    gauges.hull.style.width = hullRatio + "%";
    gauges.fuel.style.width = fuelRatio + "%";
    gauges.cargo.style.width = cargoRatio + "%";
    gauges.speed.style.width = speedRatio + "%";
    gauges.maxSpeed.style.width = maxSpeedRatio + "%";
    gaugeInventory.style.width = cargoPreviewRatio + "%";
    gaugeInventoryPreview.style.width = cargoRatio + "%";

    gaugeNumbers.shield.textContent = shieldRatio.toFixed(0);
    gaugeNumbers.hull.textContent = hullRatio.toFixed(0);
    gaugeNumbers.fuel.textContent = fuelRatio.toFixed(0);
    gaugeNumbers.cargo.textContent = localPlayer.ship.inventory.used + " / " + localPlayer.ship.inventory.capacity;
    gaugeNumbers.speed.textContent = speedG.toFixed(0);
    gaugeNumberInventory.textContent = localPlayer.ship.inventory.used + " / " + localPlayer.ship.inventory.capacity + " cargo";


    updateTooltip(deltaTime);

    UpdateMinimap(deltaTime);

}

//#endregion

//#region NETWORK

networker.onmessage = function (e) {
    let messageData = e.data;
    switch (messageData.type) {
        case 1:
            console.log("onConnectionOpen");
            onConnectionOpen();
            break;
        case 2:
            onConnectionMessage(messageData.data);
            break;
        case 3:
            console.log("onConnectionClose");
            onConnectionClose(messageData.data);
            break;
        default:
            break;
    }
}

function connect() {
    loadingStatus.textContent = "CONNECTING";
    loadingDetails.textContent = "Attempt " + connectionAttempts + "/" + maxReconnectAttempts;
    document.getElementById("loadingBar").style.width = 100 * connectionAttempts / maxReconnectAttempts + "%";
    if (window.location.hostname == "10.200.140.14") {
        networker.postMessage({ type: 1, address: "ws://10.200.140.14:20003/" });
        console.log("Connecting to local...");
    } else {
        networker.postMessage({ type: 1, address: "wss://jumpout.ws.coal.games/" });
        console.log("Connecting to server... Attempt " + connectionAttempts);
    }
}

function reconnect() {
    if (!connected) {
        if (!loadingScreenOpen) openLoadingScreen();
        connectionAttempts++;
        if (connectionAttempts <= maxReconnectAttempts) {
            connect();
        }
        else {
            console.log("Stopped reconnecting after " + (connectionAttempts - 1) + " attempts");
            loadingStatus.textContent = "CONNECTION FAILED";
            loadingDetails.textContent = "Stopped reconnecting after " + (connectionAttempts - 1) + " attempts";
        }
    }
}

function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
    connected = false;
    running = false;

    setTimeout(reconnect, reconnectInterval)
}
function onConnectionOpen() {
    console.log("Connection opened");
    connectionAttempts = 0;
    connected = true;
    sendInit();

}

let lastn = 0;
let ping = 0;
let netTimer = 0;
let downBytes = 0;
let downBytesDisplay = 0;
let upBytesDisplay = 0;
function onConnectionMessage(ms) {
    downBytes += ms.byteLength;
    //console.log(typeof(ms)); //myslím, že je chyba na serveru
    parseMessage(ms);
    //console.log(window.performance.now() - lastn);
    lastn = window.performance.now();
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
                case serverHeaders.gasScan:
                    parseGasScan(view);
                    break;
                case serverHeaders.objectScan:
                    parseObjectScan(view);
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
        lastrot = player.ship.rotation;
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
    localPlayer = new Player(id, view.getUint8());
    console.log("Setting up local player with ID " + id);
    initLocalPlayer();
    let existingPlayers = view.getUint8();
    for (let i = 0; i < existingPlayers; i++) {
        let p = {};
        view.deserealize(p, Datagrams.initPlayer);
        console.log("Adding existing player with ID " + p.id);

        let pl = new Player(p.id, p.shipType);
        console.log(p.shipType);
        Datagrams.initPlayer.transferData(pl, p);
    }
    generateInventory();


    running = true;

}

function parseNewPlayers(view) {
    let newPlayers = view.getUint8();
    for (let i = 0; i < newPlayers; i++) {
        let p = {};
        view.deserealize(p, Datagrams.initPlayer);
        if (p.id != localPlayer.id) {
            console.log("Adding new player with ID " + p.id);
            let pl = new Player(p.id, p.shipType);
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
    ping = window.performance.now() - pingTime[view.getUint8()];
    let size = view.getUint16();
    for (let i = 0; i < size; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.EntitySetup);
        let entity = Entity.list.get(temp.id);
        if (entity != undefined) {
            Datagrams.EntitySetup.transferData(entity, temp);
            entity.update(0);
        } else {
            console.warn(temp.id);
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
    let newItem = new DroppedItem(temp.item, temp.id, temp.stack, temp.position, temp.source);
    //id, position, item, stack
}

function parseItemRemove(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.ItemRemove);
    DroppedItem.list.get(temp.id).remove();
    //id
}

function parseInventoryChange(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.InventoryChange);
    console.log(temp)
    if (temp.stack < 0)
        Player.players.get(temp.shipId).ship.inventory.slots[temp.slot].removeItem(new Item(temp.item, -temp.stack));
    else
        Player.players.get(temp.shipId).ship.inventory.slots[temp.slot].addItem(new Item(temp.item, temp.stack));
    //inventoryUpdate();
    if (temp.shipId == localPlayer.id) {
        refreshSlotElement(localPlayer.ship.inventory.slots[temp.slot])
    }
    //shipId, slot, item, stack
}

let textToDisplay = "";
function parseDebug(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.DebugPacket);
    textToDisplay = temp.data;
}


let scannedGas = [];
function parseGasScan(view) {
    let count = view.getUint16();
    for (let i = 0; i < count; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.GasScan);
        scannedGas[temp.x * 1000 / minimapScale + temp.y] = temp.gas;
    }

}


let scannedObjects = new Map();
function parseObjectScan(view) {
    let count = view.getUint16();
    for (let i = 0; i < count; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.ObjectScan);
        if (temp.type == 0) {
            let obj = scannedObjects.get(temp.id);
            obj.bigSprite.destroy();
            obj.miniSprite.destroy();
            scannedObjects.delete(temp.id);
        } else {
            let obj = { position: temp.position, type: temp.type };
            if (!scannedObjects.has(temp.id)) {
                obj.miniSprite = new PIXI.Sprite.from("images/minimap/circle.png");
                obj.bigSprite = new PIXI.Sprite.from("images/minimap/circle.png");
                if (obj.type == 1) {
                    obj.bigSprite.tint = 0x00ffaa;
                    obj.miniSprite.tint = 0x00ffaa;
                } else {
                    obj.bigSprite.tint = 0xffaa00;
                    obj.miniSprite.tint = 0xffaa00;
                }
                pixi_minimap.stage.addChild(obj.miniSprite);
                bigMapApp.stage.addChild(obj.bigSprite);
                obj.miniSprite.anchor.set(0.5);
                obj.bigSprite.anchor.set(0.5);
            }
            scannedObjects.set(temp.id, obj);
        }
    }
}

let upBytes = 0;
let packetNumber = 0;
let pingTime = [];
const buffer = new ArrayBuffer(1000);
function sendControls() {
    handleInput();
    const view = new AutoView(buffer);
    view.setUint8(1);

    packetNumber++;
    packetNumber = packetNumber % 255;
    pingTime[packetNumber] = window.performance.now();
    let toSend = { control: controlVector, afterBurnerActive: controlVector.afterBurner, action: 0, packet: packetNumber };
    view.serialize(toSend, Datagrams.input);

    for (let i = 0; i < actionIDs.length; i++) {
        localPlayer.ship.stats.actionPool[actionIDs[i]](view);
    }
    actionIDs = [];
    if (serverCommand.length > 0) {
        view.setUint8(clientHeaders.serverConsole);
        view.serialize({ command: serverCommand }, Datagrams.ServerConsole);
        serverCommand = "";
    }

    upBytes += view.index;


    if (connected)
        networker.postMessage({ type: 2, data: buffer.slice(0, view.index) });

}

function sendInit() {
    const view = new AutoView(buffer);
    view.setUint8(0);

    view.serialize(playerSettings, Datagrams.playerSettings);

    networker.postMessage({ type: 2, data: buffer.slice(0, view.index) });
}

let serverCommand = ""
function serverExecute(command) {
    serverCommand = command;
}

//#endregion

//#region INPUT
let controlVector = { x: 0, y: 0, afterBurner: 0 };
let actionIDs = [];
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
        actionIDs.push(0);
        keyDown.f = false;
    } else if (keyDown.e) {
        actionIDs.push(1);
        keyDown.e = false;
    } else if (keyDown.c) {
        keyDown.c = false;
        if (detachCamera) {
            detachCamera = false;
            disconnectCamera = true;
            return;
        } else {
            if (disconnectCamera) {
                disconnectCamera = false;
            } else {
                detachCamera = true;
            }
        }
    } else if (keyDown.k) {
        window.open("debug/index.html?data=" + performanceData.string());
        performanceData.data = [];
        keyDown.k = false;
    } else if (keyDown.l) {
        performanceData.streaming = !performanceData.streaming;
        keyDown.l = false;
    } else if (keyDown.pageup) {
        if (uiScale + 0.1 <= 2) {
            uiScale += 0.1;
            document.documentElement.style.setProperty('--ui-scale', uiScale);
        }
        keyDown.pageup = false;
    } else if (keyDown.pagedown) {
        if (uiScale - 0.1 >= 0.5) {
            uiScale -= 0.1;
            document.documentElement.style.setProperty('--ui-scale', uiScale);
        }
        keyDown.pagedown = false;
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
    if (bigMapShown) {
        if (e.deltaY > 0) {
            if (big_mapControl.zoom * big_mapControl.zoomStep <= big_mapControl.maxZoom) {
                big_mapControl.zoom *= big_mapControl.zoomStep;
            } else {
                big_mapControl.zoom = big_mapControl.maxZoom;
            }
        }
        if (e.deltaY < 0) {
            if (big_mapControl.zoom / big_mapControl.zoomStep >= big_mapControl.minZoom) {
                big_mapControl.zoom /= big_mapControl.zoomStep;
            } else {
                big_mapControl.zoom = big_mapControl.minZoom;
            }
        }
    } else {
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
    }
});

let mapDragging = false;
bigmap_canvas.addEventListener('mousedown', e => {
    mapDragging = true;
});

bigmap_canvas.addEventListener('mousemove', e => {
    if (mapDragging === true) {
        big_mapControl.x -= e.movementX / big_mapDrag * big_mapControl.zoom;
        big_mapControl.y -= e.movementY / big_mapDrag * big_mapControl.zoom;
    }
});

window.addEventListener('mouseup', e => {
    if (mapDragging === true) {
        mapDragging = false;
    }
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

/**
 * @type {GasSprite[]}
 */
let gasParticles = [];
/**
 * @type {GasSprite[]}
 */
let gasDisplay = [];
let avalible = [];

let gasCollector = false;
let gasSprite = new PIXI.Sprite();
app.stage.addChild(gasSprite);
gasSprite.visible = false
function gasParticleChunksDisplay(dt) {
    if (gasLoaded) {

        gasCamWidth = 2 * Math.floor(screen.width / gasParticleSpacing / 2 / camera.zoom + 3);
        gasCamHeight = 2 * Math.floor(screen.height / gasParticleSpacing / 2 / camera.zoom + 3);
        let buffer = new Float32Array((gasCamWidth + 1) * (gasCamHeight + 1) * 4);
        let gasPosX;
        let gasPosY;
        if (detachCamera) {
            gasPosX = localPlayer.ship.position.x / gasParticleSpacing;
            gasPosY = localPlayer.ship.position.y / gasParticleSpacing;
        } else {
            gasPosX = camera.x / gasParticleSpacing;
            gasPosY = camera.y / gasParticleSpacing;
        }

        let gasOffsetX = Math.floor(gasPosX) - gasPosX;
        let gasOffsetY = Math.floor(gasPosY) - gasPosY;

        gasPosX = Math.max(Math.min(Math.floor(gasPosX), 1000 - 1), 0);
        gasPosY = Math.max(Math.min(Math.floor(gasPosY), 1000 - 1), 0);
        gasHere = Universe.gasMap[gasPosX][gasPosY];

        if (gasCollector) {
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
                }
            }
            gasCollector = false;
        }


        let index = 0;
        for (let py = Math.max(gasPosY - Math.floor(gasCamHeight / 2) - 2, 0); py < gasPosY + Math.floor(gasCamHeight / 2) + 2; py++) {
            for (let px = Math.max(gasPosX - Math.floor(gasCamWidth / 2) - 2, 0); px < gasPosX + Math.floor(gasCamWidth / 2) + 2; px++) {
                if (px >= 1000 || py >= 1000) {
                    continue;
                }
                if (
                    px < gasPosX - gasCamWidth / 2 ||
                    py < gasPosY - gasCamHeight / 2 ||
                    px > gasPosX + gasCamWidth / 2 ||
                    py > gasPosY + gasCamHeight / 2
                ) {
                    let g = gasDisplay[px][py];
                    if (g) {
                        avalible.push(g);
                        g.visible = false;
                        gasDisplay[px][py] = false;
                    }
                } else {
                    let clr = Universe.gasMap[px][py] / 100;
                    buffer[index++] = clr;
                    buffer[index++] = clr;
                    buffer[index++] = clr;
                    buffer[index++] = 1;

                    let a = Universe.gasMap[px][py]/100;
                    let b = Universe.gasMap[px + 1][py]/100;
                    let c = Universe.gasMap[px + 1][py + 1]/100;
                    let d = Universe.gasMap[px][py + 1]/100;
                    if (!gasDisplay[px][py]) {
                        let g = avalible.shift();
                        if (visibleGasUpdate(px, py, g)) {
                            g.mesh.position.set(px * gasParticleSpacing + gasParticleSpacing * Math.random() * 0, py * gasParticleSpacing + gasParticleSpacing * Math.random() * 0);
                            g.update(a, b, c, d);
                        } else {
                            gasCollector = true;
                        }
                    } else {
                        let g = gasDisplay[px][py];


                        if (a != g.valueCache) {
                            g.valueCache = a;
                            g.mesh.tint = gasColorMap.evaluate(a / 100);
                            g.update(a, b, c, d);
                        }
                        //g.rotation += g.valueCache * 0.01 * dt;
                    }
                }
            }
        }
        /*
                gasSprite.x = (gasOffsetX - 3) * gasParticleSpacing * camera.zoom;
                gasSprite.y = (gasOffsetY - 3) * gasParticleSpacing * camera.zoom;
                gasSprite.scale.x = screen.width / (gasCamWidth - 5);
                gasSprite.scale.y = screen.height / (gasCamHeight - 5);
                gasSprite.texture = PIXI.Texture.fromBuffer(buffer, gasCamWidth + 1, gasCamHeight + 1);*/
    }
}

function visibleGasUpdate(x, y, g) {
    if (g != undefined) {
        let e = Universe.gasMap[x][y];
        g.mesh.alpha = e / 200 + 0.5;
        g.mesh.visible = true;
        gasDisplay[x][y] = g;
        if (e != g.valueCache) {
            g.valueCache = e;
            g.mesh.tint = gasColorMap.evaluate(e / 100);
        }
        return true;
    }
}

function generateGas() {
    console.log("generating");

    document.getElementById("loadingBar").style.transition = "width .2s";


    for (let i = 0; i < 2000; i++) {
        let gasParticle = new GasSprite(gasParticleSpacing);

        gasParticles[i] = gasParticle;
        gasParticle.mesh.visible = false;

        avalible.push(gasParticle);

        gasContainer.addChild(gasParticle.mesh);

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
}

