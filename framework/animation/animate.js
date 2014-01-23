define(function (require) {

    var tools = require("../tools/util"),
        AnimateCore = require("./core"),
        Timer = require("../tools/timer"),
        log = require("../tools/log"),
        Obsever = require("../tools/observer");





    function Animate() {
        this._chinedAnimates = [];
        this._animateInstance = undefined;
        this.loop = false;
    }


    Animate.prototype = function () {
        function createAnimate(segment, defauls) {
            defauls = defauls || {};

            var _segmnet = {
                duration: 1000,
                from: {},
                to: {},
                delay: 0,
                loop: false,
                repeat: 1,
                easing: "",
                onstep: null,
                oncompleted: null
            }, aniCore, result;
            result = tools.extend({}, defauls);
            segment = tools.extend(result, segment);
            segment = tools.extend(_segmnet, segment || {});
            aniCore = new AnimateCore(segment.duration);
            aniCore.from(segment.from)
                          .to(segment.to)
                          .onstep(segment.onstep)
                          .oncompleted(segment.oncompleted)
                          .repeat(segment.repeat)
                          .loop(segment.loop)
                          .delay(segment.delay)
                          .easing(segment.easing)
                          .start();

            return aniCore;
        }

        return {
            createChinedAnimate: function (segments, defaults) {
                var i = 0, ci,
                    animate,
                    len;
                if (tools.isArray(segments)) {
                    for (; ci = segments[i]; i++) {
                        len = this._chinedAnimates.length
                        animate = createAnimate(ci, defaults);
                        if (len >= 1) {
                            this._chinedAnimates[len - 1].chainedAnimate(animate);
                        }
                        this._chinedAnimates.push(animate);
                    }
                }
                else {
                    animate = createAnimate(segments, defaults);
                    this._chinedAnimates.push(animate);
                }
                return this._chinedAnimates;
            },
            getAnimates:function(){
                return this._chinedAnimates;
            },
            getFirstAnimate: function () {
                if (this._animateInstance) return this._animateInstance;

                if (tools.isArray(this._chinedAnimates) && this._chinedAnimates.length > 0) {
                    this._animateInstance = this._chinedAnimates[0];
                    return this._animateInstance;
                }

            },
            update: function () {
                this.getFirstAnimate().update(Date.now());
                if (this.loop && this.isAnimateCompleted()) {
                    this.restart();
                }
            },
            active: function () {
                var obj = this.getFirstAnimate();
                obj.active();
                return this;
            },
            pause: function () {
                this.getFirstAnimate().pause();
            },
            restart: function () {
                this.getFirstAnimate().restartChainedAnimate();
            },
            isAnimateCompleted: function () {
                return this.getFirstAnimate().isChainedAnimateCompleted();
            },
            setLoop: function (flag) {
                this.loop = flag;
            }


        }



    }();



    return Animate;
});