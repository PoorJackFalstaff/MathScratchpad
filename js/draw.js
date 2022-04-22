//POSSIBLY TO DO: fix "spray paint" effect with paint, particularly noticeable at 5/7 lineWidths
const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const ctxOverlay = overlay.getContext("2d");
//ctxOverlay is interacted with, it sends the information to canvas
ctx.canvas.height = window.innerHeight * 0.82;
ctx.canvas.width = window.innerWidth * 0.98;
ctxOverlay.canvas.height = window.innerHeight * 0.82;
ctxOverlay.canvas.width = window.innerWidth * 0.98;

const tools = document.getElementById("tools");
const clearButton = document.getElementById("clear");


let mouseXY = [undefined,undefined]
let mouseHeld = false;
let history = [];
let currentPath = [];
let curr = {
  color0: "black",
  color2: "white",
  lw: 3,
  act: "pen",
  stPos: [undefined, undefined], //used for things drawn on overlay first, like lines and boxes
  shift: false,
  
  get color_main() {return this.col0},
  set color_main(color) {this.col0 = color},
  get color_alt() {return this.col2},
  set color_alt(color) {this.col2 = color},
  get lineWidth() {return this.lw},
  set lineWidth(width) {this.lw = width},
  get action() {return this.act},
  set action(act) {this.act = act},
  get startPos() {return this.stPos},
  set startPos(pos) {this.stPos = pos},
  get shiftHeld() {return this.shift},
  set shiftHeld(bool) {this.shift = bool}
}

let tableSettings = {
  cols: 5,
  rows: 5,
  
  get column_count() {return this.cols},
  set column_count(count) {this.cols = count},
  get row_count() {return this.rows},
  set row_count(count) {this.rows = count}
}

let cartesianSettings = {
  //number of lines on each side (in the case of multiple quads)
  vert: 10,
  horz: 10,
  quadrants: [1,2,3,4, "full", "upper", "lower", "left", "right"],
  quadrant: "full",
  
  get vert_count() {return this.vert},
  set vert_count(count) {this.vert = count},
  get horz_count() {return this.horz},
  set horz_count(count) {this.horz = count},
  get quad() {return this.quadrant},
  set quadrant(q) {
    if(!q in quadrants) {
      this.quadrant = "full";
      throw new System.Exception("Quadrant value not valid");
    } else {
      this.quadrant = q;
    }
  }
}



clearButton.addEventListener("click", () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctxOverlay.clearRect(0,0,canvas.width,canvas.height);
})

overlay.addEventListener("mouseenter", (evt) => {
  //when re-enterting the canvas while mouse still being held down
  if(mouseHeld) mouseXY = [evt.clientX, evt.clientY];
})
overlay.addEventListener("mousedown", (evt) => {
  if(mouseHeld) return;
  
  mouseXY = [evt.clientX, evt.clientY];
  ctx.strokeStyle = curr.color_main;
  ctx.lineWidth = curr.lineWidth;
  ctxOverlay.strokeStyle = curr.color_main;
  ctxOverlay.lineWidth = curr.lineWidth;
  if(curr.action === "pen") return startPen(mouseXY);
  if(curr.action === "line") return startLine(mouseXY);
  if(curr.action === "rectangle") return startRectangle(mouseXY);
  if(curr.action === "table") return startTable(mouseXY);
  if(curr.action === "cartesian") return startCartesian(mouseXY);
})


overlay.addEventListener("mousemove", (evt) => {
  if(!mouseHeld) return;
  if(curr.action === "pen") return drawPen(evt);
  if(curr.action === "line") return drawLine(evt);
  if(curr.action === "rectangle") return drawRectangle(evt);
  if(curr.action === "table") return drawTable(evt);
  if(curr.action === "cartesian") return drawCartesian(evt);
})

document.addEventListener("mouseup", () => endDrawing())
function endDrawing() {
  ctx.closePath();
  mouseHeld = false;
  mouseXY = [undefined, undefined]
  
  //NEEDS TO BE MOVED...for taking image on overlay and drawing it to main canvas
  //some things shouldn't immediately be drawn to ctx..not sure what exactly, though. Don't really need
  //to be able to alter lines like you can in paint..but need to be able to edit stuff like tables, plots
  ctx.drawImage(overlay, 0, 0);
  ctxOverlay.clearRect(0,0,canvas.width,canvas.height);
}

//COLOR SELECTION
for(let color of document.querySelectorAll(".color")) {
  color.addEventListener("click", () => {
    changeColor(color.id.split("_")[0], "left");
  })
}
const overlayDrawSetup = (mouseXY) => {
  ctxOverlay.clearRect(0,0,canvas.width, canvas.height);
  curr.startPos = mouseXY;
  mouseHeld = true;
}

const drawLinePart = (canv, startX, startY, endX, endY) => {
  //numerous tools use lines, so this is used to do the basic path creation, line creation, and closing of path that is used for those
  //null for an end value means that it is the same as the start
  canv.beginPath();
  canv.moveTo(startX, startY);
  canv.lineTo(endX === null ? startX : endX, endY === null ? startY : endY);
  canv.closePath();
  canv.stroke();
}

//PEN DRAWING
function startPen(mouseXY) {
  ctx.beginPath();
  const params = [mouseXY[0], mouseXY[1], .5, 0, Math.PI*2];
  ctx.arc(...params);
  ctx.fill();
  currentPath.push({"circle" : params});
  mouseHeld = true;
}
function drawPen(evt) {
  const [newX, newY] = [evt.clientX, evt.clientY];
  ctx.moveTo(mouseXY[0], mouseXY[1]);
  ctx.lineTo(newX, newY);
  ctx.stroke();
  currentPath.push({"line": [mouseXY[0], mouseXY[1], newX, newY]});
  mouseXY = [newX, newY];
}
//LINE DRAWING
function startLine(mouseXY) {
  overlayDrawSetup(mouseXY);
}
function drawLine(evt) {
  let endX, endY;
  if(curr.shiftHeld) {
    //multiples of pi/4 only
    [endX, endY] = getShiftHeldLineEnd(evt.clientX, evt.clientY);
  } else {
    endX = evt.clientX;
    endY = evt.clientY;
  }
  ctxOverlay.clearRect(0,0,canvas.width,canvas.height);
  drawLinePart(ctxOverlay, ...curr.startPos, endX, endY);
}
function getShiftHeldLineEnd(mouseX, mouseY) {
  //multiples of pi/4. Get the angle, see which angle it's closest to, and draw line based on that angle. for cardinal directions, the length of this line is easy, since it can just match the vertical or horiz position of mouse, but for other 4, it's more complicated, because could go with either..or mix of both. paint uses some formula based on x & y....not sure if I like it all that much though..
  const x = mouseX - curr.startPos[0];
  const y = mouseY - curr.startPos[1];
  const angle = Math.atan(y/x);
  let newAngle = getNewShiftLineAngle(angle, y < 0);
  
  return [mouseX, mouseY] //PLACEHOLDER JUST TO BE ABLE TO SEE MOVING LINE WHILE FIGURING OUT!
}
  
function getNewShiftLineAngle(angle, upper) {
  //upper is bool indicating negative values(up negative for drawing)
  let newAngle;
  if(angle < 0) {
    //find the closest of the ordinal directions. if angle is not in upper, PI is then added to it
    if(angle > -Math.PI/8) {
      newAngle = 0;
    } else if(angle > 3*Math.PI/8) {
      newAngle = Math.PI / 4;
    } else {
      newAngle = Math.PI / 2;
    }
    if(!upper) newAngle += Math.PI;
  } else {
    if(angle < Math.PI / 8) {
      newAngle = Math.PI;
    } else if(angle < 3*Math.PI / 8) {
      newAngle = 3*Math.PI / 4;
    } else {
      newAngle = Math.PI / 2
    }
  }
}
//RECTANGLE DRAWING
function startRectangle(mouseXY) {
  overlayDrawSetup(mouseXY);
}
function drawRectangle(evt) {
  ctxOverlay.clearRect(0,0,canvas.width,canvas.height);
  ctxOverlay.beginPath();
  ctxOverlay.rect(...curr.startPos, evt.clientX - curr.startPos[0], evt.clientY - curr.startPos[1]);
  ctxOverlay.stroke();
}

//TABLE DRAWING
function startTable(mouseXY) {
  overlayDrawSetup(mouseXY);
}
function drawTable(evt) {
  drawRectangle(evt);
  //after adding the rectangle, add vertical and horizontal lines
  const colSpacing = (evt.clientX - curr.startPos[0]) / tableSettings.column_count;
  const rowSpacing = (evt.clientY - curr.startPos[1]) / tableSettings.row_count;
  for(let i = 1; i < tableSettings.column_count; i++) {
    //all cols start at startPos y and end at client y...evenly spaced, and two lines have been placed, so 
    //start at 1
    drawLinePart(ctxOverlay, curr.startPos[0] + i * colSpacing, curr.startPos[1], null, evt.clientY);
  }
  for(let i = 1; i < tableSettings.row_count; i++) {
    //all rows start at startpos x and end at client x--""""""
    drawLinePart(ctxOverlay, curr.startPos[0], curr.startPos[1] + i * rowSpacing, evt.clientX, null);
  }
}

function startCartesian(mouseXY) {
  overlayDrawSetup(mouseXY);
}
function drawCartesian(evt) {
  //only does full cartesians for now
  const xDelta = evt.clientX - curr.startPos[0];
  const yDelta = evt.clientY - curr.startPos[1];
  ctxOverlay.clearRect(0,0,canvas.width,canvas.height);
  ctxOverlay.lineWidth = 4;
  //x=0
  drawLinePart(ctxOverlay, curr.startPos[0] + xDelta/2, curr.startPos[1], null, evt.clientY);
  //y=0
  drawLinePart(ctxOverlay, curr.startPos[0], curr.startPos[1] + yDelta/2, evt.clientX, null)
  
  ctxOverlay.lineWidth = 1;
  // ctxOverlay.globalAlpha = .2;
  //vertical lines
  const xSpacing = xDelta / 2 / cartesianSettings.vert_count;
  for(let i = 1; i <= cartesianSettings.vert_count; i++) {
    //right
    ctxOverlay.globalAlpha = i % 5 === 0? 0.3 : 0.1;
    drawLinePart(ctxOverlay, curr.startPos[0] + xDelta/2 + i * xSpacing, curr.startPos[1], null, evt.clientY);
    //left
    drawLinePart(ctxOverlay, curr.startPos[0] + xDelta/2 - i * xSpacing, curr.startPos[1], null, evt.clientY);
  }
  
  //horizontal lines
  const ySpacing = yDelta / 2 / cartesianSettings.horz_count;
  for(let i = 1; i <= cartesianSettings.horz_count; i++) {
    ctxOverlay.globalAlpha = i % 5 === 0? 0.3 : 0.2;
    //up
    drawLinePart(ctxOverlay, curr.startPos[0], curr.startPos[1] + yDelta/2 - i * ySpacing, evt.clientX, null);
    //down
    drawLinePart(ctxOverlay, curr.startPos[0], curr.startPos[1] + yDelta/2 + i * ySpacing, event.clientX, null);
  }
  ctxOverlay.globalAlpha = 1.0;
}


//SET CURRENT ACTIONS BASED ON THE ID OF THE TOOL SELECTED
for(let shape of document.querySelectorAll(".shape")) {
  shape.addEventListener("click", () => curr.action = shape.id);
}


function changeColor(color, mouseBtn) {
  if(mouseBtn === "left") {
    curr.color_main = color;
    document.querySelector("#colors_chosen :nth-child(1)").style.backgroundColor = color;
    // alert("CURRENT COLOR IS NOW" + curr.color_main)
  } 
}

//SELECTING DIVS (VISUAL CHANGES)
for(let selectable of document.querySelectorAll(".selectable")) {
  selectable.addEventListener("click", () => {
    setSelected(selectable);
  })
}
function setSelected(selected) {
  //This function ONLY handles the visual selection aspects(border/bg color)
  Array.from(selected.parentNode.children).forEach(x => {
    x.classList.remove("selected");
    });
    selected.classList.add("selected");
}

//CHANGING STROKE WIDTH
(() => {
  for(let[i,v] of document.querySelectorAll("#size_chosen>div").entries() ) {
    v.addEventListener("click", () => curr.lineWidth = 2 * i + 1);
  }
})();


//KEY PRESSES
document.addEventListener("keydown", evt => {
  if(evt.key === "Shift") curr.shiftHeld = true;
})
document.addEventListener("keyup", evt => {
  if(evt.key === "Shift") curr.shiftHeld = false;
})


document.addEventListener("DOMContentLoaded", () => {
  //AUTO-SELECT PEN, 3 width 
  // setSelected("shapes", 1)
})