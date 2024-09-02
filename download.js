// Initializing
window.onload = function () {
    var dwn = document.getElementById('btndownload');
    var canvas = document.getElementById('paint_canvas');

    // Event handler for download
    dwn.onclick = function () {
        download(canvas, 'myimage.png');
    }

    /* canvas to file input */
    var toinput = document.getElementById('btntoinput');
    toinput.onclick = function () {
        const context = canvas.getContext("2d")
        cropImageFromCanvas(context)
        document.getElementById('test_imagebtn').classList.remove("invisible");
        canvas.toBlob((blob) => {
            const file = new File([blob], 'myimage.png');
            const dT = new DataTransfer();
            dT.items.add(file);
            document.querySelector("#fileToUpload").files = dT.files;
        });
    }
}

function previewImage() {
    const file = document.querySelector("#fileToUpload").files[0];
    const elem = document.querySelector("#imagePreview");
    elem.appendChild(new Image())
        .src = URL.createObjectURL(file);
}

function testImage() {
    previewImage()
    document.getElementById("imguploadform").innerHTML = ""
    document.getElementById("editor").innerHTML = ""
    document.getElementById("preview_window").classList.remove("invisible")
}

function cropImageFromCanvas(ctx) {
    var canvas = ctx.canvas,
        w = canvas.width, h = canvas.height,
        pix = { x: [], y: [] },
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        x, y, index;

    for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index + 3] > 0) {
                pix.x.push(x);
                pix.y.push(y);
            }
        }
    }

    pix.x.sort(function (a, b) { return a - b });
    pix.y.sort(function (a, b) { return a - b });
    var n = pix.x.length - 1;

    w = 1 + pix.x[n] - pix.x[0];
    h = 1 + pix.y[n] - pix.y[0];
    var cut
    try {
        cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
    } catch (error) {
        canvas.classList.remove("blink")
        setTimeout(() => {
            canvas.classList.add("blink")
        }, (1))

        throw new Error("Canvas is empty");
    }
    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);
}

function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// Source from:  http://stackoverflow.com/questions/18480474/how-to-save-an-image-from-canvas

/* Canvas Donwload */
function download(canvas, filename) {

    const cropImage = false;

    if (cropImage) {
        cropImageFromCanvas(canvas.getContext("2d"));
    }

    /// create an "off-screen" anchor tag
    var lnk = document.createElement('a'), e;

    /// the key here is to set the download attribute of the a tag
    lnk.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    lnk.href = canvas.toDataURL("image/png;base64");

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0, false, false, false,
            false, 0, null);

        lnk.dispatchEvent(e);
    } else if (lnk.fireEvent) {
        lnk.fireEvent("onclick");
    }
}
