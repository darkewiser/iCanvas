/***********
1. 布局部分采用虚拟布局解决方案，在渲染时才计算正确的位置。

***********/




var iCanvas = function () {
    //private assets
    //constants
    var CONS = {
        POSITION: {
            ABSOLUTE: "absolute"
            , RELATIVE: "relative"
        }
        , FLOAT: {
            LEFT: "left"
            , RIGHT: "right"
        }
        , REGEXP: {
            PX: /-?(\d+(\.\d+)?)?(?=\s*px)/
            , NUM: /-?\d+(\.\d+)?/
            , ABSNUM: /\{-?(\d+(\.\d+)?)?\}/
            , OPERATOR: /[^-](\+|\-|\*|\/)/
        }
        , COLORS: {
            BLACK: "black"
            , WHITE: "white"
            , BLUE: "blue"
            , RED: "red"
            , YELLOW: "yellow"
            , GREEN: "green"
            , LINEGRAY: "rgb(230,230,230)"
        }
        , BORDERS: {
            MIN: 1
            , DOUBLE: 2
            , TRIPPLE: 3
            , FOURTIMES: 4
            , FIVETIMES: 5
        }
        , TXT: {
            DECORATION: {
                BOLD: "bold"
                , NORMAL: "normal"
                , UNDERLINE: "underline"
            }
            , DEFAULTFONT: {
                SEGUI: "Segoe UI"
                , SEGUILIGHT: "Segoe UI Light"
                , VERD: "Verdana"
            }
            , DEFAULTSIZE: {
                SMALL: 10
                , NORMAL: 12
                , BIG: 15
                , BIGGER: 18
                , HUGE: 24
            }
            , ALIGN: {
                LEFT: "left"
                , RIGHT: "right"
                , MIDDLE: "middle"
                , CENTER: "center"
            }
        }
    }
    //config
    var Config = {
        TXT: {
            FontFamily: CONS.TXT.DEFAULTFONT.SEGUI
            , FontColor: CONS.COLORS.BLACK
            , DefaultAlign: CONS.TXT.ALIGN.MIDDLE
            , DefaultFontSize: CONS.TXT.DEFAULTSIZE.NORMAL
            , DefaultFontWeight: CONS.TXT.DECORATION.NORMAL
        }
        , LINE: {
            Color: CONS.COLORS.LINEGRAY
            ,Width: CONS.BORDERS.MIN
        }
        , CIRCLE: {
            Color: CONS.COLORS.YELLOW
            , BorderColor: CONS.COLORS.WHITE
            , BorderWidth: CONS.BORDERS.DOUBLE
        }

    }
    //Tools
    var Tools = {
        getOffSet: function (e) {
            //get the absolute position of an element from the top left corner
            var t = e.offsetTop;
            var l = e.offsetLeft;
            while (e = e.offsetParent) {
                t += e.offsetTop;
                l += e.offsetLeft;
            }
            return { dx: l, dy: t };
        }
        , getMouseCord: function (sender, evt) {
            //get Mouse position
            var _offset = getOffSet(sender);
            var _xfix = _offset.dx;
            var _yfix = _offset.dy;
            return evt.pageX || evt.pageY ? { x: evt.pageX - _xfix, y: evt.pageY - _yfix, e: evt } : {
                x: evt.clientX + document.body.scrollLeft - _xfix,
                y: evt.clientY + document.body.scrollTop - _yfix,
                e: evt
            };
        }
        , getTouchCord: function (sender, evt) {
            //get touch position
            var _evt = evt || window.event;
            var _x = _evt.pageX;
            var _y = _evt.pageY;
            if (_evt.targetTouches && _evt.targetTouches.length > 0) {
                _x = _evt.targetTouches[0].pageX;
                _y = _evt.targetTouches[0].pageY;
            }
            var cord = { x: _x, y: _y };
            var _offset = getOffSet(sender);
            var _xfix = _offset.dx;
            var _yfix = _offset.dy;
            return { x: cord.x - _xfix, y: cord.y - _yfix, e: _evt };
        }
        , opCodes: function () {
            var _operators = ["+", "-", "*", "/", "(", ")"];
            var _operators = [
                { v: "+", p: 1 }
                , { v: "-", p: 1 }
                , { v: "*", p: 2 }
                , { v: "/", p: 2 }
                , { v: "(", p: 0 }
                , { v: ")", p: 0 }
            ]

            var _temp = {};
            for (var i = 0, ci; ci = _operators[i]; i++) {
                _temp[ci.v.charCodeAt(0)] = ci;
            }
            return _temp;

        }()
        , RPN: function (string) {
            //Reverse Polish notation
            var _ops = this.opCodes;
            //two stacks one for chars the other for oprators
            var _charStack = [];
            var _opStack = [];
            //save the string value, like "1px"
            var _val = [];
            string.replace(/./g, function (x) {
                if (_ops[x.charCodeAt(0)] == undefined) {
                    _val.push(x);
                }
                else {
                    //save the string
                    if (_val.length > 0) {
                        _charStack.push(_val.join(""));
                        _val = [];
                    }
                    var _op = _ops[x.charCodeAt(0)];
                    //deal with the operators
                    //when "("
                    if (_op.v == "(" || _opStack.length == 0) {
                        _opStack.push(_op);
                        return;
                    }
                    //when close ")"
                    if (_op.v == ")") {
                        (function () {
                            var _temp = _opStack.pop();
                            if (_temp.v == "(") {
                                return;
                            }
                            _charStack.push(_temp.v);
                            arguments.callee.apply(null)
                        })();
                        return;
                    }
                    //when other operators:
                    //when the incoming has higher priority than the one in stack, like * vs. -
                    //then just push the new operator into the stack
                    //otherwise, pop out the one in stack, do the same loop again
                    (function () {
                        var _temp = _opStack.pop();
                        if (_temp == undefined) {
                            _opStack.push(_op);
                            return;
                        }
                        if (_op.p > _temp.p) {
                            _opStack.push(_temp);
                            _opStack.push(_op);
                            return;
                        }
                        _charStack.push(_temp.v);
                        arguments.callee.apply(null)
                    })();
                    return;
                }
            });
            if (_val.length > 0) {
                _charStack.push(_val.join(""));
                _val = [];
            }
            var _remainingOp = _opStack.reverse();
            for (var i = 0, ci; ci = _opStack[i]; i++) {
                _charStack.push(ci.v);
            }
            return _charStack;
        }
        , matchNum: function (value) {
            if (CONS.REGEXP.PX.test(value)) {
                return {
                    v: CONS.REGEXP.PX.exec(value)[0]
                    , unit: "px"
                    , c:value
                }
            }
            if (CONS.REGEXP.ABSNUM.test(value)) {
                return {
                    v: CONS.REGEXP.NUM.exec(value)[0]
                    , unit: "num"
                    , c: value
                }
            }
            return {
                v: CONS.REGEXP.NUM.exec(value)[0]
                , unit: "%"
                , c: value
            }
        }
        , getVolume: function (value, all) {
            var _this = this;
            function process(value, all) {
                var volume = _this.matchNum(value);
                if (volume.unit == "px") {
                    return Number(volume.v);
                }
                if (volume.unit == "num") {
                    return Number(volume.v)
                }
                return Number(CONS.REGEXP.NUM.exec(all)[0]) / 100 * volume.v;
            }
            if (!CONS.REGEXP.OPERATOR.test(value.toString())) {
                return process(value,all);
            }

            var _stack = this.RPN(value.toString());
            var _result = [];
            for (var i = 0, ci; ci = _stack[i]; i++) {
                if (this.opCodes[ci.charCodeAt(0)]) {
                    //operator
                    var _num1 = _result.pop();
                    var _num2 = _result.pop();
                    var _calResult = eval(_num2 + ci + _num1);
                    _result.push(_calResult);
                }
                else {
                    //numbers
                    _result.push(process(ci,all));
                }
            }
            return Number(_result[0]);
        }
    }
    //Expression
    var exp = function (value) {
        var _result = (value instanceof exp) ? value : Tools.matchNum(value);
        for (i in _result) {
            this[i] = _result[i];
        }
    }

    exp.prototype.merge = function (value, operator) {
        var _tempV = (value instanceof exp) ? value : Tools.matchNum(value);
        if ((this.unit == _tempV.unit || (_tempV.unit == "num" && (operator == "*" || operator == "/"))) && _tempV.unit != "text") {
            this.v = eval(this.v + operator + _tempV.v);
            switch (this.unit) {
                case "px":
                    this.c = this.v + "px";
                case "num":
                    this.c = "{"+this.v+"}";
                case "%":
                    this.c = this.v;
            }
            return;
        }
        this.v = "(" + this.c + operator + _tempV.c + ")";
        this.unit = "text";
        this.c = this.v;
    }
    exp.prototype.ADD = function (value) {
        this.merge(value, "+");
        return this;
    }
    exp.prototype.SUB = function (value) {
        this.merge(value, "-");
        return this;
    }
    exp.prototype.MUL = function (value) {
        this.merge(value, "*");
        return this;
    }
    exp.prototype.DIV = function (value) {
        this.merge(value, "/");
        return this;
    }
    exp.prototype.DivNum = function (value) {
        return this.DIV("{" + value + "}");
    }


    //inherit prototype
    function object(o) {
        function F() { };
        F.prototype = o;
        return new F();
    }
    function inheritPrototype(subType, superType) {
        var prototype = object(superType.prototype);
        prototype.constructor = subType;
        subType.prototype = prototype;
    }
    //Observer
    var evtWrapper = function (sender) {
        this._sender = sender;
        this._listeners = [];
    }
    evtWrapper.prototype.attach = function (handler) {
        if (typeof handler == "function") {
            this._listeners.push(handler);
        }
    }
    evtWrapper.prototype.notify = function () {
        for (var i = 0, ci; ci = this._listeners[i]; i++) {
            ci.apply(this._sender, arguments);
        }
    }
    evtWrapper.prototype.clear = function () {
        this._listeners = [];
    }
    evtWrapper.prototype.getHandlers = function () {
        return this._listeners;
    }
    var pointer = function (sx, sy) {
        this.sx = sx == undefined ? 0 : sx;
        this.sy = sy == undefined ? 0 : sy;
        this.cx = this.sx;
        this.cy = this.sy;
        this.lineHeight = 0;
    }

    //event collection
    var evtCollection = function (sender) {
        this.sender = sender;
    }
    evtCollection.prototype.RegisterEvent = function (key, func) {
        if (this[key] == undefined) {
            this[key] = new evtWrapper(this.sender);
        }
        this[key].attach(func);
    }


    //pointer
    pointer.prototype.getChanges = function (ctrl) {
        var _result = ctrl.caculateSelf();
        return {
            x: _result.w + _result.l
            , y: _result.h + _result.t
        }
    }
    pointer.prototype.mx = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cx = this.cx + _dis.x;
        
        var _r = ctrl.caculateSelf();
        this.lineHeight = Math.max(this.lineHeight, _r.h + _r.t);
    }
    pointer.prototype.my = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cy = this.cy + _dis.y;
    }
    pointer.prototype.nextLine = function () {
        this.cx = this.sx;
        this.cy += this.lineHeight;
        this.lineHeight = 0;
    }
    pointer.prototype.mxy = function (ctrl) {
        var _dis = this.getChanges(ctrl);
        this.cx = this.cx + _dis.x;
        this.cy = this.cy + _dis.y;
    }
    pointer.prototype.reset = function () {
        this.cx = this.sx;
        this.cy = this.sy;
    }
    pointer.prototype.moveto = function (x, y) {
        this.cx = x;
        this.cy = y;
    }
    pointer.prototype.move = function (x, y) {
        this.cx += x;
        this.cy += y;
    }
    //base ctrl
    var ctrl = function (wrapper, w, h, l, t, c, txt) {
        this.applyWrapper(wrapper);
        this.applyWH(w, h);
        this.applyMargin(l, t);
        this.applyColor(c);
        this.applyTxt(txt);
        this._renderHandler = new evtWrapper(this);
        this.childNodes = [];
        this.renderReady = true;

        //Bind events
        this.Handlers = new evtCollection(this);
    }
    ctrl.prototype.onRender = function (func) {
        this._renderHandler.attach(func);
    }
    //render ctrl
    ctrl.prototype.render = function (x, y) {
        if (!this.wrapper) { return;}
        this._renderHandler.notify(x, y);
        this.X = x;
        this.Y = y;
    }
    ctrl.prototype.applyWH = function (w, h) {
        this.w = w;
        this.h = h;
    }
    ctrl.prototype.applyMargin = function (l, t) {
        this.l = l;
        this.t = t;
    }
    //color management
    ctrl.prototype.applyColor = function (c) {
        this.c = c;
    }
    ctrl.prototype.applyFontColor = function (c) {
        this.fontColor = c;
    }
    //attach wrapper
    ctrl.prototype.applyWrapper = function (wrapper) {
        this.wrapper = wrapper;
    }
    //text management
    ctrl.prototype.applyTxt = function (txt) {
        this.txt = txt;
    }
    ctrl.prototype.applyFontSize = function (size) {
        this.fontSize = size == undefined ? Config.TXT.DefaultFontSize : size;
    }
    ctrl.prototype.setZ = function (value) {
        this.zIndex = value;
    }
    //deal with position & Float
    ctrl.prototype.setPosition = function (value) {
        var _v = CONS.POSITION[value.toUpperCase()];
        if (_v !== undefined) {
            this.position = _v;
        }
    }
    ctrl.prototype.setFloat = function (value) {
        var _v = CONS.FLOAT[value.toUpperCase()];
        if (_v !== undefined) {
            this.float = _v;
        }
    }
    //deal with parent/children hierachy
    ctrl.prototype.appendChild = function (tempCtrl) {
        if (!this.childNodes) {
            this.childNodes = [tempCtrl];
        }
        else {
            this.childNodes.push(tempCtrl);
        }
        tempCtrl.parentNode = this;
    }
    ctrl.prototype.setParent = function (tempCtrl) {
        tempCtrl.appendChild(this);
    }
    //caculate self width/height/length
    ctrl.prototype.caculateSelf = function () {
        var _W = this.parentNode ? Number(Tools.matchNum(this.parentNode.W).v) : Number(Tools.matchNum(this.wrapper.w).v);
        var _H = this.parentNode ? Number(Tools.matchNum(this.parentNode.H).v) : Number(Tools.matchNum(this.wrapper.h).v);
        var _h = Tools.getVolume(this.h, _H);
        var _w = Tools.getVolume(this.w, _W);
        var _l = Tools.getVolume(this.l, _W);
        var _t = Tools.getVolume(this.t, _H);
        this.W = _w;
        this.H = _h;
        this.L = _l;
        this.T = _t;
        return {
            w: _w
            , h: _h
            , l: _l
            , t: _t
        }
    }
    //render all
    ctrl.prototype.renderAll = function (x, y) {
        //在此的render参数为绝对值，非相对
        var _pointer = new pointer(x, y);
        this.render(x, y)
        var _h = this.H;
        var _w = this.W;
        for (var i = 0, ci; ci = this.childNodes[i]; i++) {
            //abosulute elements, start from the every beginning of the parent node
            //and current node will not impact the layout
            if (ci.position == CONS.POSITION.ABSOLUTE) {
                ci.renderAll(_pointer.sx+this.L, _pointer.sy+this.T);
                continue;
            }
            //otherwise, render based on element positions
            //float left
            if (ci.float == CONS.FLOAT.LEFT) {
                //validae width
                var _wh = _pointer.getChanges(ci);

                if (_pointer.cx + _wh.x <= _w) {
                    //width not exceeded, render all
                    ci.renderAll(_pointer.cx, _pointer.cy);
                    _pointer.mx(ci);
                    continue;
                }
            }
            //skip to another line
            //currently, 2 situations will be handled here
            //1. no float element
            //2. insufficient width
            _pointer.nextLine();
            _pointer.move(this.L, i==0?this.T:0);
            ci.renderAll(_pointer.cx, _pointer.cy);
            _pointer.mx(ci);
           
        }
    }
    //extend the base ctrl
    function NewCtrl(func) {
        var _temp = function (wrapper, w, h, l, t, c, txt,pDom) {
            ctrl.apply(this, arguments);
            func.call(this, pDom)
        }
        inheritPrototype(_temp, ctrl);
        return _temp;
    }
    var VBOX = NewCtrl(function () {
        this.type = "vbox";
        this.onRender(
             function (x, y) {
                 this.caculateSelf();
             }
        );
    });
    var RECT = NewCtrl(function (pDom) {
        this.type = "rect";
        this.onRender(
           function (x, y) {
               this.wrapper.rect(this, "ctrl_rect", x, y,pDom);
           }
       );
    });
    RECT.prototype.changeColor = function (color) {
        if (this.ctrl_rect) {
            this.c = color;
            this.ctrl_rect.setAttribute("fill", this.c);
        }
    }

    var TESTRECT = NewCtrl(function (pDom) {
        this.type = "testrect";
        this.onRender(
           function (x, y) {
               this.wrapper.rect(this, "ctrl_rect", x, y, pDom);
           }
       );
    });

    var TXT = NewCtrl(function (pDom) {
        this.type = "txt";
        this.fontHandler = new evtWrapper(this);
        this.onRender(
            function (x, y) {
                if (this.fontHandler._listeners.length == 0) {
                    this.applyFontSize(parseInt(this.parentNode.H * 0.7));
                }
                else {
                    this.fontHandler.notify();
                }
                this.wrapper.text(this, "ctrl_txt", x, y,pDom);
                this.ctrl_txt.textContent = this.txt;
                this.ctrl_txt.style.cursor = "pointer";
            }
        );
    });
    TXT.prototype.applyFontFamily = function (value) {
        this.fontFamily = value;
    }
    TXT.prototype.applyAlign = function (value) {
        this.align = value;
    }
    TXT.prototype.applyDisY = function (value) {
        this.disY = value;
    }
    TXT.prototype.attachFontHandler = function (func) {
        this.fontHandler.attach(func);
    }
    var LINE = NewCtrl(function (pDom) {
        this.type = "line";
        this.onRender(
            function (x, y) {
                this.wrapper.line(this, "ctrl_line", x, y, this.delta, pDom);
            }
        );
    });
    LINE.prototype.setDelta = function (value) {
        this.delta = value;
    }

    var G = NewCtrl(function (pDom) {
        this.type = "g";
        this.onRender(
           function (x, y) {
               this.wrapper.g(this, "ctrl_g", pDom);
           }
       );
    });

    function GetOrCreateDom(ctrl, id,key,parent){
        var _dom = ctrl[id];
        if (!_dom) {
            _dom = document.createElementNS('http://www.w3.org/2000/svg', key);
            parent.appendChild(_dom);
            ctrl[id] = _dom;
            for(var i in ctrl.Handlers){
                //if the event can be recognized by the dom and it should be initialed with "on"
                if (i.indexOf("on") > -1 && (typeof _dom[i] == "object" || typeof _dom[i] == "function")) {
                    (function (evtName) {
                        _dom[evtName] = function (e) {
                            var _evt = e || window.event;
                            ctrl.Handlers[evtName].notify(_evt);
                        }
                    })(i);
                }
            }
        }
        return _dom;
    }


    var SVGWrapper = function (id) {
        var _svg = document.getElementById(id);
        if (!_svg) { throw "Invalid SVG container" };
        this.svg = _svg;
        this.w = _svg.clientWidth;
        this.h = _svg.clientHeight;
        this.CtrlDomMap = [];
    }
    SVGWrapper.prototype.initRoot = function (ctrl) {
        this.root = ctrl;
    }
    SVGWrapper.prototype.render = function () {
        if (!this.root) {
            return;
        }
        this.root.renderAll(0, 0);
    }
    SVGWrapper.prototype.rect = function (ctrl, id, x, y,pDom) {
        var _dom = GetOrCreateDom(ctrl, id, "rect", pDom? pDom.obj[pDom.ctrl]:this.svg);
        var _result = ctrl.caculateSelf();
        _dom.setAttribute("height", _result.h);
        _dom.setAttribute("width", _result.w);
        _dom.setAttribute("x", x + _result.l);
        _dom.setAttribute("y", y + _result.t);
        _dom.setAttribute("fill", ctrl.c);
    }
    SVGWrapper.prototype.text = function (ctrl, id, x, y,pDom) {
        var _dom = GetOrCreateDom(ctrl, id, "text", pDom ? pDom.obj[pDom.ctrl] : this.svg);
        var _result = ctrl.caculateSelf();
        var _fontSize = ctrl.fontSize == undefined ? Config.TXT.DefaultFontSize : ctrl.fontSize;
        var _fontFamily = ctrl.fontFamily ? ctrl.fontFamily : Config.TXT.FontFamily;
        var _align = ctrl.align ? ctrl.align : Config.TXT.DefaultAlign;
        var _fontColor = ctrl.fontColor ? ctrl.fontColor : Config.TXT.FontColor;
        var _bold = ctrl.bold ? ctrl.bold : Config.TXT.DefaultFontWeight;
        var _dy = ctrl.disY ? ctrl.disY : (parseInt(_fontSize) / 2 - 2);
        _dom.setAttribute("x", x + _result.l);
        _dom.setAttribute("y", y + _result.t);
        _dom.setAttribute("font-size", _fontSize);
        _dom.setAttribute("font-family", _fontFamily);
        _dom.setAttribute("font-weight", _bold);
        _dom.setAttribute("text-anchor", _align);
        _dom.setAttribute("dy", _dy);
        _dom.setAttribute("fill", _fontColor);
    }
    SVGWrapper.prototype.line = function (ctrl, id, x, y, delta, pDom) {
        //using a delta angle to describe the line
        var _dom = GetOrCreateDom(ctrl, id, "line", pDom ? pDom.obj[pDom.ctrl] : this.svg);
        var _result = ctrl.caculateSelf();
        var _color = ctrl.c ? ctrl.c : Config.LINE.Color;
        var _dx = _result.w * Math.cos(delta == undefined ? 0 : (delta / 180 * Math.PI));
        var _dy = _result.w * Math.sin(delta == undefined ? 0 : (delta / 180 * Math.PI));
        _dom.setAttribute("x1", x + _result.l);
        _dom.setAttribute("y1", y + _result.t);
        _dom.setAttribute("x2", x + _result.l+_dx);
        _dom.setAttribute("y2", y + _result.t + _dy);
        _dom.style.stroke = _color;
        _dom.style.strokeWidth=_result.h;
    }
    SVGWrapper.prototype.g = function (ctrl, id, pDom) {
        var _dom = GetOrCreateDom(ctrl, id, "g", pDom ? pDom.obj[pDom.ctrl] : this.svg);
        ctrl.caculateSelf();
    }

    SVGWrapper.prototype.circle = function (ctrl, id, x, y, pDom) {
        var _dom = ctrl[id];
        if (!_dom) {
            _dom = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            if (pDom) {
                pDom.obj[pDom.ctrl].appendChild(_dom);
            }
            else {
                this.svg.appendChild(_dom);
            }
            ctrl[id] = _dom;
        }
        var _result = ctrl.caculateSelf();
        var _color = ctrl.c ? ctrl.c : Config.CIRCLE.Color;
        var _borderColor = ctrl.borderC ? ctrl.borderC : Config.CIRCLE.BorderColor;
        var _borderWidth = ctrl.borderW ? ctrl.borderW : Config.CIRCLE.BorderWidth;
        _dom.setAttribute("r", Math.max(_result.w, _result.h));
        _dom.setAttribute("cx", x + _result.l);
        _dom.setAttribute("cy", y + _result.t);
        _dom.setAttribute("fill", _color);
        _dom.setAttribute("stroke", _borderColor);
        _dom.setAttribute("stroke-width", _borderWidth);
    }




    SVGWrapper.prototype.changeWH = function (w,h) {
        var _rW = Tools.matchNum(w);
        var _rH = Tools.matchNum(h);

        if (_rW.unit == "px") {
            this.w = _rW.v;
        }
        else {
            this.w = (1 + _rW.v / 100) * this.w;
        }
        this.svg.style.width = this.w + "px";


        if (_rH.unit == "px") {
            this.h = _rH.v;
        }
        else {
            this.h = (1 + _rH.v / 100) * this.h;
        }
        this.svg.style.height = this.h + "px";


    }

    return {
        getBaseClass: function () {
            return ctrl;
        }
        , extPrototype: function (subType, superType) {
            inheritPrototype.apply(null, arguments);
        }
        , createWrapper: function (id) {
            return new SVGWrapper(id);
        }
        , createNewCtrl: NewCtrl
        , ctrls: {
            rect: function (wrapper, w, h, l, t, c, pDom) {
                return new RECT(wrapper, w, h, l, t, c, null, pDom);
            }
            , testRect: function (wrapper, w, h, l, t, c, pDom) {
                return new TESTRECT(wrapper, w, h, l, t, c, null, pDom);
            }
            , txt: function (wrapper, w, h, l, t, c, txt, pDom) {
                return new TXT(wrapper, w, h, l, t, c, txt, pDom);
            }
            , line: function (wrapper, w, h, l, t, c, delta, txt, pDom) {
                var _temp = new LINE(wrapper, w, h, l, t, c, txt, pDom);
                _temp.setDelta(delta);
                return _temp
            }
            , vbox: function (wrapper, w, h, l, t, pDom) {
                return new VBOX(wrapper, w, h, l, t,null,null, pDom);
            }
            , g: function (wrapper, w, h, l, t, pDom) {
                return new G(wrapper, w, h, l, t,null,null, pDom);
            }
        }
        , newExp: function (value) {
            return new exp(value);
        }
        , getTools: function () {
            return Tools;
        }
        , getCONS: function () {
            return CONS;
        }
        , getTxtCONS: function () {
            return CONS.TXT;
        }
    }
}();
