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

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineWidth = window.lineWidth || 5
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
}

function registerUserEvents(canvas, ctx) {
    // 鼠标操作
    var enableDrag = false
    var lastPoint = { x: undefined, y: undefined }
    // 特性检测
    if (document.body.ontouchstart === undefined) {
        // 非触屏设备
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
    } else {
        // 触屏设备
        canvas.addEventListener('touchstart', function (e) {
            enableDrag = true
            var x = e.touches[0].clientX
            var y = e.touches[0].clientY
            if (window.eraserEnabled) {
                ctx.clearRect(x - 5, y - 5, 10, 10)
            } else {
                // 在按下时就要更新 lastPoint, 不然下一次点击会连接到上一条线的 lastPoint
                lastPoint = { x: x, y: y }
            }            
        })
        canvas.addEventListener('touchmove', function (e) {
            if (!enableDrag) { return }
    
            var x = e.touches[0].clientX
            var y = e.touches[0].clientY
            if (window.eraserEnabled) {
                ctx.clearRect(x - 5, y - 5, 10, 10)
            } else {
                var newPoint = { x: x, y: y }
                drawLine(ctx, lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
                lastPoint = newPoint
            }            
        })
        canvas.addEventListener('touchend', function (e) {
            enableDrag = false
        })
    }

}

// Save | Download image
function downloadImage(data, filename = 'untitled.jpeg') {
    var a = document.createElement('a');
    a.href = data;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
}

function initActionButtons(canvas, ctx) {
    window.eraserEnabled = false
    var actions = document.getElementById('actions');
    var eraser = document.getElementById('eraser');
    var brush = document.getElementById('brush');
    var clear = document.getElementById('clear');
    var download = document.getElementById('download');
    eraser.addEventListener('click', function () {
        window.eraserEnabled = true
        eraser.classList.add('active')
        brush.classList.remove('active')
    })
    brush.addEventListener('click', function () {
        window.eraserEnabled = false
        brush.classList.add('active')
        eraser.classList.remove('active')
    })
    clear.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    })
    download.addEventListener('click', function () {
        var dataURL = canvas.toDataURL("image/png")
        downloadImage(dataURL, '我的画-在线画板.png');
    })
}

function initColorButtons(ctx) {
    var colors = document.querySelector('.colors')
    var colorsList = document.querySelectorAll('.colors .color')

    var activeColor = document.querySelector('.colors .color.active')
    ctx.strokeStyle = activeColor.dataset.color

    colorsList.forEach(function (element) {
        var color = element.dataset.color
        window.colorsList = colorsList
        element.style.background = color
    })
    colors.addEventListener('click', function (e) {
        var element = e.target
        if (!element.classList.contains('color')) { return }

        var color = element.dataset.color
        colorsList.forEach(function (element) {
            element.classList.remove('active')
        })
        element.classList.add('active')
        ctx.strokeStyle = color
    })      
}

function initPenSizeButtons(ctx) {
    var thin = document.querySelector('.sizes .thin')
    var thick = document.querySelector('.sizes .thick')
    thin.addEventListener('click', function (e) {
        window.lineWidth = 5
    })
    thick.addEventListener('click', function (e) {
        window.lineWidth = 10
    }) 
}

function initCanvasBackground(canvas, ctx) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

/** 
 * 解决浏览器下拉刷新无法画问题
 * https://www.jianshu.com/p/04092ebe3b76
 * */
function disableScroll() {
    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault()
    })
}

function __main() {

    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d')
    autoSetCanvasSize(canvas)
    initCanvasBackground(canvas, ctx)
    disableScroll()
    initActionButtons(canvas, ctx)
    initColorButtons(ctx)
    initPenSizeButtons(ctx)
    registerUserEvents(canvas, ctx)
}

__main()
