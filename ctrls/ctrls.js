/*import framwork v1.2.1 in advance*/
var axis = iCanvas.createNewCtrl(function () {
    this.type = "axis";
    this.applyBoundary(0, 100);
    this.Box = iCanvas.ctrls.vbox(this.wrapper);
    this.appendChild(this.Box);
    //reference of the lines
    this.lines = [];
    //line space information
    this.lineSpace = {};
    //lables storage
    this.labs = {};
    //all sub ctrls, indecating all the assets inside the axis
    this.ctrls = [];
    //storage the save unit expressions
    this.UnitExps = {};
    var _areCtrlsAdded = false;
    this.selectdRange = 0;
    this.onRender(
        function (x, y) {
            this.caculateSelf();
            //set horizontal label positions
            this.setLabSpace();
            //calculate unit expressions for each range
            for (var i = 0; i < this.Range.length; i++) {
                //calculate line space and unit expression according to different ranges
                this.setLineSpace(i);
                this.getUnit(i);
            }
            //config the virtual box properties
            this.Box.applyWH(iCanvas.newExp(this.EX).SUB(this.SX).c, iCanvas.newExp(this.EY).SUB(this.SY).c);
            this.Box.applyMargin(this.SX, this.SY);
            if (this.lineSpace[this.selectdRange] != undefined && this.lines.length == 0) {
                var that = this;
                function setFontSize() {
                    this.applyFontSize(that.H / 15);
                }
                var _Cons = iCanvas.getCONS();
                var _txtCons = _Cons.TXT;
                //process vertical data
                var _lineS = this.lineSpace[this.selectdRange];
                var _labS = this.labs[this.selectdRange];
                for (var i = 0, ci; ci = _lineS[i]; i++) {
                    //line
                    var _line = iCanvas.ctrls.line(this.wrapper, 100, this.lineWidth, 0, ci, this.lineColor);
                    //vertical lab
                    var _txt = iCanvas.ctrls.txt(this.wrapper, 0, 0, 0, 0, "transparent", this.labPrefix + _labS[i]);
                    //config txt properties
                    _txt.attachFontHandler(setFontSize);
                    _txt.applyAlign(_txtCons.ALIGN.LEFT);
                    _txt.applyDisY(-3);
                    _line.appendChild(_txt);
                    this.Box.appendChild(_line);
                    this.lines.push(_line);
                }
                //process horizontal data
                for (var i = 0, ci; ci = this.solts[i]; i++) {
                    var _s = ci.s;
                    var _e = ci.e;
                    var _mp = ci.mp;
                    var _xTxt = iCanvas.ctrls.txt(this.wrapper, 0, 0, _mp.c, this.EY, "red", this.XLabs[i]);
                    _xTxt.setPosition(_Cons.POSITION.ABSOLUTE);
                    _xTxt.attachFontHandler(function () {
                        setFontSize.apply(this);
                        this.applyDisY(this.fontSize + 3);
                    });
                    _xTxt.applyAlign(_txtCons.ALIGN.MIDDLE);
                    this.appendChild(_xTxt);
                }
            }
            if (!_areCtrlsAdded) {
                for (var i = 0, ci; ci = this.ctrls[i]; i++) {
                    this.appendChild(ci);
                }
                _areCtrlsAdded = true;
            }
        }
   );
});
axis.prototype.applyRange = function (max, min) {
    if (this.Range == undefined) {
        this.Range = [{ max: max, min: min }];
    }
    else {
        this.Range.push({ max: max, min: min });
    }
    return this;
}
axis.prototype.setLineCount = function (value) {
    if (typeof value != "number") {
        throw "line count is invalid";
    }
    this.lineCount = value;
    //this.setLineSpace(index == undefined ? 0 : index);
}
axis.prototype.setLineSpace = function (index) {
    if (this.lineCount == undefined) { throw "there is no line assigned" }
    var _ind = index == undefined ? 0 : index;
    if (!this.Range || this.Range[_ind] == undefined) { throw "no valid range selected" };
    //select range
    var _range = this.Range[index];
    //the line space storage
    this.lineSpace[_ind] = ["0"];
    //vertical lab storage
    this.labs[_ind] = [_range.max];
    //return if there is only one line
    if (this.lineCount == 1) { return };
    //space between lines
    var _space = iCanvas.newExp(100 / (this.lineCount - 1)).SUB(this.lineWidth).c;
    //calculate the difference between 2 labs
    var _labDiff = (_range.max - _range.min) / (this.lineCount - 1);
    for (var i = 1; i < this.lineCount; i++) {
        this.lineSpace[_ind].push(_space);
        this.labs[_ind].push(_range.max - i * _labDiff);
    }
}
axis.prototype.setLabSpace = function () {
    if (this.XLabs == undefined) { return; }
    //calculate the solts
    var _soltDiff = iCanvas.newExp(this.EAX).SUB(this.SAX).DIV("{" + this.XLabs.length + "}");
    var _halfSoltDiff = iCanvas.newExp(_soltDiff).DivNum(2);
    this.solts = [];
    var _start = iCanvas.newExp(this.SAX.toString());
    var _end = iCanvas.newExp(_start).ADD(_soltDiff);

    for (var i = 0; i < this.XLabs.length; i++) {
        this.solts.push({ s: _start, e: _end, diff: _soltDiff, mp: iCanvas.newExp(_start).ADD(_halfSoltDiff) });
        if (_end.c == this.EAX) {
            break;
        }
        _start = iCanvas.newExp(_end);
        _end = (i == (this.XLabs.length - 2)) ? iCanvas.newExp(this.EAX.toString()) : (_end.ADD(_soltDiff));
    }
}
axis.prototype.applyConfig = function (config, index) {
    for (var i in config) {
        if (this[i]) {
            this[i] = config[i];
        }
    }
}
axis.prototype.applyXLabs = function (value) {
    if (!this.XLabs) {
        this.XLabs = [value];
    }
    else {
        this.XLabs.push(value);
    }
}
axis.prototype.applyBoundary = function (sax, eax, sx, ex, sy, ey) {
    //start available x, end available x
    //start x, end x
    //start y, end y
    this.SAX = sax;
    this.EAX = eax;
    this.SX = sx == undefined ? 0 : sx;
    this.EX = ex == undefined ? 100 : ex;
    this.SY = sy == undefined ? 0 : sy;
    this.EY = ey == undefined ? 100 : ey;
}
axis.prototype.attachCtrl = function (ctrl) {
    this.ctrls.push(ctrl);
}
axis.prototype.getUnit = function (index) {
    var _ind = index == undefined ? 0 : index;
    var _range = this.Range[_ind];
    var _start = this.SY;
    var _end = this.EY;
    var _volume = iCanvas.newExp(_end).SUB(_start);
    var _unit = _volume.DivNum(_range.max - _range.min);
    this.UnitExps[_ind] = _unit;
    return _unit;
}
axis.prototype.getTopByValue = function (value) {
    var _u = this.UnitExps[this.selectdRange];
    var _max = this.Range[this.selectdRange].max;
    return iCanvas.newExp("{" + (_max - value) + "}").MUL(_u).ADD(this.SY).SUB(this.lineWidth).c;

}
axis.prototype.lineWidth = "1px";
axis.prototype.lineColor = "#7e7e7e";
axis.prototype.labPrefix = "$";


var bars = iCanvas.createNewCtrl(function () {
    this.type = "bars";
    this.singleW = 10;
    var _Cons = iCanvas.getCONS();
    this.setPosition(_Cons.POSITION.ABSOLUTE);
    this.GROUP = iCanvas.ctrls.g(this.wrapper, 100, 100, 0, 0);
    this.GROUP.setPosition(_Cons.POSITION.ABSOLUTE);
    this.appendChild(this.GROUP);
    this.bars = [];
    this.backC = "yellow";
    this.hoverC = "blue";
    this.onRender(function (x, y) {
        this.caculateSelf();
        if (this.bars.length == 0) {
            var _u = this.axis.UnitExps[this.RangeIndex];
            var _seed = 0;
            var _max = this.Range.max;
            var _min = this.Range.min;
            var _exp = iCanvas.newExp;
            for (var i in this.items) {
                var _single = this.items[i];
                var _h = _exp("{" + _single.l + "}").MUL(_u).c;
                var _dx = this.axis.solts[_seed].mp.SUB(_exp(this.singleW).DivNum(2)).c;
                var _dy = this.axis.getTopByValue(_single.s + _single.l);
                var _singleBar = iCanvas.ctrls.rect(this.wrapper, this.singleW, _h, _dx, _dy, this.backC, { obj: this.GROUP, ctrl: "ctrl_g" });
                //deal with events
                _singleBar.Val = _single.s + _single.l;
                var that=this;
                _singleBar.Handlers.RegisterEvent("onclick", function () {
                    alert(this.Val);
                });

                _singleBar.Handlers.RegisterEvent("onmouseover", function () {
                    this.changeColor(that.hoverC);
                });

                _singleBar.Handlers.RegisterEvent("onmouseout", function () {
                    this.changeColor(that.backC);
                });

                _singleBar.setPosition(_Cons.POSITION.ABSOLUTE);
                this.GROUP.appendChild(_singleBar)
                _seed++;

            }
        }
    });
});

bars.prototype.applyAxis = function (axis, cordIndex) {
    this.axis = axis;
    axis.attachCtrl(this);
    //in case of multiple cordinations in the axis, the cordIndex is designed to specify a sertain one
    var _rangeInd = cordIndex == undefined ? 0 : cordIndex;
    this.Range = axis.Range[_rangeInd];
    this.RangeIndex = _rangeInd;
}

bars.prototype.applySingleValue = function (key, length, start) {
    if (!this.items) {
        this.items = {};
    }
    this.items[key] = { s: start == undefined ? 0 : start, l: length };
}

bars.prototype.applyWidth = function (w) {
    this.singleW = w;
}

bars.prototype.applyColors = function (backC, hoverC) {
    this.backC = backC;
    this.hoverC = hoverC ? hoverC : backC;
}


