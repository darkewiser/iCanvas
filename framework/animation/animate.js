/*
 *
 * @author Mingli (v-minggu@microsoft.com \ guomilo@gmail.com)
 *
 * createChinedAnimate:     创建动画或链式动画
 * getAnimates:             获取所有的AnimateCore对象，便于对每个动画进行控制。具体参考core.js 
 * active:                  继续暂停的动画
 * pause:                   暂停动画
 * restart                  重新开始执行动画
 * isAnimateCompleted       动画是否完成
 * setRepeat                是否重复执行动画
 * completedRunAnimate      添加动画完成后所要运行的动画（链表动画）
 * isInChained              是否是在链表动画中
 */

define(function (require) {

    var tools = require("../tools/util"),
        AnimateCore = require("./core"),
        Timer = require("../tools/timer"),
        log = require("../tools/log"),
        Obsever = require("../tools/observer");

    function Animate() {

        /* 存储生成的所有链式AnimateCore对像*/
        this._chainedAnimates = [];
        /* 是否是某个动画的链表动画*/
        this.inChained = false;
        /* 当前动画的上级动画*/
        this.parentAnimate = undefined;
        /* 是否重复执行动画*/
        this.repeat = false;
        /* 唯一识别码*/
        this._guid = tools.newId();
    }


    Animate.prototype = function () {

        /*
         * 创建AnimateCore对象
         *
         * @param:{segment}            
            segmnet = {
                duration: 1000,          //动画的生命周期
                from: {},                //初始变化属性       
                to: {},                  //目标变化属性 
                delay: 0,                //动画的延迟执行时间
                loop: false,             //是否循环执行
                repeat: 1,               //是否重复执行
                easing: "",              //缓动函数
                onstep: null,            //动画变化过程中的更新操作
                oncompleted: null        //动画完成后的回调
            }
         *
         *
         * @param:{defauls} 同 {segment}  
        */
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
            createChainedAnimate1: function (segments, defaults) {
                var i = 0, ci,
                    animate,
                    len;
                if (tools.isArray(segments)) {
                    for (; ci = segments[i]; i++) {
                        len = this._chainedAnimates.length
                        animate = createAnimate(ci, defaults);
                        if (len >= 1) {
                            this._chainedAnimates[len - 1].chainedAnimate(animate);
                        }
                        this._chainedAnimates.push(animate);
                    }
                }
                else {
                    animate = createAnimate(segments, defaults);
                    this._chainedAnimates.push(animate);
                }
                return this._chainedAnimates;
            },
            /*
             * 创建链式动画             *
             * 
             * @param [{segment},{segment},{segment}] 参见:createAnimate参数说明
             * @param {defaults} 参见:createAnimate参数说明
             *
            */
            createChainedAnimate: function (segments, defaults) {
                var ci,
                    animate,
                    len;

                (function (_segments, _defaults) {
                    if (tools.isArray(_segments)) {
                        for (var i = 0; ci = _segments[i]; i++) {
                            arguments.callee.call(this, ci, _defaults);
                        }
                    }
                    else {
                        animate = createAnimate(_segments, _defaults);
                        len = this._chainedAnimates.length
                        if (len >= 1) {
                            this._chainedAnimates[len - 1].chainedAnimate(animate);
                        }

                        this._chainedAnimates.push(animate);
                    }

                }).call(this, segments, defaults);

                return this._chainedAnimates;
            },

            /*
            * 创建动画           
            * 
            * @param [{segment}] 参见:createAnimate参数说明
            * @param {defaults} 参见:createAnimate参数说明
            *
            */
            createAnimate: function (segments, defaults) {
                var ci, animate;
                (function (_segments, _defaults) {
                    if (tools.isArray(_segments)) {
                        for (var i = 0; ci = _segments[i]; i++) {
                            arguments.callee.call(this, ci, _defaults);
                        }
                    }
                    else {
                        animate = createAnimate(_segments, _defaults);
                        this._chainedAnimates.push(animate);
                    }

                }).call(this, segments, defaults);

                return this._animates;
            },
            /*
             * 创建动画或链式动画   
             * 
             * @param [{segment},{segment},{segment}] 长度大于1，生成链表动画
             * @param {defaults} 参见:createAnimate参数说明
             *
            */
            create: function (segments, defaults) {
                var len;
                if (tools.isArray(segments)) {
                    len = segments.length;
                    if (len > 1) {
                        return this.createChainedAnimate(segments, defaults);
                    }
                    else if (len == 1) {
                        return this.createAnimate(segments, defaults);
                    }
                }
                else {
                    this.createAnimate(segments, defaults);
                }
            },

            getAnimates: function () {
                return this._chainedAnimates;
            },
            getFirstAnimate: function () {
                if (this._animateInstance) return this._animateInstance;

                if (tools.isArray(this._chainedAnimates) && this._chainedAnimates.length > 0) {
                    this._animateInstance = this._chainedAnimates[0];
                    return this._animateInstance;
                }
                else {
                    log.write("Error:'_chainedAnimates' isn't Array or its length is less than or equal to zero "
                              , "Path:animate.js"
                              , "function:addChaineAnimate");
                }
            },
            getLastAnimate: function () {
                if (tools.isArray(this._chainedAnimates) && this._chainedAnimates.length > 0) {
                    var len = this._chainedAnimates.length;
                    return this._chainedAnimates[len - 1];
                }
                else {
                    log.write("Error:'_chainedAnimates' isn't Array or its length is less than or equal to zero "
                              , "Path:animate.js"
                              , "function:addChaineAnimate");
                }
            },
            update: function () {
                this.getFirstAnimate().update(Date.now());
                if (this.repeat && this.isAnimateCompleted()) {
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
            setRepeat: function (flag) {
                this.repeat = flag;
            },
            isInChained: function () {
                return this.inChained;
            },
            /*
             * 添加动画完成后所要运行的动画（链表动画）
            */
            completedRunAnimate: function () {
                var aniCore, animate;

                /*
                 * 检测是否对animate产生循环引用
                */
                function isLoopReference(animate) {
                    if (tools.isUndefined(this.parentAnimate)) {
                        return false;
                    }
                    else if (this.parentAnimate._guid == animate._guid) {
                        return true;
                    }
                    else {
                        return arguments.callee.call(this.parentAnimate, animate);
                    }
                }

                for (var i = 0; i < arguments.length; i++) {
                    animate = arguments[i];
                    if (animate instanceof Animate && this._guid != animate._guid && !isLoopReference.call(this, animate)) {
                        aniCore = animate.getFirstAnimate();
                        animate.inChained = true;
                        animate.parentAnimate = this;
                    }
                    else {
                        log.write("Error: 1: variable 'animate' is not an instance of 'Animate'",
                                  "       2: Object's '_guid' proprety is same",
                                  "       3: Loop Reference"
                                  , "Path:animate.js"
                                  , "function:completedRunAnimate");
                    }
                    this.getLastAnimate().chainedAnimate(aniCore);
                }
            }

        }
    }();



    return Animate;
});