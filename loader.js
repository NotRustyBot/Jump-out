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
    .add("marker_arrow", "images/ui/minimap/marker_arrow.png")
    .add("marker_circle", "images/ui/minimap/marker_circle.png")
    .add("marker_circleFull", "images/ui/minimap/marker_circleFull.png")
    .add("marker_cross", "images/ui/minimap/marker_cross.png")
    .add("marker_ping", "images/ui/minimap/marker_ping.png")
    .add("marker_ship", "images/ui/minimap/marker_ship.png")
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
//#endregion