/**
 * 画板
 */

function autoSetCanvasSize(canvas) {
    function setCanvasSize() {
        var pageWidth = document.documentElement.clientWidth
        var pageHeight = document.documentElement.clientHeight
        canvas.width = pageWidth
        canvas.height = pageHeight
    }
    setCanvasSize()
    // 改变窗口大小重新设置
    window.onresize = function () {
        setCanvasSize()
    }
}

function drawLine(ctx, x1, y1, x2, y2, width) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineWidth = width
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
}

function bindMouseEvents(canvas, ctx) {
    // 鼠标操作
    var enableDrag = false
    var lastPoint = { x: undefined, y: undefined }
    canvas.addEventListener('mousedown', function (e) {
        enableDrag = true
        var x = e.offsetX
        var y = e.offsetY
        if (window.eraserEnabled) {
            ctx.clearRect(x - 5, y - 5, 10, 10)
        } else {
            // 在按下时就要更新 lastPoint, 不然下一次点击会连接到上一条线的 lastPoint
            lastPoint = { x: x, y: y }
        }
    })
    canvas.addEventListener('mousemove', function (e) {
        if (!enableDrag) { return }

        var x = e.offsetX
        var y = e.offsetY
        if (window.eraserEnabled) {
            ctx.clearRect(x - 5, y - 5, 10, 10)
        } else {
            var newPoint = { x: x, y: y }
            drawLine(ctx, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, 5)
            lastPoint = newPoint
        }
    })
    canvas.addEventListener('mouseup', function (e) {
        enableDrag = false
    })
}

function initActionButtons() {
    window.eraserEnabled = false
    var actions = document.getElementById('actions');
    var eraser = document.getElementById('eraser');
    var brush = document.getElementById('brush');
    eraser.addEventListener('click', function () {
        window.eraserEnabled = true
        actions.className = 'actions painting'
    })
    brush.addEventListener('click', function () {
        window.eraserEnabled = false
        actions.className = 'actions'
    })
}


function __main() {
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d')
    autoSetCanvasSize(canvas)
    initActionButtons()
    bindMouseEvents(canvas, ctx)
}

__main()
