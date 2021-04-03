const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];

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

min_powercells.addEventListener("click", () =>{
    powercells.classList.toggle("minimized");
    gaugesElement.classList.toggle("minimized");
});