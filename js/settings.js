export let settings = {
  _colorMain: "black",
  _colorAlt: "white",
   _lineWidth: 3,
  _action: "pen",
  _startPosition: [undefined, undefined], //used for things drawn on overlay first, like lines and boxes
  _shift: false,
  
  get colorMain() {return this._colorMain},
  set colorMain(color) {this._colorMain = color},
  get color_alt() {return this._colorAlt},
  set color_alt(color) {this._colorAlt = color},
  get lineWidth() {return this. _lineWidth},
  set lineWidth(width) {this. _lineWidth = width},
  get action() {return this._action},
  set action(act) {this._action = act},
  get startPos() {return this._startPosition},
  set startPos(pos) {this._startPosition = pos},
  get shiftHeld() {return this._shift},
  set shiftHeld(bool) {this._shift = bool}
}