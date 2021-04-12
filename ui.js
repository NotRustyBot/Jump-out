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
const inventoryGrid = document.getElementById("inventoryGrid");
const inventorySlotElements = document.getElementsByClassName("inventoryCell");
const inventorySpecialSections = document.getElementsByClassName("inventorySpecialSlots");


const itemElements = document.getElementsByClassName("item");

let uiScale = 1;

var mousePosition = Vector.zero();
document.onmousemove = function (e) {
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    if (dragging) {
        dragMoved.x += e.movementX;
        dragMoved.y += e.movementY;
        draggedElement.style.left = (dragStart.x + dragMoved.x) + "px";
        draggedElement.style.top = (dragStart.y + dragMoved.y) + "px";
    }
    if (resizing) {
        dragMoved.x += e.movementX;
        dragMoved.y += e.movementY;
        draggedElement.style.width = (dragStart.x + dragMoved.x) + "px";
        draggedElement.style.height = (dragStart.y + dragMoved.y) + "px";
    }
};

let tooltipStack = [];
let hoverTime = 0;
let tooltipDelay = .3;

let dragging = false;
let draggingItem = false;
let resizing = false;
let dragMoved = { x: 0, y: 0 };
let dragStart = { x: 0, y: 0 };
let draggedElement = null;

/**@type {HTMLElement} */
let draggedItemOrigin = null;
/**@type {HTMLElement} */
let draggedItem = null;
/**@type {HTMLElement[]} */
let slotElements = [];
/**@type {Item}*/
let draggedItemInfo;
let mouseInInventory = false;
/**@type {{position:Vector,stack:number,slotId:number}}*/
var itemToDrop = {};
/**@type {{from:number,to:number}}*/
var slotsToSwap = {};

/**@type {HTMLElement} */
let hoveredSlot = null;

let tooltipSize = { x: 0, y: 0 }


/*function inventoryUpdate() {
    for (let i = 0; i < inventorySlotElements.length; i++) {
        const element = inventorySlotElements[i];
        if (inventorySlots.length > i) {
            element.removeChild(element.firstChild);
            let img = document.createElement("img");
            img.src = "images/item_base.png";
            element.appendChild(img);
        }
        else {
            element.removeChild(element.firstChild);
            element.appendChild(document.createElement("div"));
        }


    }
}*/

function generateInventory() {
    for (let i = 0; i < localPlayer.ship.inventory.slots.length; i++) {
        const slot = localPlayer.ship.inventory.slots[i];
        let newSlot = document.createElement("div");
        newSlot.dataset.slotId = i;
        slotElements[i] = newSlot;
        if (slot.filter == -1) {
            newSlot.classList.add("inventoryCell");
            /* if (slot.item.stack == 0) {
                newSlot.appendChild(document.createElement("div"));
            }
            else {
                createItemElement(slot)
            } */
            inventoryGrid.appendChild(newSlot);

        }
        else {
            newSlot.classList.add("inventorySlotSpecial");
            /**@type {HTMLElement} */
            let section;
            let container = document.createElement("div");
            let parent = document.createElement("div");
            let divNum = document.createElement("div");
            let spanNum = document.createElement("span");
            let spanName = document.createElement("span");
            if (i == 0 || i == 2) {
                section = inventorySpecialSections[0];
                container.style.flexDirection = "row";
                divNum.classList.add("slotsLeft");
            }
            else {
                section = inventorySpecialSections[1];
                container.style.flexDirection = "rowReverse";
                divNum.classList.add("slotsRight");
            }
            spanNum.textContent = "000";
            spanName.textContent = "test";
            divNum.classList.add("specialSlotNumber", "itemNumber");
            section.appendChild(container);
            container.appendChild(divNum);
            container.appendChild(parent);
            divNum.appendChild(spanNum);
            parent.appendChild(newSlot);
            parent.appendChild(spanName);
        }
        generateEmptyItem(slot);
        refreshSlotElement(slot);
        newSlot.addEventListener("mouseenter", e => {
            hoveredSlot = newSlot;
        })
        newSlot.addEventListener("mouseleave", e => {
            hoveredSlot = null;
        })
    }
    draggedItem = generateEmptyItem();
    draggedItem.classList.add("draggedItem");
    draggedItem.style.display = "none";
}

function findSlotElement(id) {
    let cells = document.getElementsByClassName("inventoryCell");
    for (let i = 0; i < cells.length; i++) {
        const element = cells[i];
        console.log("dsds", element.dataset.slotId, id);
        if (element.dataset.slotId == id) return element;
    }
    return null;
}


/**@param {Slot} slot */
function generateEmptyItem(slot) {
    /**@type {HTMLElement} */
    let slotElement;
    let addDetails = true;
    if (slot) {
        slotElement = slotElements[slot.id];
        slotElement.textContent = "";
        if (slot.filter != -1) {
            addDetails = false
        }
    }
    else {
        slotElement = document.body;
    }
    let newItem = document.createElement("div");
    newItem.classList.add("item");
    newItem.style.backgroundColor = "#000000";
    newItem.dataset.tooltipName = "Empty slot";
    let spanNum, spanName;
    if (addDetails) {
        spanNum = document.createElement("span");
        spanNum.classList.add("itemNumber");
        spanNum.textContent = "0";
    }
    let img = document.createElement("img");
    if (addDetails) {
        spanName = document.createElement("span");
        spanName.textContent = "No item";
    }
    if (addDetails) newItem.appendChild(spanNum);
    newItem.appendChild(img);
    if (addDetails) newItem.appendChild(spanName);
    slotElement.appendChild(newItem);

    if (slot) {

        newItem.addEventListener("mousedown", () => {
            if (slot.item.stack > 0) {
                draggedItem.style.display = "flex";
                refreshItemElement(draggedItem, slot);
                draggedItemInfo = slot.item;
                dragStart = { x: newItem.offsetLeft + inventoryElement.offsetLeft, y: newItem.offsetTop + inventoryElement.offsetTop };
                dragMoved = { x: 0, y: 0 };
                draggedItemOrigin = slotElement;
                draggedItem.style.left = (dragStart.x) + "px";
                draggedItem.style.top = (dragStart.y) + "px";
                draggedElement = draggedItem;
                draggingItem = true;
                dragging = true;
                slotElement.classList.add("emptySlot");
            }
        });

        newItem.addEventListener("mouseenter", e => {
            if (slot.item.stack > 0) {
                hoverTime = 0;
                tooltipChanged = true;
                tooltipStack.push(newItem);
            }
        })
        newItem.addEventListener("mouseleave", e => {
            if (slot.item.stack > 0) {
                hoverTime = 0;
                tooltipChanged = true;
                tooltipStack.pop();
            }
        })
    }

    return newItem;

}

/**@param {Slot} slot */
function refreshSlotElement(slot) {
    let slotElement = slotElements[slot.id];
    let itemElement = slotElement.firstElementChild;
    if (slot.item.stack > 0) {
        slotElement.classList.remove("emptySlot");

    }
    else {
        slotElement.classList.add("emptySlot");
    }
    refreshItemElement(itemElement, slot);
}
/**
 * @param {HTMLElement} itemElement 
 * @param {Slot} slot 
*/

function refreshItemElement(itemElement, slot) {
    let img;
    let slotElement = itemElement.parentElement;
    if (slot.item.stack > 0) {
        if (slot.filter == -1 || slotElement == document.body) {
            let spanNum = itemElement.children[0];
            img = itemElement.children[1];
            let spanName = itemElement.children[2];
            spanNum.textContent = slot.item.stack;
            spanName.textContent = slot.item.stats.name;
        }
        else {
            img = itemElement.children[0];
            slotElement.parentElement.children[1].textContent = slot.item.stats.name;
            slotElement.parentElement.parentElement.children[0].firstElementChild.textContent = slot.item.stack;
        }
        img.src = "images/ui/item " + slot.item.stats.name + ".png";
        itemElement.style.backgroundColor = slot.item.stats.color;
    }
    else if (slot.filter != -1) {
        slotElement.parentElement.children[1].textContent = "Empty";
        slotElement.parentElement.parentElement.children[0].firstElementChild.textContent = "0";
    }
}

inventoryElement.addEventListener("mouseenter", e => {
    mouseInInventory = true;
});
inventoryElement.addEventListener("mouseleave", e => {
    mouseInInventory = false;
});

/* Array.from(itemElements).forEach(element => {
    element.addEventListener("mousedown", () => {
        element.style.left = "unset";
        element.style.top = "unset";
        element.classList.add("draggedItem");
        dragStart = { x: element.offsetLeft + inventoryElement.offsetLeft, y: element.offsetTop + inventoryElement.offsetTop };
        dragMoved = { x: 0, y: 0 };
        draggedItemOrigin = element.parentElement;
        document.getElementById("guiContainer").appendChild(element);
        draggedItemOrigin.appendChild(document.createElement("div"));
        element.style.left = (dragStart.x) + "px";
        element.style.top = (dragStart.y) + "px";
        draggedElement = element;
        draggedItem = element;
        dragging = true;
    })
}); */

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
        //console.log(dragMoved, dragStart);
        draggedElement = element.parentElement;
        dragging = true;
        dragStart = { x: element.parentElement.offsetLeft, y: element.parentElement.offsetTop };
        dragMoved = { x: 0, y: 0 };
    })
    element.addEventListener("mouseup", () => {
        draggedElement = null;
        dragging = false;
        dragMoved = { x: 0, y: 0 };
        dragStart = { x: 0, y: 0 };
    })
});

Array.from(resizeButtons).forEach(element => {
    element.addEventListener("mousedown", () => {
        draggedElement = element.parentElement;
        resizing = true;
        dragMoved = { x: element.parentElement.offsetWidth, y: element.parentElement.offsetHeight };
    })
    element.addEventListener("mouseup", () => {
        draggedElement = null;
        resizing = false;
        dragMoved = { x: 0, y: 0 };
    })
});

document.addEventListener("mouseup", () => {

    if (draggingItem) {
        /**@type {Slot}*/
        let originSlot = localPlayer.ship.inventory.slots[draggedItemOrigin.dataset.slotId];
        /**@type {Slot}*/
        let targetSlot;
        if (hoveredSlot) targetSlot = localPlayer.ship.inventory.slots[hoveredSlot.dataset.slotId];
        if (mouseInInventory) {
            if (hoveredSlot != null && hoveredSlot != draggedItemOrigin && originSlot.filter == -1 && (targetSlot.filter == draggedItemInfo.stats.tag || targetSlot.filter == -1)) {
                draggedItem.style.display = "none";
                slotsToSwap = { from: draggedItemOrigin.dataset.slotId, to: hoveredSlot.dataset.slotId };
                actionIDs.push(ActionId.SwapSlots);
            }
            else {
                draggedItem.style.display = "none";
                draggedItemOrigin.classList.remove("emptySlot");
            }
        } else {
            draggedItem.style.display = "none";
            //let item = new Item("as",Item.list.size,1,localPlayer.ship.position.result().add(new Vector(500,0).rotate(Math.random()*Math.PI*2)));
            let pos = screenToWorldPos(mousePosition.result().sub(screen.center).clamp(500 * camera.zoom).add(screen.center));
            //let item = new DroppedItem("as", DroppedItem.list.size, 1, pos, localPlayer.ship.position);
            itemToDrop = { position: pos, stack: draggedItemInfo.stack, slotId: draggedItemOrigin.dataset.slotId };
            actionIDs.push(ActionId.DropItem);
        }
        //refreshSlotElement(localPlayer.ship.inventory.slots[draggedItemOrigin.dataset.slotId]);

    }
    draggedElement = null;
    resizing = false;
    dragging = false;
    draggingItem = false;
    dragMoved = { x: 0, y: 0 };
    dragStart = { x: 0, y: 0 };
});

toggleInventory.addEventListener("click", () => {
    inventoryElement.classList.toggle("closed");
})

function updateTooltip(deltaTime) {
    performanceData.logAndNext();
    hoverTime += deltaTime;

    //If hover active or changed recently
    if (tooltipStack.length > 0 || hoverTime < 1) {
        //Move tooltip
        tooltipBox.style.top = Math.min(mousePosition.y, screen.height - tooltipSize.y - 10) + "px";
        if (mousePosition.x + tooltipSize.x + 10 >= screen.width) {
            tooltipBox.style.left = (mousePosition.x - tooltipSize.x - 20) + "px";
        }
        else {
            tooltipBox.style.left = mousePosition.x + "px";
        }

        //If changed hover this frame
        if (hoverTime <= deltaTime) {
            tooltipBox.style.opacity = "0";
        }
        //If tooltipDelay reached this frame
        if (tooltipStack.length > 0 && hoverTime >= tooltipDelay && hoverTime <= tooltipDelay + deltaTime) {

            let element = tooltipStack[tooltipStack.length - 1];
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
            /* if (tooltipSize.y + mousePosition.y > screen.height) {
                tooltipBox.style.bottom = 0;
                tooltipBox.style.top = (mousePosition.y-tooltipSize.y) + "px";
            } */
            tooltipSize.x = tooltipBox.offsetWidth;
            tooltipSize.y = tooltipBox.offsetHeight;
            console.log(tooltipSize);

            //tooltipBox.style.display = "unset";
            tooltipBox.style.opacity = "1";
        }
    }
    //If no change recently
    else {
        //tooltipBox.style.display = "none";
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

            let ptl = (2 - ((lx % 1) + (ly % 1))) / 2;
            let ptr = (2 - (1 - (lx % 1) + (ly % 1))) / 2;
            let pbl = (2 - ((lx % 1) + 1 - (ly % 1))) / 2;
            let pbr = (2 - (1 - (lx % 1) + 1 - (ly % 1))) / 2;



            gasPX.oscilation += deltaTime;
            if (scannedGas[Math.floor(lx) * 1000 / minimapScale + Math.floor(ly)] == undefined) {
                gasPX.scale.set(Math.max(1 - Math.abs(gasPX.oscilation), 0) / 2 + 0.3);
                if (gasPX.oscilation > 2) {
                    gasPX.oscilation -= 3;
                }
                gasPX.tint = 0x555555;
            } else {
                gasPX.tint = 0xffffff;
                gasPX.scale.set((gtl * ptl + gtr * ptr + gbl * pbl + gbr * pbr) / 200);
            }
        }
    }
}



let bigMapShown = false;

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