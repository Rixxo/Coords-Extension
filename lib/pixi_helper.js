const LineType = Object.freeze({NORMAL:1, DASHED: 2});

class Color {    
    constructor(rgb, alpha) {
        this.rgb = rgb;
        this.alpha = arguments.length > 1 ? alpha : 1;
    }
}

class LineOptions {
    constructor(color, strokeSize, mode) {
        this.color = color || new Color(0x000000, 1);
        this.strokeSize = arguments.length > 1 ? strokeSize : 1;
        this.mode = mode || LineType.NORMAL;
    }
}

class PointOptions {
    constructor(fillColor, strokeSize, strokeColor) {
        this.fillColor = fillColor || new Color(0x000000);
        this.strokeSize = arguments.length > 1 ? strokeSize : 1;
        this.strokeColor = strokeColor || new Color(0x000000);
    }
}

class RectOptions {
    constructor(fillColor, strokeSize, strokeColor) {
        this.fillColor = fillColor || new Color(0x000000);
        this.strokeSize = arguments.length > 1 ? strokeSize : 1;
        this.strokeColor = strokeColor || new Color(0x000000);
    }
}

class TextPoint { 
    constructor(point, text) {
        this.point = point;
        this.text = text;
    }
}

class TextBack {
    constructor(container, message, x, y, options) {
        this.text = new PIXI.Text(message, options);
        let textBounds = this.text.getBounds();

        this.background = new PIXI.Graphics();
        this.background.lineStyle(1, 0x000000, 1);
        this.background.beginFill(0x000000, 0.7);
        this.background.drawRoundedRect(0, 0, textBounds.width+padding*2, textBounds.height+padding*2, 2);
        this.background.endFill();
        this.background.x = x;
        this.background.y = y;

        this.background.addChild(this.text);
        this.text.x = padding;
        this.text.y = padding;
        container.addChild(this.background);
    }

    destroy() {
        this.text.destroy();
        this.background.destroy();
    }

    setText(tx) {
        this.text.alpha = 1;
        this.text.text = tx;
    }

    setPosX(x) {
        this.background.x = x;
    }

    setPosY(y) {
        this.background.y = y;
    }

    setAlpha(alpha) {
        this.background.alpha = alpha;
    }

    clear() {
        this.background.clear();
        this.text.alpha = 0;
    }

    updateBackgroundBounds() {
        let bounds = this.text.getLocalBounds();
        this.background.clear();
        this.background.lineStyle(1, 0x000000, 1);
        this.background.beginFill(0x000000, 0.7);
        this.background.drawRoundedRect(0, 0, bounds.width+padding*2, bounds.height+padding*2, 2);
        this.background.endFill();
    }
}

function line(container, x, y, x1, y1, options = new LineOptions()) { 
    let line = new PIXI.Graphics();
    line.lineStyle(options.strokeSize, options.color.rgb, options.color.alpha);
    if (options.mode == LineType.DASHED) {
        // determine if horizontal
        if (isHorizontal(x,y,x1,y1)) {
            horizontalDashedLine(line, x, x1, y, lineLength, gap);
        } else {
            verticalDashedLine(line, y, y1, x, lineLength, gap);
        }

    } else {
        line.moveTo(x, y);
        line.lineTo(x1, y1);
    }
    line.x = 0;
    line.y = 0;
    container.addChild(line);
    return line;
}

function point(container, x, y, size, options = new PointOptions()) {
    let point = new PIXI.Graphics();
    if (options.strokeSize > 0) {
        point.lineStyle(options.strokeSize, options.strokeColor.rgb, options.strokeColor.alpha);
    }
    point.beginFill(options.fillColor.rgb, options.fillColor.alpha);
    point.drawCircle(0, 0, size);
    point.x = x;
    point.y = y;
    container.addChild(point);
    return point;
}

function rect(container, x, y, w, h, options = new RectOptions()) {
    let rect = new PIXI.Graphics();
    if (options.strokeSize > 0) {
        rect.lineStyle(options.strokeSize, options.strokeColor.rgb, options.strokeColor.alpha);
    }
    rect.beginFill(options.fillColor.rgb, options.fillColor.alpha);
    rect.drawRect(0, 0, w, h);
    rect.x = x;
    rect.y = y;
    container.addChild(rect);
    return rect;
}

function text(container, message, x, y, options) {
    return new TextBack(container, message, x, y, options);
}

function horizontalDashedLine(line, x, x1, y, segmetLength, gap) {
    let step = x;
    let lineLengthWithGap = segmetLength + gap;
    while(step < x1) {
        line.moveTo(step, y);
        line.lineTo(step+segmetLength, y);
        step += lineLengthWithGap;
    }
}

function verticalDashedLine(line, y, y1, x, segmetLength, gap) {
    let step = y;
    let lineLengthWithGap = segmetLength + gap;
    while(step < y1) {
        line.moveTo(x, step);
        line.lineTo(x, step+segmetLength);
        step += lineLengthWithGap;
    }
}

function isHorizontal(x, y, x1, y1) {
    let detlaY = y1-y;
    let deltaX = x1-x;
    let angle = detlaY/deltaX;
    return angle == 0; 
}