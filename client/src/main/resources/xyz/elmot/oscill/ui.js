var colors = ["#4c4", "#44c", "#cc4", "#8f8", "#88f", "#ff8"];


var disp = {
    a: document.getElementById("canvasa"),
    /**
     @type {CanvasRenderingContext2D}
     */
    aCtx: document.getElementById("canvasa").getContext("2d"),
    b: document.getElementById("canvasb"),
    /**
     @type {CanvasRenderingContext2D}
     */
    bCtx: document.getElementById("canvasb").getContext("2d"),
    c: document.getElementById("canvasc"),
    /**
     @type {CanvasRenderingContext2D}
     */
    cCtx: document.getElementById("canvasc").getContext("2d"),

    init: function () {
        this.f = document.createElement("canvas"),
        this.fCtx = this.f.getContext("2d");
    },

    setZoom: function (zx, zy) {
        var width = frameParam.w * zx;
        var height = frameParam.h * zy;
        [this.a, this.b, this.c, this.f].map(function (canvas) {
            canvas.width = width;
            canvas.style.width = width + "px";
            canvas.height = height;
            canvas.style.height = height + "px";
        });
        this.aCtx.globalAlpha = 0.3;
        this.aCtx.strokeStyle = "#080";
        this.aCtx.lineWidth = 2;
        this.aCtx.beginPath();
        for (var i = 1; i < frameParam.horGridN; i++) {
            this.aCtx.moveTo(0, height * i / frameParam.horGridN);
            this.aCtx.lineTo(width, height * i / frameParam.horGridN);
        }
        for (i = 1; i < frameParam.vertGridN ; i++) {
            this.aCtx.moveTo(width * i / frameParam.vertGridN, 0);
            this.aCtx.lineTo(width * i / frameParam.vertGridN, height);
        }
        this.aCtx.stroke();
        this.width = width;
        this.height = height;
}
};


function showStatus(status) {
    document.getElementById("device-info").innerHTML = status || "";
}

function drawData(data) {
    disp.bCtx.clearRect(0, 0, disp.width, disp.height);

    for (var j = 0; j < data.length; j++) {
        var array = data[j] || null;
        if (array === null) continue;
        disp.bCtx.lineWidth = 2;
        disp.bCtx.strokeStyle = colors[j];
        disp.bCtx.beginPath();
        var zx = (disp.width - 4) / array.length;
        var zy = (disp.height - 4) / frameParam.h;
        disp.bCtx.moveTo(2, zy * (frameParam.h - array[0]) - 2);
        for (var i = 1; i < array.length; i++) {
            disp.bCtx.lineTo(2 + i * zx, (frameParam.h - array[i]) * zy - 2);
        }
        disp.bCtx.stroke();
    }
}
function drawControls()
{
    disp.cCtx.clearRect(0,0,disp.width,disp.height);
    var trigLevel = document.getElementById("trig.level");
    if (trigLevel.value !== null) {
        var tY = disp.height * (1.0 - trigLevel.value / frameParam.h);
        disp.cCtx.beginPath();
        disp.cCtx.moveTo(0,tY);
        disp.cCtx.lineTo(disp.width,tY);
        disp.cCtx.lineWidth = 1;
        disp.cCtx.strokeStyle = "#999";
        disp.cCtx.stroke();
    }
}

function setZoom() {
    var zx = document.getElementById("x.zoom").value;
    var zy = document.getElementById("y.zoom").value;
    disp.setZoom(zx, zy);
    drawControls();
}

function scanControls() {
    var nodeList = document.querySelectorAll(".paramInput");
    for (var i = 0; i < nodeList.length; i++) {
        var elm = nodeList[i];
        setParam(elm.name, elm.value);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    function _addListener(selector, event, f) {
        var list = document.querySelectorAll(selector);
        for (var i = 0; i < list.length; i++) {
            list[i].addEventListener(event, f);
        }
    }

    function setParamFromInput(event) {
        var elm = event.target;
        var nodeList = document.querySelectorAll(".input-value[for='" + elm.name + "']");
        for (var i = 0; i < nodeList.length; i++) nodeList[i].innerHTML = elm.value
        setParam(elm.name, elm.value)
    }

    function wheelSelect(event) {
        if (event.target.options) {
            var idx = event.target.selectedIndex;
            var delta = event.deltaX + event.deltaY;
            if (idx > 0 && delta > 0) idx--;
            else if (delta < 0 && idx + 1 < event.target.options.length) idx++;
            event.target.selectedIndex = idx;
            event.target.dispatchEvent(new Event("change"))
        }

    }

    function wheelChange(event) {
        if (event.target.value) {
            var delta = event.deltaX + event.deltaY;
            if (event.deltaMode === 0) delta = delta / 10;
            var v = event.target.value - delta;
            if (v < event.target.min) v = event.target.min;
            if (v > event.target.max) v = event.target.max;
            event.target.value = v;
            event.target.dispatchEvent(new Event("change"))
        }

    }

    function pickVertical(event) {
        var elm = event.target;

        function verticalPickClick(event) {
            cancelPick();
            var value = frameParam.h * (1.0 - event.offsetY / event.target.offsetHeight);
            value = Math.floor(value);
            var elm = document.getElementById("trig.level");
            elm.value = value;
            elm.dispatchEvent(new Event("change"));
            drawControls();
        }

        function cancelPick() {
            elm.classList.remove("activated");
            disp.c.classList.remove("aiming");
            disp.c.removeEventListener("click", verticalPickClick)
        }


        if (elm.classList.contains("activated")) {
            cancelPick();
        } else {
            elm.classList.add("activated");
            disp.c.classList.add("aiming");
            disp.c.addEventListener("click", verticalPickClick)
        }
    }

    function inputReset(event) {
        var elm = event.target;
        var valueElement = document.getElementById(elm.getAttribute("for"));
        if (valueElement !== null) {
            valueElement.value = elm.value;
            valueElement.dispatchEvent(new Event("change"))
        }
    }

    _addListener(".paramInput", "change", setParamFromInput);
    _addListener(".paramScreen", "change", setZoom);
    _addListener(".wheelSelect", "wheel", wheelSelect);
    _addListener(".vertical-picker", "click", pickVertical);
    _addListener(".inputReset", "click", inputReset);
    _addListener(".wheelChange", "wheel", wheelChange);

    disp.init();
    setZoom();
    initHW();
});

function updateGuiControl(name, value) {
    var elm = document.getElementById(name) || null;
    if (elm !== null) elm.value = value
    drawControls();
}
