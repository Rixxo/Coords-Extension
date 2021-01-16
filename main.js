browser.runtime.onMessage.addListener(() => {
  let div = !!document.getElementById("area");
  if (div) {
    destroy();
  } else {
    init();
  }
});

function destroy() {
  destroyAllPoints();
  clearRectData();
  document.body.removeChild(div); 
}

function init() {
  document.body.appendChild(div);
}

let div = document.createElement('div');
div.id = "area";


let app = new PIXI.Application({ 
    antialias: true,
    transparent: true,
    resolution: 1
  }
);

div.appendChild(app.view);

var width = screen.width;
var height = screen.height;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(width, height);

// Setup mouse events
app.stage.interactive = true;
app.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);

// declaration global vars
const PointSize = 3;
const DragTrashHold = 10;
const StrokeSize = 1;
const lineLength = 20;
const gap = 10;
const padding = 5;
const DeleteKeyLower = "d";
const ClearKeyLower = "c";
const DeleteKeyUpper = "D";
const ClearKeyUpper = "C";
const HideTextLower = "h";
const HideTextUpper = "H";
const HideCrossLower = "p";
const HideCrossUpper = "P";

let crossCont = new PIXI.Container();
let measureCont = new PIXI.Container();
let pointsCont = new PIXI.Container();

let points = [];
let lines = [];
let mouseClicked = false;
let isTextHidden = false;
let defaultTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 12,
  fontWeight: 'bold',
  fill: "white"
});
let rectangle = rect(measureCont, 0, 0, 0, 0, new RectOptions(new Color(0xCE2906, 0.2),  0));
let rectWidthText = text(measureCont, null, 0, 0, defaultTextStyle);
let rectHeightText = text(measureCont, null, 0, 0, defaultTextStyle);

// Construct 
let defaultLineOptions = new LineOptions(new Color(0xCE2906), StrokeSize, LineType.DASHED);
let lineH = line(crossCont, 0, 0, width, 0, defaultLineOptions);
let lineV = line(crossCont,0, 0, 0, height, defaultLineOptions);
let mainCoordsText = text(crossCont, null, 0, 0, defaultTextStyle);

app.stage.addChild(pointsCont);
app.stage.addChild(measureCont);
app.stage.addChild(crossCont);

// Event handlers
app.stage.mousedown = (e) => {
  const x = e.data.global.x;
  const y = e.data.global.y;

  clearRectData();

  rectangle.x = x;
  rectangle.y = y;
  mouseClicked = true;
};

app.stage.mouseup = (e) => {
  const x = e.data.global.x;
  const y = e.data.global.y;

  if (!didMove(x, y))
  {
    points.push(
      new TextPoint(
        point(pointsCont, x, y, PointSize, new PointOptions(new Color(0xCE2906), 0)), 
        text(pointsCont, "x: "+x.toFixed(0)+"px\ny: "+y.toFixed(0)+"px", x+2, y+2, defaultTextStyle)));

    if (isTextHidden) {
      points[points.length-1].text.setAlpha(0);
    }

    if (points.length > 1) {
      lines.push(line(pointsCont, points[points.length-2].point.x, 
        points[points.length-2].point.y, 
        points[points.length-1].point.x, 
        points[points.length-1].point.y, new LineOptions(new Color(0xCE2906), 2)));
    }
  }
  mouseClicked = false;
}; 

app.stage.mousemove =  (e) => {
  const x = e.data.global.x;
  const y = e.data.global.y;
  lineH.y = y;
  lineV.x = x;
  mainCoordsText.setText("x: "+x.toFixed(0)+"px\ny: "+y.toFixed(0)+"px");
  mainCoordsText.setPosX(x + 10);
  let yOffset = mainCoordsText.background.getBounds().height+10;
  mainCoordsText.setPosY(y - yOffset);
  mainCoordsText.updateBackgroundBounds();

  if (didMove(x, y))
  {
    rectangle.clear();
    rectangle.drawRect(0, 0,x - rectangle.x, y - rectangle.y);
    let rectBounds = rectangle.getBounds();
    rectHeightText.setText("h: "+rectBounds.height.toFixed(0)+"px");
    rectWidthText.setText("w: "+rectBounds.width.toFixed(0)+"px");
    
    let rectHeightBounds = rectHeightText.background.getBounds();

    if (rectangle.y > y) {
      rectHeightText.setPosX(rectangle.x-rectHeightBounds.width);
      rectHeightText.setPosY(rectangle.y-rectHeightBounds.height);
      rectWidthText.setPosX(x);
      rectWidthText.setPosY(y);
    }  else {
      rectHeightText.setPosX(rectangle.x-rectHeightBounds.width);
      rectHeightText.setPosY(y-rectHeightBounds.height);

      rectWidthText.setPosX(x);
      rectWidthText.setPosY(rectangle.y);
    }

    if (rectangle.x > x) {
      rectHeightText.setPosX(x-rectHeightBounds.width);
      rectWidthText.setPosX(rectangle.x);
    }

    if (x < rectangle.x && y < rectangle.y){

      rectHeightText.setPosX(x-rectHeightBounds.width);
      rectHeightText.setPosY(rectangle.y-rectHeightBounds.height);

      rectWidthText.setPosX(rectangle.x);
      rectWidthText.setPosY(y);

    }

    rectWidthText.updateBackgroundBounds();
    rectHeightText.updateBackgroundBounds();
  }
};

window.addEventListener("keydown", (e) => {
  switch(e.key) {
    case DeleteKeyLower:
    case DeleteKeyUpper:
      destroyPoints(); 
      break;
    case ClearKeyLower:
    case ClearKeyUpper:
      destroyAllPoints();
      clearRectData();
      break;
    case HideTextLower:
    case HideTextUpper:
      hideText();
      break;
    case HideCrossLower:
    case HideCrossUpper:
      hideCross();
      break;
  }
});

function destroyPoints() {
  if (points.length < 1) return;

  let last = points.pop();
  last.point.destroy();
  last.text.destroy();
  if (points.length >= 1 && lines.length > 0) {
   
    last = lines.pop();
    last.destroy();
  }
}

function destroyAllPoints() {
  for(let i = points.length; i > 0; i--) {
    destroyPoints();
  }
}

function didMove(x, y) {
  return mouseClicked && (Math.abs(rectangle.x - x) > DragTrashHold || Math.abs(rectangle.y -y) > DragTrashHold)
}

function hideText() {
  let alpahVal = 0;
  if (isTextHidden) {
    alpahVal = 1;
  }
  points.forEach(p => {
    p.text.setAlpha(alpahVal);
  });
  isTextHidden = !isTextHidden;
}

function clearRectData() {
  rectangle.clear();
  rectHeightText.clear();
  rectWidthText.clear();
}

function hideCross() {
  lineV.alpha = !lineV.alpha;
  lineH.alpha = !lineH.alpha;
}