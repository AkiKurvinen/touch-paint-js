const canvas = document.getElementById("paint_canvas");
const ctx = canvas.getContext("2d");

let brush_size = 10;
let color = "red";
let erase = false
let fake_cursor = document.getElementById("circularcursor")

let mouseEvent = "empty"
let lastX
let lastY

let body_margins = [16, 16]


canvas.addEventListener("mouseenter", custom_mouse_enter);
canvas.addEventListener("mousedown", custom_mouse_down);
canvas.addEventListener("mouseleave", custom_mouse_leave);
canvas.addEventListener("mouseup", custom_mouse_up);
canvas.addEventListener("mousemove", custom_mouse_move);

canvas.addEventListener("touchstart", custom_touch_start);
canvas.addEventListener("touchmove", custom_touch_move);
canvas.addEventListener("touchend", custom_touch_end);

function elementScale(element) {
    return element.offsetWidth === 0 ? 0 : (element.width / element.offsetWidth);
}

function custom_mouse_down(event) {
    color = document.getElementById("color").value;
    brush_size = document.getElementById("width").value;
    mouseEvent = "mouseDown";
}

function custom_mouse_leave(event) {
    mouseEvent = "mouseleave";
}

function custom_mouse_up(event) {
    mouseEvent = "mouseup";
}

function custom_mouse_enter(event) {
    document.getElementById("circularcursor").style.display = "block";
    mouse_x = (event.pageX - canvas.offsetLeft);
    mouse_y = (event.pageY - canvas.offsetTop);
    fake_cursor.style.left = event.x - brush_size / 2 + "px";
    fake_cursor.style.top = event.y - brush_size / 2 + "px";
}

function custom_mouse_move(event) {
    mouse_x = (event.pageX - canvas.offsetLeft - body_margins[1]);
    mouse_y = (event.pageY - canvas.offsetTop - body_margins[0]);
    fake_cursor.style.left = event.x - brush_size / 2 + "px";
    fake_cursor.style.top = event.y - brush_size / 2 + "px";

    if (mouseEvent == "mouseDown") {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brush_size;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(mouse_x, mouse_y);
        ctx.closePath();
        ctx.stroke();
    }

    lastY = mouse_y
    lastX = mouse_x
}

// touch
function custom_touch_start(event) {
    document.getElementById("circularcursor").style.display = "none";
    color = document.getElementById("color").value;
    brush_size = document.getElementById("width").value;
    lastX = event.touches[0].clientX - canvas.offsetLeft;
    lastY = event.touches[0].clientY - canvas.offsetTop;
}


function custom_touch_move(event) {

    touch_pos_x = event.touches[0].clientX - canvas.offsetLeft - body_margins[1];
    touch_pos_y = event.touches[0].clientY - canvas.offsetTop - body_margins[0];
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brush_size;
    ctx.lineJoin = "round";
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(touch_pos_x, touch_pos_y);
    ctx.closePath();
    ctx.stroke();

    lastX = touch_pos_x;
    lastY = touch_pos_y;
}

function custom_touch_end(event) {
    ctx.closePath();
    ctx.stroke();
}

// tools
function setErase() {
    const elem = document.getElementById("eraser")
    erase = elem.checked
    console.log(erase)
    ctx.globalCompositeOperation = erase ? 'destination-out' : "source-over";
}

function clearArea() {
    let text = "Clear all?";
    if (confirm(text) == true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function updateCurSize(size) {
    document.getElementById("brush_size").innerText = size
    brush_size = size
    fake_cursor.style.width = size + "px"
    fake_cursor.style.height = size + "px"
}

// resize canvas on small screens
function resizeWindow() {
    let wd = window.innerWidth
    if (wd < 600) {
        document.getElementById("paint_canvas").height = 300;
        document.getElementById("paint_canvas").width = 300;
        document.body.style.overflow = "hidden";
    }
    else {
        document.getElementById("paint_canvas").height = 400;
        document.getElementById("paint_canvas").width = 400;
        document.body.style.overflow = "hidden";
    }
}
function setup() {
    console.log("setup")
    updateCurSize(10)
    window.addEventListener("resize", resizeWindow);
    resizeWindow()
}

setup()
