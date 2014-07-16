var blockRotater = function (id,delay,criterion) {
    this.flag = {
        changed: false
        , delay: delay?delay:0
    }
    this.applyContainer(id);
    this.applyFirstFrm();
    this.initChildren(criterion?criterion:{ tagName: "DIV" });
    this.applyAnimation(this.flag.delay);
    this.start();
}

blockRotater.prototype = {
    Env: {
        aniContxt:new IR.Animation()
    
    }
    ,applyContainer: function (id) {
        this.parent = (typeof id == "string") ? document.getElementById(id) : id;
    }
    , applyFirstFrm: function (index) {
        this.selected = this.firstFrm = index == undefined ? 0 : index;
    }
    , initChildren: function (criterion) {
        if (!this.parent) { throw "no parent node detected" };
        var _counter = 0;
        this.children = [];
        for (var i = 0, ci; ci = this.parent.childNodes[i]; i++) {
            var flag = true;
            for (var j in criterion) {
                if (!ci[j] || ci[j] != criterion[j]) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                if (_counter == this.selected) {
                    _counter = -1;
                }
                else {
                   ci.style.display = "none";
                }
                this.children.push(ci);
            }
        }
    }
    , saveAnimation: function (animation) {
        animationMgr.save(animation);
    }
    , applyAnimation: function (dly) {
        this.animate = this.Env.aniContxt.create({
            from: { angle: 0 },
            to: { angle: 180 },
            easing: "easeInOutElastic",
            delay: dly,
            duration: 3000
        });

        var that = this;
        this.animate.onframe(function (d) {
            that.setContainerAngle(d.angle);
            if ((d.angle < 95 && d.angle > 85) && !that.flag.changed) {
                that.move();
                that.setChildrenRotate(180);
                that.show();
                that.flag.changed = true;
            }
        });

        this.animate.oncompleted(function () {
            that.reset();
            if (this.Next) {
                this.Next.start();
            }
        });

        this.saveAnimation(this.animate);
    }
    ,setTransform: function(dom,str){
        dom.style.transform = str;
        dom.style.webkitTransform = str;
    }

    , move: function () {
        this.selected++;
        if (!this.children[this.selected]) {
            this.selected = this.firstFrm;
        }
    }
    , show: function () {
        for (var i = 0, ci; ci = this.children[i]; i++) {
            ci.style.display = (i == this.selected) ? "block" : "none";
        }
    }
    , setContainerAngle: function (angle) {
        var _str = "perspective(500px) rotateX(" + angle + "deg)";
        this.setTransform(this.parent, _str);
    }
    , setChildrenRotate: function (deg) {
        var _dom = this.children[this.selected];
        var _str = deg == 0 ? "" : "rotate(" + deg + "deg) rotateY(180deg)";
        this.setTransform(_dom, _str);
    }
    , reset: function () {
        this.setTransform(this.parent, "");
        this.setTransform(this.children[this.selected], "");
        this.flag.changed = false;
    }
    , start: function () {
        this.Env.aniContxt.start();
    }
}