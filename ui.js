const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gaugesElement = document.getElementsByClassName("gauges")[0];

min_minimap.addEventListener("click", () => {
    minimap.classList.toggle("minimized");
});

min_powercells.addEventListener("click", () => {
    powercells.classList.toggle("minimized");
});

let pixi_minimap = new PIXI.Application({
    view: minimap_canvas,
    width: 350, height: 350
});
let gasPx_container = new PIXI.ParticleContainer();
pixi_minimap.stage.addChild(gasPx_container);
let gasPXs = [];
for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
        let gasPX = new PIXI.Sprite.from("images/circle.png");
        gasPX.x = x * 7;
        gasPX.y = y * 7;
        gasPXs[x*50 + y] = gasPX;
        gasPX.scale = 0.1;
        gasPx_container.addChild(gasPX);
    }
}

function UpdateMinimap() {
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {

        }
    }
}
gauges.classList.toggle("minimized");
gaugesElement.classList.toggle("minimized");
