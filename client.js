
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

var camera = { x: 0, y: 0, zoom: 0.5 };
var zoomStep = 1.2;
var minZoom = 0.3;
var maxZoom = 6;
var gameContainer = new PIXI.Container();
var playerSettings = { nick: "Nixk" };

window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    screen.center = new Vector(window.innerWidth / 2, window.innerHeight / 2)
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
    .add("lensflare0", "images/lensflare0.png")
    .add("lensflare1", "images/lensflare1.png")
    .add("lensflare2", "images/lensflare2.png")
    .add("beam", "images/beam.png")
    .add("circle_r300", "images/circle-r300.png")
    .add("square600", "images/square600.png")
    .add("shape", "images/shape.png")
    .add("entity_1", "images/entity/1.png")
    .add("entity_2", "images/entity/2.png")
    ;
loader.onProgress.add(loadingProgress);
loader.load(start);

var playerSprite, playerLight;
var loaded = false;
var connected = false;
var running = false;
var gasLoaded = false;
var gasChunkCountX = 50;
var gasParticleContainers = [gasChunkCountX];
var gasParticleSpacing = 1000;
var gasParticleDisplayAmount = 1; //DOES NOT WORK
var gasChunkWidth = 1000 * gasParticleSpacing / gasChunkCountX;
var gasCount = 0;

var loadingStatus = document.getElementById("loadingStatus");
loadingStatus.textContent = "LOADING";


function start() {
    //playerSprite = new PIXI.Sprite(loader.resources.player0.texture);
    playerLight = new PIXI.Sprite(loader.resources.light.texture);
    loadingStatus.textContent = "CONNECTING";

    //playerSprite.scale.set(0.5);
    //playerSprite.anchor.set(0.5);

    /*playerSprite.addChild(playerLight);
    playerLight.anchor.set(0.25,0.5);
    playerLight.scale.set(10);
    gameContainer.mask = playerLight;*/





    gameContainer.pivot.set(0.5);
    //gameContainer.addChild(playerSprite);
    app.stage.addChild(gameContainer);


    //gasParticleContainers[0,0].visible = true;

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
        connection = new WebSocket("ws://10.200.140.14:20003/");
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

var localPlayer;
//localPlayer.init();


const fps = 60;

setInterval(update, 1000 / fps);

function update() {
    if (running) {
        sendControls();
    }
}

var screen = {
    center: new Vector(window.innerWidth / 2, window.innerHeight / 2)
};


var fpsText = new PIXI.Text();
fpsText.style.fill = 0xFFFFFF;
fpsText.style.fontFamily = "Overpass Mono";
app.stage.addChild(fpsText);

function graphicsUpdate(deltaTimeFactor) {
    if (running) {
        let deltaTime = app.ticker.deltaMS / 1000;
        let fuel = localPlayer.ship.afterBurnerFuel || 0;
        fpsText.text = "    FPS: " + app.ticker.FPS.toFixed(2) + "\nMin FPS: " + app.ticker.minFPS + "\nMax FPS: " + app.ticker.maxFPS + "\n Factor: " + deltaTimeFactor.toFixed(2) + "\n   Fuel: " + fuel.toFixed(2) + "\n" + textToDisplay + "\n    Gas: " + gasCount;
        Player.players.forEach(player => {
            player.ship.position.x += player.ship.velocity.x * deltaTime;
            player.ship.position.y += player.ship.velocity.y * deltaTime;
            player.sprite.x = player.ship.position.x;
            player.sprite.y = player.ship.position.y;
            player.sprite.rotation = player.ship.rotation;
            //console.log(localPlayer.ship.velocity);
            player.nameText.x = player.ship.position.x;
            player.nameText.y = player.ship.position.y - 80;

        });
        updateParticles(deltaTime);
        camera.x = localPlayer.ship.position.x;
        camera.y = localPlayer.ship.position.y;
        gameContainer.scale.set(camera.zoom);
        gameContainer.x = -camera.x * camera.zoom + window.innerWidth / 2;
        gameContainer.y = -camera.y * camera.zoom + window.innerHeight / 2;
        Player.players.forEach(player => {

            player.lensFlare.update(player.toGlobal(new Vector(-30, 0)).add({ x: -camera.x, y: -camera.y }).mult(camera.zoom));
        });
        Entity.list.forEach(entity => {
            entity.update(deltaTime);
        });

        //gasParticleContainers[5][5].visible = true;
        gasParticleChunksDisplay();

    }
}


function updateParticles(deltaTime) {
    if (running) {
        Player.players.forEach(player => {
            let particleSystem = player.particleSystems[0];
            let particleSystem2 = player.particleSystems[1];
            let particleSystem3 = player.particleSystems[2];
            if (player.ship.control.y == 1) {
                particleSystem.settings.enabled = true;
                particleSystem3.settings.enabled = true;
                player.lensFlare.enabled = true;

            }
            else {
                particleSystem.settings.enabled = false;
                particleSystem3.settings.enabled = false;
                player.lensFlare.enabled = false;

            }
            if (player.ship.afterBurnerUsed == 1 && player.ship.control.y == 1) {
                particleSystem2.settings.enabled = true;
                particleSystem.settings.emitRate = 1800 * player.ship.afterBurnerFuel / player.ship.stats.afterBurnerCapacity;
                particleSystem.settings.color.min = 0xFFEFAA;
                particleSystem.settings.color.max = 0xff6600;
                particleSystem.settings.randomVelocity = 30;

                particleSystem3.settings.color.min = 0xAA8855;
                particleSystem3.settings.color.max = 0xAA2277;
                player.lensFlare.tint = 0xAA6622;
                //particleSystem.settings.emitRate = 300;
            }
            else {
                player.lensFlare.tint = 0x1199FF;
                particleSystem2.settings.enabled = false;
                particleSystem.settings.color.min = 0xFFFFFF;
                particleSystem.settings.color.max = 0x1199FF;
                particleSystem.settings.emitRate = 900;
                particleSystem.settings.randomVelocity = 5;

                particleSystem3.settings.color.min = 0xBEDEFE;
                particleSystem3.settings.color.max = 0x0077FF;
                //particleSystem.settings.emitRate = 150;
            }
            let global = player.toGlobal(new Vector(-30, 0));
            particleSystem3.updateEmitter((player.ship));
            //particleSystem3.emitter.position = global;
            particleSystem3.update(deltaTime);
            particleSystem.updateEmitter(player.ship);
            //particleSystem.emitter.position = global;
            particleSystem.update(deltaTime);


            particleSystem2.updateEmitter((player.ship));
            particleSystem2.update(deltaTime);

        });



    }
}

function onConnectionClose(e) {
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
}
function onConnectionOpen() {
    console.log("Connection opened");
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
                    parseGameSetup(view);
                    break;
                case serverHeaders.collisionEvent:
                    parseCollision(view);
                    break;
                case serverHeaders.debugPacket:
                    parseDebug(view);
                    break;
                case serverHeaders.proximity:
                    parseGameSetup(view);
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
    for (let y = 0; y < h; y++) {
        Universe.gasMap[y] = [];
        for (let x = 0; x < w; x++) {
            const e = view.getUint8();
            bytes++;
            Universe.gasMap[y][x] = e;
        }
    }

    loadingStatus.textContent = "GENERATING MAP";
    
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

function parseGameSetup(view) {
    let size = view.getUint16();
    for (let i = 0; i < size; i++) {
        let temp = {};
        view.deserealize(temp, Datagrams.EntitySetup);
        let entity = Entity.list[temp.id] || new Entity(temp.type);
        Datagrams.EntitySetup.transferData(entity, temp);
        entity.update(0);
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
    //particles go here
}

let textToDisplay = "";
function parseDebug(view) {
    let temp = {};
    view.deserealize(temp, Datagrams.DebugPacket);
    textToDisplay = temp.data;
}

function generateGas() {

    console.log("generating");

    document.getElementById("loadingBar").style.transition = "width .2s";

    for (let px = 0; px < gasChunkCountX; px++) {
        gasParticleContainers[px] = [10];
        for (let py = 0; py < gasChunkCountX; py++) {
            gasParticleContainers[px][py] = new PIXI.ParticleContainer(10000, {
                scale: true,
                position: true,
                rotation: true,
                tint: false,
            });
            gasParticleContainers[px][py].visible = false;
            gameContainer.addChild(gasParticleContainers[px][py]);

        }

    }

    setTimeout(function () { gasGenProgress(0) }, 0);


}

function initLocalPlayer() {
    localPlayer.nick = playerSettings.nick;
}
function gasGenProgress(y) {
    document.getElementById("loadingBar").style.width = (y / 10)+10 + "%";
    //console.log("prog" + y);
    let ys = y + 100;
    for (; y < ys; y++) {
        for (let x = 0; x < 1000; x++) {
            const e = Universe.gasMap[y][x];
            //if (gasCount % 10 == 0) {
            let gasParticle = new PIXI.Sprite(loader.resources.kour.texture);
            gasParticle.position.set(x * gasParticleSpacing, y * gasParticleSpacing);
            gasParticle.anchor.set(0.5);
            gasParticle.scale.set(6);
            gasParticle.rotation = Math.random() * 6.28;
            gasParticle.alpha = e / 400;
            if (gasCount % Math.floor(1 / gasParticleDisplayAmount) == 0) gasParticle.visible = true;
            else gasParticle.visible = false;
            //console.log("s");
            gasParticleContainers[Math.floor(x / 1000 * gasChunkCountX)][Math.floor(y / 1000 * gasChunkCountX)].addChild(gasParticle);
            //}
            gasCount++;
        }

    }
    if (y < 1000) {
        
        setTimeout(function () { gasGenProgress(y) }, 0);
    }
    else {
        closeLoadingScreen();
        gasLoaded = true;
    }

}





//#region INPUT
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
});

//#endregion


function sendControls() {
    const buffer = new ArrayBuffer(1 + Datagrams.input.size);
    const view = new AutoView(buffer);
    view.setUint8(1);

    let toSend = { control: controlVector, afterBurnerActive: controlVector.afterBurner };

    view.serialize(toSend, Datagrams.input);


    connection.send(buffer);
    //console.log(buffer);
}

function sendInit() {
    const buffer = new ArrayBuffer(1 + Datagrams.playerSettings.sizeOf(playerSettings));
    const view = new AutoView(buffer);
    view.setUint8(0);


    view.serialize(playerSettings, Datagrams.playerSettings);


    connection.send(buffer);
}

function gasParticleChunksDisplay() {
    if (gasLoaded) {
        gasParticleContainers[Math.floor(localPlayer.ship.position.x / gasChunkWidth)][Math.floor(localPlayer.ship.position.y / gasChunkWidth)].visible = true;
        let playerChunkX = Math.floor(localPlayer.ship.position.x / gasChunkWidth);
        let playerChunkY = Math.floor(localPlayer.ship.position.y / gasChunkWidth);
        for (let px = 0; px < gasChunkCountX; px++) {
            for (let py = 0; py < gasChunkCountX; py++) {
                if (Math.abs(px - playerChunkX) <= 1 && Math.abs(py - playerChunkY) <= 1) {
                    gasParticleContainers[px][py].visible = true;
                }
                else gasParticleContainers[px][py].visible = false;

            }

        }
    }

}
function closeLoadingScreen() {
    document.getElementById("loadingBarContainer").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("loadingBarContainer").style.display = "none";
    }, 1000);
}