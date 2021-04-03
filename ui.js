const min_minimap = document.getElementById("minimize-minimap");
const minimap = document.getElementsByClassName("map")[0];

const min_powercells = document.getElementById("minimize-powercells");
const powercells = document.getElementsByClassName("powercells")[0];
const gauges = document.getElementsByClassName("gauges")[0];

min_minimap.addEventListener("click", () =>{
    minimap.classList.toggle("minimized");
});

min_powercells.addEventListener("click", () =>{
    powercells.classList.toggle("minimized");
    gauges.classList.toggle("minimized");
});