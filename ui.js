const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];
const minimap_canvas = document.getElementById("minimap");

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gaugesElement = document.getElementsByClassName("gauges")[0];

const tooltipBox = document.getElementById("tooltip");

const tooltipElements = document.getElementsByClassName("tooltip");

var mousePosition = {x:0,y:0};
document.onmousemove = function(e){
    mousePosition.x = e.pageX;
    mousePosition.y = e.pageY;
    tooltipBox.style.top=mousePosition.y+"px";
    tooltipBox.style.left=mousePosition.x+"px";
};



Array.from(tooltipElements).forEach(element => {
    element.addEventListener("mouseenter",e=>{
        tooltipBox.style.opacity="1";
        if(element.dataset.tooltipName)
        tooltipBox.innerHTML = element.dataset.tooltipName;
        else 
        tooltipBox.innerHTML = "Missing tooltip";
        console.log("enter")
    })
    element.addEventListener("mouseleave",e=>{
        tooltipBox.style.opacity="0";
        
        console.log("leave")
    })
});



min_minimap.addEventListener("click", () =>{
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
