const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gaugesElement = document.getElementsByClassName("gauges")[0];

const tooltipBox = document.getElementById("tooltip");

const tooltipElements = document.getElementsByClassName("tooltip");

var mousePosition = { x: 0, y: 0 };
document.onmousemove = function (e) {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    tooltipBox.style.top = mousePosition.y + "px";
    tooltipBox.style.left = mousePosition.x + "px";
};



Array.from(tooltipElements).forEach(element => {
    element.addEventListener("mouseenter", e => {
        tooltipBox.style.opacity = "1";
        if (element.dataset.tooltipName)
            tooltipBox.firstChild.innerHTML = element.dataset.tooltipName;
        else
            tooltipBox.firstChild.innerHTML = "Missing tooltip";

        if (element.dataset.tooltipDesc) {
            tooltipBox.lastChild.style.display = "block";
            tooltipBox.lastChild.innerHTML = element.dataset.tooltipDesc;
        }
        else {
            tooltipBox.lastChild.style.display = "none";
            tooltipBox.lastChild.innerHTML = "Missing description";
        }
    })
    element.addEventListener("mouseleave", e => {
        tooltipBox.style.opacity = "0";

    })
});

min_minimap.addEventListener("click", () => {
    minimap.classList.toggle("minimized");
});

min_powercells.addEventListener("click", () => {
    powercells.classList.toggle("minimized");
    gaugesElement.classList.toggle("minimized");
});

let pixi_minimap = new PIXI.Application({
    view: minimap_canvas,
    width: 350, height: 350,
});
let gasPx_container = new PIXI.ParticleContainer();
pixi_minimap.stage.addChild(gasPx_container);
let gasPXs = [];
for (let x = 0; x < 25; x++) {
    for (let y = 0; y < 25; y++) {
        let gasPX = new PIXI.Sprite.from("images/minimap/circle.png");
        gasPX.position.x = x * 14;
        gasPX.position.y = y * 14;
        gasPXs[x * 25 + y] = gasPX;

        gasPx_container.addChild(gasPX);
    }
}

function UpdateMinimap() {
    for (let x = 0; x < 25; x++) {
        for (let y = 0; y < 25; y++) {
            let lx = Math.floor(localPlayer.ship.position.x / gasParticleSpacing) - 12 + x;
            let ly = Math.floor(localPlayer.ship.position.y / gasParticleSpacing) - 12 + y;
            if (scannedGas[x*1000 +y] == undefined) {
                gasPX.scale.set(0.01);
            }else{
                gasPX.scale.set(scannedGas[x*1000 +y]/100);
            }
        }
    }
}
