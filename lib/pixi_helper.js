class Color {    
    constructor(rgb, alpha) {
        this.rgb = rgb;
        this.alpha = arguments.length > 1 ? alpha : 1;
    }
}

class LineOptions {
    constructor(color, strokeSize) {
        this.color = color || new Color(0x000000, 1);
        this.strokeSize = arguments.length > 1 ? strokeSize : 1;
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
    constructor(back, text, container) {
        this.background = back;
        this.text = text;
        this.background.addChild(this.text);
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
        let bounds = this.text.getBounds();
        this.background.clear();
        this.background.drawRect(0, 0, bounds.width, bounds.height);
    }
}

function line(container, x, y, x1, y1, options = new LineOptions()) { 
    let line = new PIXI.Graphics();
    line.lineStyle(options.strokeSize, options.color.rgb, options.color.alpha);
    line.moveTo(x, y);
    line.lineTo(x1, y1);
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
    let text = new PIXI.Text(message, options);
    text.x = 0;
    text.y = 0;
    
    let textBounds = text.getBounds();
    let back = new PIXI.Graphics();
    back.beginFill(0xFFFFFF, 1);
    back.drawRect(0, 0, textBounds.width, textBounds.height);
    back.x = x;
    back.y = y;

    return new TextBack(back, text, container);
}