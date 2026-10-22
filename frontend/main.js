// Set to true to enable uploading drawings to the backend (see ../backend/README.md)
const USE_BACKEND = true;
const BACKEND_URL = "../backend/upload.php";

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

// position relative to the canvas, independent of page scroll
function canvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width === 0 ? 1 : canvas.width / rect.width;
    return [(clientX - rect.left) * scale, (clientY - rect.top) * scale];
}

function moveFakeCursor(event) {
    // the cursor is absolutely positioned, so it needs page coordinates
    fake_cursor.style.left = event.pageX - brush_size / 2 + "px";
    fake_cursor.style.top = event.pageY - brush_size / 2 + "px";
}

function custom_mouse_enter(event) {
    document.getElementById("circularcursor").style.display = "block";
    [lastX, lastY] = canvasPos(event.clientX, event.clientY);
    moveFakeCursor(event);
}

function custom_mouse_move(event) {
    [mouse_x, mouse_y] = canvasPos(event.clientX, event.clientY);
    moveFakeCursor(event);

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
    [lastX, lastY] = canvasPos(event.touches[0].clientX, event.touches[0].clientY);
}


function custom_touch_move(event) {

    [touch_pos_x, touch_pos_y] = canvasPos(event.touches[0].clientX, event.touches[0].clientY);
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
        body_margins = [16, 16]
    }
    else {
        document.getElementById("paint_canvas").height = 400;
        document.getElementById("paint_canvas").width = 400;
        body_margins = [0, 0]
    }
}

// backend upload (only used when USE_BACKEND is true)
function setupBackendUpload() {
    const panel = document.createElement("form");
    panel.id = "backend_upload";
    panel.innerHTML = `
        <label for="lobby">Lobby</label>
        <input type="text" id="lobby" autocomplete="off" oninput="this.value=this.value.toLowerCase().trim()">
        <label for="username">Username</label>
        <input type="text" id="username" autocomplete="off" maxlength="32" pattern="[A-Za-z0-9_\\-]+" required><br>
        <button type="submit">Upload</button>
        <p id="upload_status"></p>
        <a id="display_link" class="invisible">View uploaded image</a>`;
    const preview = document.getElementById("preview_window");
    preview.insertBefore(panel, preview.querySelector("a"));
    panel.addEventListener("submit", uploadToBackend);
}

async function uploadToBackend(event) {
    event.preventDefault();
    const status = document.getElementById("upload_status");
    if (!drawnBlob) {
        status.innerText = "Nothing to upload";
        return;
    }
    const data = new FormData();
    data.append("lobby", document.getElementById("lobby").value);
    data.append("username", document.getElementById("username").value);
    data.append("fileToUpload", drawnBlob, "myimage.png");
    status.innerText = "Uploading...";
    try {
        const response = await fetch(BACKEND_URL, { method: "POST", body: data });
        const result = await response.json();
        status.innerText = result.ok ? "Uploaded!" : "Error: " + result.error;
        const link = document.getElementById("display_link");
        if (result.ok) {
            link.href = "display.html?" + new URLSearchParams({ lobby: result.lobby, username: result.username });
            link.classList.remove("invisible");
        } else {
            link.classList.add("invisible");
        }
    } catch (error) {
        status.innerText = "Error: could not reach backend";
    }
}

function setup() {
    console.log("setup")
    if (USE_BACKEND) {
        setupBackendUpload()
    }
    updateCurSize(10)
    window.addEventListener("resize", resizeWindow);
    resizeWindow()
}

setup()
