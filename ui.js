const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gauges = document.getElementsByClassName("gauges")[0];

min_minimap.addEventListener("click", () =>{
    minimap.classList.toggle("minimized");
});

min_powercells.addEventListener("click", () =>{
    powercells.classList.toggle("minimized");
});

let pixi_minimap = new PIXI.Application({
    view: minimap_canvas,
});
let gasPx_container = new PIXI.ParticleContainer();
pixi_minimap.stage.addChild(gasPx_container);

for (let i = 0; i < 50*50; i++) {
    let gasPX = new PIXI.Sprite.from("images/circle.png");
    gasPx_container.addChild(gasPX);
}

function UpdateMinimap() {
    //pixi_minimap
}
    gauges.classList.toggle("minimized");
