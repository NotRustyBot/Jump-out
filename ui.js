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
let gasPx_container = new PIXI.ParticleContainer(1000, {
    scale: true,
    position: true,
    rotation: true,
    tint: true,
});
pixi_minimap.stage.addChild(gasPx_container);
pixi_minimap.stage.addChild(PIXI.Sprite.from("images/minimapMask.png"));
pixi_minimap.renderer.backgroundColor = 0x181818;

let gasPXs = [];

let minimapControl = { zoom: 3, density: 25 };

for (let x = 0; x < minimapControl.density; x++) {
    for (let y = 0; y < minimapControl.density; y++) {
        let gasPX = new PIXI.Sprite.from("images/minimap/circle.png");
        gasPX.position.x = x * (350 / minimapControl.density);
        gasPX.position.y = y * (350 / minimapControl.density);
        gasPXs[x * minimapControl.density + y] = gasPX;
        gasPX.anchor.set(0.5);
        gasPX.oscilation = Math.random();

        gasPx_container.addChild(gasPX);
    }
}


const minimapScale = 2;
function UpdateMinimap(deltaTime) {
    for (let x = 0; x < minimapControl.density; x++) {
        for (let y = 0; y < minimapControl.density; y++) {
            let gasPX = gasPXs[x * minimapControl.density + y];
            let lx = Math.floor((localPlayer.ship.position.x / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + x* minimapControl.zoom);
            let ly = Math.floor((localPlayer.ship.position.y / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + y* minimapControl.zoom);
            if (scannedGas[lx * 1000/minimapScale + ly] == undefined) {
                gasPX.scale.set(Math.max(1 - Math.abs(gasPX.oscilation),0)/2 +0.3);
                gasPX.oscilation+=deltaTime;
                if (gasPX.oscilation > 2) {
                    gasPX.oscilation -= 3;
                }
                gasPX.tint = 0x555555;
            } else {
                gasPX.tint = 0xffffff;
                gasPX.scale.set(scannedGas[lx * 1000/minimapScale + ly] / 100);
            }
        }
    }
    pixi_minimap.renderer.render(pixi_minimap.stage);
}
