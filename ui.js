const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");
const minimap_zoomIn = document.getElementById("zoomIn");
const minimap_zoomOut = document.getElementById("zoomOut");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gaugesElement = document.getElementsByClassName("gauges")[0];

const tooltipBox = document.getElementById("tooltip");
const tooltipBoxName = document.getElementById("tooltipName");
const tooltipBoxDesc = document.getElementById("tooltipDesc");

const tooltipElements = document.getElementsByClassName("tooltip");

var mousePosition = { x: 0, y: 0 };
document.onmousemove = function (e) {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
};

let tooltipStack = [];
let hoverTime = 0;
let tooltipDelay = .3;



Array.from(tooltipElements).forEach(element => {
    element.addEventListener("mouseenter", e => {
        hoverTime = 0;
        tooltipChanged = true;
        tooltipStack.push(element);
    })
    element.addEventListener("mouseleave", e => {
        hoverTime = 0;
        tooltipChanged = true;
        tooltipStack.pop();
    })
});

function updateTooltip(deltaTime) {
    hoverTime += deltaTime;
    tooltipBox.style.top = Math.min(mousePosition.y, screen.height - tooltipBox.offsetHeight - 10) + "px";
    tooltipBox.style.left = mousePosition.x + "px";
    if(mousePosition.x + tooltipBox.offsetWidth + 10>= screen.width) tooltipBox.style.left = (mousePosition.x - tooltipBox.offsetWidth-20) + "px";
    if (tooltipStack.length > 0 && hoverTime >= tooltipDelay) {
        let element = tooltipStack[tooltipStack.length - 1];
        tooltipBox.style.opacity = "1";
        if (element.dataset.tooltipName)
            tooltipBoxName.innerHTML = element.dataset.tooltipName;
        else
            tooltipBoxName.innerHTML = "Missing tooltip";

        if (element.dataset.tooltipDesc) {
            tooltipBoxDesc.style.display = "block";
            tooltipBoxDesc.innerHTML = element.dataset.tooltipDesc;
        }
        else {
            tooltipBoxDesc.style.display = "none";
            tooltipBoxDesc.innerHTML = "Missing description";
        }
        if (tooltipBox.offsetHeight + mousePosition.y > screen.height) {
            //tooltipBox.style.bottom = 0;
            //tooltipBox.style.top = (mousePosition.y-tooltipBox.offsetHeight) + "px";
        }
    }
    else {
        tooltipBox.style.opacity = "0";
    }

}

let minimapShown = true;
min_minimap.addEventListener("click", () => {
    minimap.classList.toggle("minimized");
    minimapShown = !minimapShown;
});

minimap_zoomIn.addEventListener("click", () => {
    if (minimapControl.zoom - zoomStep >= minimapControl.minZoom) {
        minimapControl.zoom -= zoomStep;
    }
});

minimap_zoomOut.addEventListener("click", () => {
    if (minimapControl.zoom + zoomStep <= minimapControl.maxZoom) {
        minimapControl.zoom += zoomStep;
    }
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

let minimapControl = { zoom: 3, density: 25, minZoom: 1, maxZoom: 10, zoomStep: 2 };

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
    if (!minimapShown) return;
    for (let x = 0; x < minimapControl.density; x++) {
        for (let y = 0; y < minimapControl.density; y++) {
            let gasPX = gasPXs[x * minimapControl.density + y];
            let lx = Math.floor((localPlayer.ship.position.x / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + x * minimapControl.zoom);
            let ly = Math.floor((localPlayer.ship.position.y / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + y * minimapControl.zoom);
            if (scannedGas[lx * 1000 / minimapScale + ly] == undefined) {
                gasPX.scale.set(Math.max(1 - Math.abs(gasPX.oscilation), 0) / 2 + 0.3);
                gasPX.oscilation += deltaTime;
                if (gasPX.oscilation > 2) {
                    gasPX.oscilation -= 3;
                }
                gasPX.tint = 0x555555;
            } else {
                gasPX.tint = 0xffffff;
                gasPX.scale.set(scannedGas[lx * 1000 / minimapScale + ly] / 100);
            }
        }
    }
}
