const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");
const minimap_zoomIn = document.getElementById("zoomIn");
const minimap_zoomOut = document.getElementById("zoomOut");

const bigmap_canvas = document.getElementById("bigMap");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gaugesElement = document.getElementsByClassName("gauges")[0];

const tooltipBox = document.getElementById("tooltip");
const tooltipBoxName = document.getElementById("tooltipName");
const tooltipBoxDesc = document.getElementById("tooltipDesc");

const tooltipElements = document.getElementsByClassName("tooltip");

const closeButtons = document.getElementsByClassName("closeButton");
const dragBars = document.getElementsByClassName("dragBar");
const resizeButtons = document.getElementsByClassName("resizeButton");

const toggleInventory = document.getElementById("sidebarInventory");

const inventoryElement = document.getElementsByClassName("inventory")[0];

var mousePosition = { x: 0, y: 0 };
document.onmousemove = function (e) {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    if(dragging){
        dragMoved.x+=e.movementX;
        dragMoved.y+=e.movementY;
        draggedElement.style.left = (dragStart.x + dragMoved.x)+ "px";
        draggedElement.style.top = (dragStart.y + dragMoved.y)+ "px";
    }
    if(resizing){
        dragMoved.x+=e.movementX;
        dragMoved.y+=e.movementY;
        draggedElement.style.width = (dragStart.x + dragMoved.x)+ "px";
        draggedElement.style.height = (dragStart.y + dragMoved.y)+ "px";
    }
};

let tooltipStack = [];
let hoverTime = 0;
let tooltipDelay = .3;

let dragging = false;
let resizing = false;
let dragMoved = {x:0,y:0};
let dragStart = {x:0,y:0};
let draggedElement = null;


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

Array.from(closeButtons).forEach(element => {
    element.addEventListener("click", () => {
        element.parentElement.parentElement.classList.toggle("closed");
    })
});

Array.from(dragBars).forEach(element => {
    element.addEventListener("mousedown", () => {
        draggedElement = element.parentElement;
        dragging = true;
        dragMoved = {x:element.parentElement.offsetLeft,y:element.parentElement.offsetTop};
    })
    element.addEventListener("mouseup", () => {
        draggedElement = null;
        dragging = false;
        dragMoved = {x:0,y:0};
    })
});

Array.from(resizeButtons).forEach(element => {
    element.addEventListener("mousedown", () => {
        draggedElement = element.parentElement;
        resizing = true;
        dragMoved = {x:element.parentElement.offsetWidth,y:element.parentElement.offsetHeight};
    })
    element.addEventListener("mouseup", () => {
        draggedElement = null;
        resizing = false;
        dragMoved = {x:0,y:0};
    })
});

document.addEventListener("mouseup", () => {
    draggedElement = null;
    resizing = false;
    dragging = false;
    dragMoved = {x:0,y:0};
})

toggleInventory.addEventListener("click", () => {
    inventoryElement.classList.toggle("closed");
})

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
    UpdateBigmap(deltaTime);
    if (!minimapShown) return;
    for (let x = 0; x < minimapControl.density; x++) {
        for (let y = 0; y < minimapControl.density; y++) {
            let gasPX = gasPXs[x * minimapControl.density + y];
            let lx = (localPlayer.ship.position.x / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + x * minimapControl.zoom;
            let ly = (localPlayer.ship.position.y / gasParticleSpacing / minimapScale) - minimapControl.density / 2 * minimapControl.zoom + y * minimapControl.zoom;

            let gtl = scannedGas[Math.floor(lx) * 1000 / minimapScale + Math.floor(ly)] || 0;
            let gtr = scannedGas[Math.ceil(lx) * 1000 / minimapScale + Math.floor(ly)] || 0;
            let gbl = scannedGas[Math.floor(lx) * 1000 / minimapScale + Math.ceil(ly)] || 0;
            let gbr = scannedGas[Math.ceil(lx) * 1000 / minimapScale + Math.ceil(ly)] || 0;

            let ptl = (2 - ((lx % 1) + (ly % 1)))/2;
            let ptr = (2 - (1 - (lx % 1) + (ly % 1)))/2;
            let pbl = (2 - ((lx % 1) + 1 - (ly % 1)))/2;
            let pbr = (2 - (1 - (lx % 1) + 1 - (ly % 1)))/2;



            gasPX.oscilation += deltaTime;
            if (scannedGas[Math.floor(lx) * 1000 / minimapScale + Math.floor(ly)] == undefined) {
                gasPX.scale.set(Math.max(1 - Math.abs(gasPX.oscilation), 0) / 2 + 0.3);
                if (gasPX.oscilation > 2) {
                    gasPX.oscilation -= 3;
                }
                gasPX.tint = 0x555555;
            } else {
                gasPX.tint = 0xffffff;
                gasPX.scale.set((gtl*ptl + gtr*ptr + gbl*pbl + gbr*pbr) / 200);
            }
        }
    }
}



let bigMapShown = true;

let bigMapApp = new PIXI.Application({
    view: bigmap_canvas,
    width: 800, height: 800,
});

let big_gasPx_container = new PIXI.ParticleContainer(7000, {
    scale: true,
    position: true,
    rotation: true,
    tint: true,
});
bigMapApp.stage.addChild(big_gasPx_container);
bigMapApp.renderer.backgroundColor = 0x181818;

let big_gasPXs = [];

let big_mapControl = { zoom: 3, density: 60, minZoom: 1, maxZoom: 80, zoomStep: 1.1, x: 500, y: 500 };
for (let x = 0; x < big_mapControl.density; x++) {
    for (let y = 0; y < big_mapControl.density; y++) {
        let gasPX = new PIXI.Sprite.from("images/minimap/circle.png");
        gasPX.position.x = x * (bigmap_canvas.width / big_mapControl.density);
        gasPX.position.y = y * (bigmap_canvas.height / big_mapControl.density);
        big_gasPXs[x * big_mapControl.density + y] = gasPX;
        gasPX.anchor.set(0.5);
        gasPX.oscilation = Math.random();

        big_gasPx_container.addChild(gasPX);
    }
}

let big_mapDrag = bigmap_canvas.width / big_mapControl.density / minimapScale;

function UpdateBigmap(deltaTime) {
    if (!bigMapShown) return;
    for (let x = 0; x < big_mapControl.density; x++) {
        for (let y = 0; y < big_mapControl.density; y++) {
            let gasPX = big_gasPXs[x * big_mapControl.density + y];
            let lx = Math.floor((big_mapControl.x / minimapScale) - big_mapControl.density / 2 * big_mapControl.zoom + x * big_mapControl.zoom);
            let ly = Math.floor((big_mapControl.y / minimapScale) - big_mapControl.density / 2 * big_mapControl.zoom + y * big_mapControl.zoom);


            gasPX.oscilation += deltaTime;
            if (scannedGas[lx * 1000 / minimapScale + ly] == undefined) {
                gasPX.scale.set(Math.max(1 - Math.abs(gasPX.oscilation), 0) / 2 + 0.3);
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