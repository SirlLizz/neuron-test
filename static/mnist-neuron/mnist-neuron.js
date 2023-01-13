window.onload = function () {
    var canvas = document.getElementById('sketchpad'),
        context = canvas.getContext('2d'),
        canvasOffset = getOffsetSum(canvas),
        thumbnailCtx = document.getElementById('thumbnail').getContext("2d"),
        footprint = {
            width: 28,
            height: 28
        },
        isRecognized = false,
        zoom = 10,
        clearer = function clearer () {
            context.fillStyle = "white";
            context.fillRect(0,0,footprint.width*zoom,footprint.height*zoom);
            thumbnailCtx.fillStyle = "white";
            thumbnailCtx.fillRect(0,0,footprint.width,footprint.height);
            document.getElementById('result').innerText = '';
            isRecognized = false;
        };

    clearer();

    function getOffsetSum(elem) {
        var top=0, left=0
        while(elem) {
            top = top + parseInt(elem.offsetTop)
            left = left + parseInt(elem.offsetLeft)
            elem = elem.offsetParent
        }

        return {top: top, left: left}
    }

    var drawer = {
        isDrawing: false,
        touchstart: function (coors) {
            context.beginPath();
            context.lineWidth = 20;
            context.lineCap="round";
            context.moveTo(coors.x-canvasOffset.left, coors.y-canvasOffset.top);
            this.isDrawing = true;
        },
        touchmove: function (coors) {
            if (this.isDrawing) {
                if (isRecognized) {
                    clearer();
                }
                context.lineTo(coors.x-canvasOffset.left, coors.y-canvasOffset.top);
                context.stroke();
            }
        },
        touchend: function (coors) {
            if (this.isDrawing) {
                this.touchmove(coors);
                this.isDrawing = false;
            }
        }
    };

    function draw(event) {
        var type = null;
        switch(event.type){
            case "mousedown":
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchstart";
                break;
            case "mousemove":
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchmove";
                break;
            case "mouseup":
                event.touches = [];
                event.touches[0] = {
                    pageX: event.pageX,
                    pageY: event.pageY
                };
                type = "touchend";
                break;
        }

        var coors;
        if(event.type === "touchend") {
            coors = {
                x: event.changedTouches[0].pageX,
                y: event.changedTouches[0].pageY
            };
        }
        else {
            // get the touch coordinates
            coors = {
                x: event.touches[0].pageX,
                y: event.touches[0].pageY
            };
        }
        type = type || event.type
        drawer[type](coors);
    }

    var touchAvailable = ('createTouch' in document) || ('ontouchstart' in window);

    if(touchAvailable){
        canvas.addEventListener('touchstart', draw, false);
        canvas.addEventListener('touchmove', draw, false);
        canvas.addEventListener('touchend', draw, false);
    }

    else {
        canvas.addEventListener('mousedown', draw, false);
        canvas.addEventListener('mousemove', draw, false);
        canvas.addEventListener('mouseup', draw, false);
    }

    window.addEventListener("resize", function (event) {
        event.preventDefault();
        canvasOffset = getOffsetSum(canvas);
    });

    document.body.addEventListener('touchmove', function (event) {
        event.preventDefault();
    })

    document.getElementById('sketchClearButton').addEventListener('click', function (event) {
        event.preventDefault();
        clearer();
    })

    document.getElementById("backButton").addEventListener("click", function () {
        window.location.href = '/'
    });

    document.getElementById('sketchRecogniseButton').addEventListener('click', function (event) {
        event.preventDefault();
        if (isRecognized) return;

        var imgData = context.getImageData(0, 0, 280, 280)

        grayscaleImg = imageDataToGrayscale(imgData);
        var boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
        var trans = centerImage(grayscaleImg);

        var canvasCopy = document.createElement("canvas");
        canvasCopy.width = imgData.width;
        canvasCopy.height = imgData.height;
        var copyCtx = canvasCopy.getContext("2d");
        var brW = boundingRectangle.maxX+1-boundingRectangle.minX;
        var brH = boundingRectangle.maxY+1-boundingRectangle.minY;
        var scaling = 190 / (brW>brH?brW:brH);
        copyCtx.translate(canvas.width/2, canvas.height/2);
        copyCtx.scale(scaling, scaling);
        copyCtx.translate(-canvas.width/2, -canvas.height/2);
        copyCtx.translate(trans.transX, trans.transY);

        copyCtx.drawImage(context.canvas, 0, 0);

        imgData = copyCtx.getImageData(0, 0, 280, 280);
        grayscaleImg = imageDataToGrayscale(imgData);

        var nnInput = new Array(784),  nnInput2 = [];
        for (var y = 0; y < 28; y++) {
            for (var x = 0; x < 28; x++) {
                var mean = 0;
                for (var v = 0; v < 10; v++) {
                    for (var h = 0; h < 10; h++) {
                        mean += grayscaleImg[y*10 + v][x*10 + h];
                    }
                }
                mean = (1 - mean / 100);
                nnInput[x*28+y] = (mean - .5) / .5;
            }
        }

        var thumbnail =  thumbnailCtx.getImageData(0, 0, footprint.width, footprint.height);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(copyCtx.canvas, 0, 0);
        for (var y = 0; y < 28; y++) {
            for (var x = 0; x < 28; x++) {
                var block = context.getImageData(x * 10, y * 10, 10, 10);
                var newVal = 255 * (0.5 - nnInput[x * 28 + y] / 2);
                nnInput2.push(Math.round((255 - newVal) / 255 * 100) / 100);
                for (var i = 0; i < 4 * 10 * 10; i += 4) {
                    block.data[i] = newVal;
                    block.data[i + 1] = newVal;
                    block.data[i + 2] = newVal;
                    block.data[i + 3] = 255;
                }
                context.putImageData(block, x * 10, y * 10);

                thumbnail.data[(y * 28 + x) * 4] = newVal;
                thumbnail.data[(y * 28 + x) * 4 + 1] = newVal;
                thumbnail.data[(y * 28 + x) * 4 + 2] = newVal;
                thumbnail.data[(y * 28 + x) * 4 + 3] = 255;
            }
        }
        thumbnailCtx.putImageData(thumbnail, 0, 0);
        let urlencoded = new URLSearchParams();
        urlencoded.append("nnInput2", JSON.stringify(nnInput2));
        fetch('/check_data',{
            method: 'POST',
            body:urlencoded,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(res => {
            return res.json();
        }).then(data => {
            console.log('Detect1: ' + data);
            document.getElementById('result').innerText = data.toString();
            isRecognized = true;
        });
    })


}



function centerImage(img) {
    let meanX = 0;
    let meanY = 0;
    let rows = img.length;
    let columns = img[0].length;
    let sumPixels = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            let pixel = (1 - img[y][x]);
            sumPixels += pixel;
            meanY += y * pixel;
            meanX += x * pixel;
        }
    }
    meanX /= sumPixels;
    meanY /= sumPixels;

    let dY = Math.round(rows/2 - meanY);
    let dX = Math.round(columns/2 - meanX);
    return {transX: dX, transY: dY};
}

function getBoundingRectangle(img, threshold) {
    let rows = img.length;
    let columns = img[0].length;
    let minX=columns;
    let minY=rows;
    let maxX=-1;
    let maxY=-1;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (img[y][x] < threshold) {
                if (minX > x) minX = x;
                if (maxX < x) maxX = x;
                if (minY > y) minY = y;
                if (maxY < y) maxY = y;
            }
        }
    }
    return { minY: minY, minX: minX, maxY: maxY, maxX: maxX};
}

function imageDataToGrayscale(imgData) {
    var grayscaleImg = [];
    for (var y = 0; y < imgData.height; y++) {
        grayscaleImg[y]=[];
        for (var x = 0; x < imgData.width; x++) {
            var offset = y * 4 * imgData.width + 4 * x;
            var alpha = imgData.data[offset+3];
            if (alpha == 0) {
                imgData.data[offset] = 255;
                imgData.data[offset+1] = 255;
                imgData.data[offset+2] = 255;
            }
            imgData.data[offset+3] = 255;
            grayscaleImg[y][x] = imgData.data[y*4*imgData.width + x*4 + 0] / 255;
        }
    }
    return grayscaleImg;
}