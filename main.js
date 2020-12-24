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

var width = window.innerWidth;
var height = window.innerHeight;

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
const DeleteKeyLower = "d";
const ClearKeyLower = "c";
const DeleteKeyUpper = "D";
const ClearKeyUpper = "C";
const HideTextLower = "h";
const HideTextUpper = "H";

let crossCont = new PIXI.Container();
let measureCont = new PIXI.Container();
let pointsCont = new PIXI.Container();

let points = [];
let lines = [];
let mouseClicked = false;
let isTextHidden = false;
let defaultTextStyle = new PIXI.TextStyle({
  fontFamily: "Arial",
  fontSize: 14,
  fontWeight: 'bold',
  fill: "#CE2906"
});
let rectangle = rect(measureCont, 0, 0, 0, 0, new RectOptions(new Color(0xCE2906, 0.2),  0));
let rectWidthText = text(measureCont, null, 0, 0, defaultTextStyle);
let rectHeightText = text(measureCont, null, 0, 0, defaultTextStyle);

// Construct 
let lineH = line(crossCont, 0, 0, width, 0, new LineOptions(new Color(0xCE2906), 2));
let lineV = line(crossCont,0, 0, 0, height, new LineOptions(new Color(0xCE2906), 2));
let target = point(crossCont,0, 0, 5, new PointOptions(new Color(0x000000, 0), 2, new Color(0xCE2906, 1)));
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
        text(pointsCont, "x: "+x.toFixed(0)+", y: "+y.toFixed(0), x+2, y+2, defaultTextStyle)));

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
  target.x = x;
  target.y = y;
  mainCoordsText.setText("x: "+x.toFixed(0)+", y: "+y.toFixed(0));
  mainCoordsText.setPosX(x + 5);
  mainCoordsText.setPosY(y - 20);
  mainCoordsText.updateBackgroundBounds();

  if (didMove(x, y))
  {
    rectangle.clear();
    rectangle.drawRect(0, 0,x - rectangle.x, y - rectangle.y);
    let rectBounds = rectangle.getBounds();
    rectHeightText.setText(rectBounds.height.toFixed(0)+"px");
    rectWidthText.setText(rectBounds.width.toFixed(0)+"px");
    
    let rectHeightTextBounds = rectHeightText.text.getBounds();

    if (rectangle.y > y) {
      rectHeightText.setPosX(rectangle.x-rectHeightTextBounds.width);
      rectHeightText.setPosY(rectangle.y-rectHeightTextBounds.height);
      rectWidthText.setPosX(x);
      rectWidthText.setPosY(y);
    }  else {
      rectHeightText.setPosX(rectangle.x-rectHeightTextBounds.width);
      rectHeightText.setPosY(y-rectHeightTextBounds.height);

      rectWidthText.setPosX(x);
      rectWidthText.setPosY(rectangle.y);
    }

    if (rectangle.x > x) {
      rectHeightText.setPosX(x-rectHeightTextBounds.width);
      rectWidthText.setPosX(rect.x);
    }

    if (x < rectangle.x && y < rectangle.y){

      rectHeightText.setPosX(x-rectHeightTextBounds.width);
      rectHeightText.setPosY(rectangle.y-rectHeightTextBounds.height);

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