var listModel = function (data,pageCount) {
    this.load(data, pageCount);
}

listModel.prototype.CONS = {
    pageCount:5
}

listModel.prototype.setPageCount = function (pageCount) {
    this.PC = pageCount == undefined ? this.CONS.pageCount : pageCount;
    this.curP = 0;
}

listModel.prototype.paging = function (data) {
    if (!data) {
        return;
    }
    this.pages = [];
    for (var i = 0, ci; ci = data[i]; i++) {
        var _page = Math.floor(i / this.PC);
        if (!this.pages[_page]) {
            this.pages[_page] = [ci];
        }
        else {
            this.pages[_page].push(ci);
        }
    }
}

listModel.prototype.load = function (data, pageCount) {
    this.setPageCount(pageCount);
    this.paging(data);
}

listModel.prototype.reload = function (data, pageCount) {
    this.load(data, pageCount);
    this.newLoaded = true;
}

listModel.prototype.next = function () {
    this.curP++;
    if (!this.pages[this.curP]) {
        this.curP = 0;
    }
}

listModel.prototype.pre = function () {
    this.curP--;
    if (this.curP < 0) {
        this.curP = this.pages.length - 1;
    }
}

listModel.prototype.getCurPageData = function () {
    return this.pages[this.curP];
}

var listView = function (targetid, sourceid, rows) {
    this.getParent(targetid, sourceid);
    this.createDoms(rows);
}

listView.prototype.getParent = function (targetid, sourceid) {
    this.parent = (typeof targetid == "string") ? document.getElementById(targetid) : targetid;
    this.source = (typeof sourceid == "string") ? document.getElementById(sourceid) : sourceid;
}

listView.prototype.createDoms = function (count) {
    this.parent.innerHTML = "";
    this.doms = [];
    for (var i = 0; i < count; i++) {
        var _li = document.createElement("LI");
        this.doms.push({ li: _li});
        this.parent.appendChild(_li);
    }
}

listView.prototype.updateRow = function (index, sampleDom) {
    var _rowView = this.doms[index].li;
    _rowView.innerHTML = sampleDom ? sampleDom.innerHTML : "";
}

listView.prototype.setTransform = function (dom, str, orgin) {
    dom.style.transform = str;
    dom.style.webkitTransform = str;
    if (orgin != undefined) {
        dom.style.transformOrigin = orgin;
        dom.style.webkitTransformOrigin = orgin;
    }
}

listView.prototype.getDomList = function (criterion) {
    var _sourceDom = this.source;
    var _list = [];
    for (var i = 0, ci; ci = _sourceDom.childNodes[i]; i++) {
        var flag = true;
        for (var j in criterion) {
            if (!ci[j] || ci[j] != criterion[j]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            _list.push(ci);
        }
    }
    return _list;
}

var listCtrl = function (model,view) {
    this.model = model;
    this.view = view;
}

listCtrl.prototype.ENV={
    aniContxt:new IR.Animation()
}

listCtrl.prototype.next = function () {
    this.model.next();
}

listCtrl.prototype.pre = function () {
    this.model.pre();
}

listCtrl.prototype.updateSingleRow = function (rowIndex) {
    var data = this.model.getCurPageData(rowIndex);
    var rowData = data[rowIndex];
    this.view.updateRow(rowIndex, rowData);
}

listCtrl.prototype.updatePage = function () {
    for (var i = 0; i < this.model.PC; i++) {
        this.updateSingleRow(i);
    }
}

listCtrl.prototype.createAnimation = function (delay, duration, easing) {
    var _easing = easing ? easing : "easeInOutQuad";
    var _delay = delay == undefined ? 0 : delay;
    var _duration = duration == undefined ? 300 : duration;
    var animate = this.ENV.aniContxt.create({
        from: { angle: 0 }
           , to: { angle: 180 }
           , easing: _easing
           , delay: _delay
           , duration: _duration
    });
    return animate;
}

listCtrl.prototype.saveAnimation = function (animation) {
    if (!this.firstAnimation) {
        this.firstAnimation = animation;
        this.lastAnimation = animation;
        return;
    }
    this.lastAnimation.Next = animation;
    this.lastAnimation = animation;
}

listCtrl.prototype.recordAnimationData = function () {
    this.first = this.firstAnimation;
    this.last = this.lastAnimation;
}

listCtrl.prototype.bindAnimationToDom=function(domIndex,delay, duration, easing){
    var _animation=this.createAnimation(delay, duration, easing);
    var _changed = false;
    var that = this;
    var _row = this.view.doms[domIndex];
    _animation.onframe(function(d){
        var deg = d.angle;
        var _str = "perspective(500px) rotate(180deg) rotateY(180deg) rotateX(" + deg + "deg)";
        that.view.setTransform(_row.li, _str, "0% 15px");
        if (!_changed && deg > 90) {
            //第一个元素
            if (this === that.first) {
                if (that.model.newLoaded) {
                    that.model.newLoaded = false;
                }
                else {
                    that.model.next();
                }
            }
            that.updateSingleRow(domIndex);
            _changed = true;
        }
    });

    _animation.oncompleted(function () {
        that.view.setTransform(_row.li, "");
        _changed = false;
        if (this === that.last) {
            var _stamp = that.getStamp();
            if (that.timeStamp !=_stamp) {
                that.reload();
                that.timeStamp = _stamp;
            }
        }
        if (this.Next) {
            this.Next.start();
        }
    });
    this.saveAnimation(_animation);
}

listCtrl.prototype.initAnimations = function () {
    for (var i = 0, ci; ci = this.view.doms[i]; i++) {
        this.bindAnimationToDom(i, i == 0 ? this.singleDelay : undefined);
    }
    this.recordAnimationData();
    this.saveAnimation(this.firstAnimation);
}

listCtrl.prototype.init = function (singleDelay) {
    this.singleDelay = singleDelay == undefined ? 1000 : singleDelay;
    this.updatePage();
    this.initAnimations();
}

listCtrl.prototype.start = function () {
    this.firstAnimation.start();
    this.ENV.aniContxt.start();
}

listCtrl.prototype.load = function (criterion) {
    var _criterion = criterion ? criterion : { tagName: "LI" };
    this.loadingCriterion = _criterion;
    var _data = this.view.getDomList(_criterion);
    this.model.load(_data);
}

listCtrl.prototype.reload = function () {
    var _criterion = this.loadingCriterion ? { tagName: "LI" } : this.loadingCriterion;
    var _data = this.view.getDomList(_criterion);
    this.model.reload(_data);
}

listCtrl.prototype.getStamp=function(){
    return this.view.source.getAttribute("timeStamp");
}

//targetId the id of the dom that will be renderred.
//sourceId the id of the dom that will provide the data.
//criterion what kinds of dom elements should be filtered from the source dom
var mvcHandler = function (targetId, sourceId, pageCount, criterion) {
    this.M = new listModel(pageCount);
    this.V = new listView(targetId, sourceId, this.M.PC);
    this.C = new listCtrl(this.M, this.V);
    this.C.load(criterion);
}

mvcHandler.prototype.init = function (delay) {
    this.C.init(delay);
    this.C.start();
}




