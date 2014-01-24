define(function (require) {
    var tools = require("../tools/util"),
        Timer = require("../tools/timer"),
        log = require("../tools/log"),
        Animate = require("./animate");


    function AnimateContext() {
        return this.init();
    }
    var ACPrototype = AnimateContext.prototype;

    ACPrototype.init = function () {
        this.timer = new Timer();
        this.animates = [];
        this.runAnimates = [];
    }
    ACPrototype.getTimer = function () {
        return this.timer;
    }
    ACPrototype.startTimer = function () {
        this.timer.start(tools.bind(this.update, this));
    }
    ACPrototype.update = function () {
        for (var i = 0, ci; ci = this.animates[i]; i++) {
            if (!ci.isInChained()) {
                ci.update();
            }
        }
    }
    ACPrototype.stopTimer = function () {
        this.timer.stop();
    }
    ACPrototype.active = function () {
        for (var i = 0, ci; ci = this.animates[i]; i++) {
            this.animates[i].active();
        }
    }
    ACPrototype.pause = function () {
        for (var i = 0, ci; ci = this.animates[i]; i++) {
            this.animates[i].pause();
        }
    }
    /*
     * 根据segments中对象的count创建不同的动画，count>1创建的是个链表动画
     *
     *
     *
    */
    ACPrototype.createAnimate = function (segments, defauls, loop) {
        var animate = new Animate(), id, tmpSegments;

        if (tools.isArray(segments) && segments.length > 0) {          

            id = this.animates.length;
            animate.create(segments, defauls,loop);
            animate.id = id;

            this.animates.push(animate);
        }
        return animate;
    }

    ACPrototype.restart = function () {
        for (var i = 0, ci; ci = this.animates[i]; i++) {
            this.animates[i].restart();
        }
    }

    return AnimateContext;

});