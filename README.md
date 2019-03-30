# web-whiteboard
本项目用 js canvas 制作一个在线的画板
- [源码](https://github.com/dogezhou/web-whiteboard)
- [在线预览](https://dogezhou.github.io/web-whiteboard/)

## 一、 鼠标事件
画板主要用鼠标进行交互，所以我们需要监听一些鼠标事件:  
mousedown, mousemove, mouseup

- 按下鼠标
```js
document.addEventListener('mousedown', function(e) {
    console.log('按下鼠标', e)
})
```

- 移动鼠标
```js
document.addEventListener('mousemove', function(e) {
    console.log('移动鼠标', e)
    console.log('鼠标视口上的 X 坐标', e.clientX)
    console.log('鼠标视口上的 Y 坐标', e.clientY)
    console.log('鼠标相对于事件源x轴的位置', e.offsetX)
    console.log('鼠标相对于事件源y轴的位置', e.offsetY)
})
```

- 松开鼠标
```js
document.addEventListener('mousemove', function(e) {
    console.log('松开鼠标', e)
})
```

## 二、实现画线
监听了鼠标事件，就可以在按下鼠标然后移动鼠标的时候，操作 canvas 的像素实现画线的操作了。  
Canvas API: [点击查看](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)  

### 1. 看文档，快速搞个 canvas demo：

```html
<!-- canvas 元素和图片类似，用 css 操作他的大小会等比缩放，所以要直接设置他的大小 -->
<canvas id="canvas" width=400 height=400></canvas>
```

```js
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.fillStyle = 'green';
ctx.fillRect(10, 10, 100, 100);
```

### 2. 怎么画线？
```js
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// 定义一个画点的函数
function drawDots(x, y, radius) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
}

// 鼠标操作
var enableDrag = false
canvas.addEventListener('mousedown', function(e) {
    enableDrag = true
    var x = e.offsetX
    var y = e.offsetY
    drawDots(x, y, 1)
})
canvas.addEventListener('mousemove', function(e) {
    if (enableDrag) {
        var x = e.offsetX
        var y = e.offsetY
        drawDots(x, y, 1)
    }
})
canvas.addEventListener('mouseup', function(e) {
    enableDrag = false
})
```

### 3. 画线的问题
上面的画线有一个问题就是，mousemove 事件的触发并不是每移动一个像素就触发一次的，浏览器有一定触发频率，所以按照上面的办法，鼠标移动快的时候线是不连续的。  
这里的解决方案是把两次触发的 mousemove 的点用线连接起来，使用到的 canvas API 如下
```js
// 画线的函数
function drawLine(x1, y1, x2, y2, width) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineWidth = width
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
}
```
修改 mousemove 连接当前点和之前点
```js
var lastPoint = { x: undefined, y: undefined }
canvas.addEventListener('mousedown', function(e) {
    enableDrag = true
    var x = e.offsetX
    var y = e.offsetY
    // 在按下时就要更新 lastPoint, 不然下一次点击会连接到上一条线的 lastPoint
    lastPoint = { x: x, y: y }
    drawDots(x, y, 1)
})
canvas.addEventListener('mousemove', function(e) {
    if (enableDrag) {
        var x = e.offsetX
        var y = e.offsetY
        var newPoint = { x: x, y: y}
        drawDots(x, y, 1)
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, 5)
        lastPoint = newPoint
    }
})
```

### 4. 画线的优化
我们已经连接了鼠标移动的当前点和之前点了，那么还需要再画出点来吗？不需要了。所以可以把 drawDots 函数都删了。
```js
var lastPoint = { x: undefined, y: undefined }
canvas.addEventListener('mousedown', function(e) {
    enableDrag = true
    var x = e.offsetX
    var y = e.offsetY
    // 在按下时就要更新 lastPoint, 不然下一次点击会连接到上一条线的 lastPoint
    lastPoint = { x: x, y: y }
})
canvas.addEventListener('mousemove', function(e) {
    if (enableDrag) {
        var x = e.offsetX
        var y = e.offsetY
        var newPoint = { x: x, y: y}
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, 5)
        lastPoint = newPoint
    }
})
```

## 三、Canvas 元素的全屏显示
Canvas 的大小取决于他的属性值，如果使用 CSS 设置宽高那么他会等比例缩放，还是包含那么像素，就像一个图片一样。所以要让 Canvas 全屏，需要设置它的属性为窗口大小。
```js
function setCanvasSize() {
    var pageWidth = document.documentElement.clientWidth
    var pageHeight = document.documentElement.clientHeight
    canvas.width = pageWidth
    canvas.height = pageHeight
}
setCanvasSize()
// 改变窗口大小重新设置
window.onresize = function() {
    setCanvasSize()
}
```

## 四、橡皮擦功能
任何作品都不可能一次完成，我们需要一个橡皮擦。实现鼠标点按滑动擦掉内容。  
Canvas 清除画板 API:
```js
ctx.clearRect(x, y, 10, 10)
```

### 1. 添加橡皮擦按钮
```html
<button id=eraser>橡皮擦</button>
```
```CSS
#eraser {
    position: fixed;
    bottom: 10px;
    left: 10px;
}
```
```js
var eraserEnabled = false
var eraser = document.getElementById('eraser');
eraser.addEventListener('click', function() {
    eraserEnabled = !eraserEnabled
})
```

### 2. 实现橡皮擦功能
需要修改画线的地方
```js
canvas.addEventListener('mousedown', function(e) {
    enableDrag = true
    var x = e.offsetX
    var y = e.offsetY
    if (eraserEnabled) {
        ctx.clearRect(x, y, 10, 10)
    } else {
        // 在按下时就要更新 lastPoint, 不然下一次点击会连接到上一条线的 lastPoint
        lastPoint = { x: x, y: y }
    }
})
canvas.addEventListener('mousemove', function(e) {
    if (!enableDrag) {
        return
    }

    var x = e.offsetX
    var y = e.offsetY
    if (eraserEnabled) {
        ctx.clearRect(x, y, 10, 10)
    } else {
        var newPoint = { x: x, y: y}
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, 5)
        lastPoint = newPoint
    }
})
```

### 3. 橡皮擦的细节错误
由于 ctx.clearRect 的清除的是以 x, y 为左上角的正方形，所以用起来就像一鼠标为左上角，优化一下就要
```js
ctx.clearRect(x - 5, y - 5, 10, 10)
```

