let cells = document.querySelectorAll(".cell");

let backgroundState = {
  untouched: "white", 
  selected: "black",
  highlighted: "darkred"
}

const setupCellInteractivity = (cells) => {
  //make changes to cells, checking if the cell is selected or not
  for(let cell of cells) {
    
    // cell.addEventListener("mouseover", () => {
    //   if(document.activeElement !== cell) cell.style.backgroundColor = "lightgray";
    // })
    // cell.addEventListener("mouseout", () => {
    //   //don't allow loss of hl color when mouse moved out
    //   if(document.activeElement !== cell && cell.style.backGroundColor === "lightgray") cell.style.backgroundColor = "white";
    // })
    cell.addEventListener("focusin", (evt) => {
      if(cell.style.backgroundColor === backgroundState.highlighted) return
      cell.style.backgroundColor = backgroundState.selected;
    })
    cell.addEventListener("focusout", () => {
      if(cell.style.backgroundColor === backgroundState.highlighted) return
      cell.style.backgroundColor = backgroundState.untouched;
    })
    cell.addEventListener("keydown", evt => {
      cellKeySetup(evt);
    })
    cell.addEventListener("mousedown", evt => {
      highlightCells(evt);
    })
  }
}

const cellKeySetup = (evt) => {
  //not sure if typing new numbers should empty cell, as Excel works
  const key = evt.key;
  // console.log(key);
  if(key === "Enter") {
    //should evaluate cell, then go to next row, or create one if not there
    evt.preventDefault();
    evaluateCell(document.activeElement);
    moveSelectedToNextRow();
  } else if(key === "Tab") {
    //should evaluate cell, then go to next column, or create one if not there
    evt.preventDefault();
    evaluateCell(document.activeElement);
    moveSelectedHorizontal("R");
  } else if(key === "ArrowDown") {
    moveSelectedVertical("D");
  } else if(key === "ArrowRight"){
    moveSelectedHorizontal("R");
  } else if(key === "ArrowLeft") {
    moveSelectedHorizontal("L");
  } else if(key === "ArrowUp") {
    moveSelectedVertical("U");
  } else if(key === "Delete") {
    evt.target.innerText = "";
  }
}

const moveSelectedToNextRow = () => {
  //goes to the next row, in the first column with data, as Excel does
  //cycle through children, finding first with data. 0 is th, so is ignored
  const children = document.activeElement.parentNode.children;
  let firstDataIndex;
  for(let i = 1; i < children.length; i++) {
    if(children[i].innerText != "") {
      firstDataIndex = i;
      break;
    }
  }
  if(!firstDataIndex) {
    //if no data in current row, just go down one space
    moveSelectedVertical("D");
  } else {
    const uncle = document.activeElement.parentNode.nextElementSibling;
    if(uncle) {
      uncle.children[firstDataIndex].focus();
    }
  }
  
}

const moveSelectedVertical = (dir) => {
  //for moving with arrow keys
  //see how many previous siblings activeElement has, so can go to same position on row
    let colPosition = 0;
    let current = document.activeElement;
    while(current) {
      current = current.previousElementSibling;
      if(current) colPosition++;
    }
    
    const uncle = dir === "D" ?  document.activeElement.parentNode.nextElementSibling : document.activeElement.parentNode.previousElementSibling;
    if(uncle) {
      //change in future so new rows created
      uncle.children[colPosition].focus();
    }
}

const moveSelectedHorizontal = (dir) => {
  //dir = "L" / "R"
  const sib = dir === "R" ? document.activeElement.nextElementSibling : document.activeElement.previousElementSibling;
  if(sib && sib.tagName !== "TH") {
      //change in future to add new columns
      sib.focus();
    }
}

const evaluateCell = (cell) => {
  const txt = cell.innerText;
  if(txt === "") return;
  //if cell contains certain characters only, it is considered text and not evaluated further
  //so far, function only continues if following found: +,-,*,/,^
  //will also end if leading - without any other 'operators'
  //doesn't yet handle stuff like 4**5, which leads to NaN error
  //TO DO: add basic stuff like abs()..
  if(/^-[^\+\-\*/\^]+$|^[^\+\-\*/\^]+$/.test(txt)) return;
  const twoTerms = [...txt.matchAll(/\d+|[\+\-\*\^\/]/g)].flat();
  document.activeElement.innerText = arithmeticTwoTerms(twoTerms[0], twoTerms[1], twoTerms[2]);
}

const arithmeticTwoTerms = (a, operator, b) => {
  //can currently only handle +-*/^ with positive numbers
  let result;
  switch(operator) {
    case "+": result = +a + +b; break;
    case "-": result = +a - +b; break;
    case "*": result = +a * +b; break;
    case "/": result = +a / +b; break;
    case "^": result = (+a)**+b; break;
    default: throw new Error("Operator not implemented!")
  }
  return result; 
}

const highlightCells = (evt) => {
  //either highlight cell, or unhighlight it, making sure to change its color to selected if it's the active element
  if(evt.button === 2) {
    evt.preventDefault();
    const targ = evt.target;
    if(targ.style.backgroundColor === backgroundState.highlighted) {
      if(targ === document.activeElement) {
        targ.style.backgroundColor = backgroundState.selected;
      } else {
        targ.style.backgroundColor = backgroundState.untouched;
      }
    } else {
      targ.style.backgroundColor = backgroundState.highlighted;
    targ.style.fontWeight = "bold";
    } 
  }
}


document.addEventListener("DOMContentLoaded", () => {
  document.oncontextmenu = () => false;
  setupCellInteractivity(cells);
})
