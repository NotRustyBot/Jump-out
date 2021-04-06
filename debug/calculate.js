const input = document.getElementById("data");
const tags = document.getElementById("tags");
const graph = document.getElementById("result");
const names = document.getElementById("names");
const updates = document.getElementById("runs");
const time = document.getElementById("seconds");
const frameTime = document.getElementById("total");
const canvas = document.getElementById("graph");
/**
 * @type {RenderingContext}
 */
const ctx = canvas.getContext('2d');
ctx.lineWidth = 0;

const graphSize = 200;
let graphData = [];
for (let i = 0; i < 200; i++) {
    graphData[i] = [];
}

const graphSkip = 5;
let graphWait = 0;


function update(graphEnabled) {
    /**
     * @type {String}
     */

    let rem = document.getElementsByClassName("rem");
    for (var i = rem.length - 1; i >= 0; i--) {
        rem[i].remove();
    }

    let strin = input.value;
    strin = strin.replace("[", "").replace("]", "").trim();
    let strs = strin.split(",");

    let updateCount = parseInt(strs.pop());
    updates.innerText = updateCount;

    let vals = [];

    let total = 0;

    for (let i = 0; i < strs.length; i++) {
        vals[i] = parseInt(strs[i]);
        total += vals[i];
    }

    time.innerText = Math.floor(total) / 1000;

    let tagNames = [];
    let tagstr = tags.value;
    let tagstrs = tagstr.split("\n");

    for (let i = 0; i < vals.length; i++) {
        if (tagstrs[i] != undefined && tagstrs[i] != "") {
            tagNames[i] = tagstrs[i];
        } else {
            tagNames[i] = i;
        }

    }

    let graphPoints = [];
    for (let i = 0; i < vals.length; i++) {
        let val = vals[i];

        const cost = val / total * 100;
        const ms = val / updateCount;
        graphPoints[i] = ms;

        let name = document.createElement("div");
        name.classList.add("rem");
        name.innerText = tagNames[i];
        name.style.flexGrow = cost;
        name.style.backgroundColor = "hsla(" + Math.floor(i / vals.length * 360) + ", 60%, 60%, 70%)";
        names.appendChild(name);

        let elem = document.createElement("div");

        if (cost < 3) {
            elem.innerHTML = "";
        } else if (cost < 5) {
            elem.innerHTML = Math.floor(cost) + "%";
        } else {
            elem.innerHTML = Math.floor(cost) + "%<br>" + ms.toFixed(2) + "ms";
        }

        elem.style.backgroundColor = "hsl(" + Math.floor(i / vals.length * 360) + ", 60%, 60%)";
        elem.style.width = cost + "%";
        elem.classList.add("rem");
        graph.appendChild(elem);


    }




    frameTime.innerText = (total / updateCount).toFixed(2);
    window.localStorage.setItem("tags", tags.value);

    if (graphEnabled && graphWait >= graphSkip) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        graphWait = 0;
        graphData.unshift(graphPoints);
        graphData.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const width = canvas.width / graphSize;
        const height = canvas.height;
        ctx.font = "20px sans-serif";
        for (let x = 0; x < graphSize; x++) {
            let y = height;
            for (let i = 0; i < graphData[x].length; i++) {
                const val = graphData[x][i];
                const cost = val * height / 10;
                ctx.fillStyle = "hsl(" + Math.floor(i / vals.length * 360) + ", 60%, 60%)";
                ctx.fillRect(x * width, y - cost, width + 1, cost);
                y -= cost;
            }
        }
        for (let i = 10; i > 0 ; i -= 2) {
            ctx.fillStyle = "#999";
            ctx.fillRect(0, height*i/10, canvas.width, 2);
            ctx.fillText(10-i + "ms", 10, height*i/10 + 20);
    
        }
    } else {
        graphWait++;
    }


}

tags.value = window.localStorage.getItem("tags") || "";

if (window.location.href.includes("?data=")) {
    let str = window.location.href.substring(window.location.href.indexOf("?data=") + 6);
    input.value = str;
}

update();

tags.onchange = update;
input.onchange = update;


window.addEventListener('storage', (e) => {
    if (e.key == "performanceData") {
        input.value = e.newValue;
        update(true);
    }
})