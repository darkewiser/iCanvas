/*
 * 动画的核心处理类
 *
 * @author Mingli (v-minggu@microsoft.com \ guomilo@gmail.com)
 *
 * @describe：动画如果设置了loop或着无限重复的话将导致链表动画不能正常执行，
 *           设置了动画的repeat的次数后，链表动画会在重复完成后开始执行。
 *
 * 
 * from:                     指定属性的初始值
 * to:                       指定属性的目标值
 * start:                    启动动画
 * restart                   重新启动动画（包括链表动画）
 * stop                      停止动画
 * getAnimateStates          获取动画的状态
 * pause                     暂停动画
 * active                    继续暂停的动画
 * delay                     设置动画延迟执行的时间
 * onstep                    动画运行中回调函数
 * oncompleted               动画完成的回调函数
 * onstart                   动画开始时回调函数
 * update                    更新动画
 * easing                    添加缓动函数
 * isCompleted               动画是否完成。
 *
 *
 * example:
 var testDom=document.getElementById("test");
 var animate1=new AnimateCore(3000);
 animate1.from({x:0,y:0})
 .to({x:100,y:100})
 .delay(1000)
 .easing("linear")
 .start();
 animate1.onstep(function(data){
    testDom.style.width=data.x+"px";
    testDom.style.height=data.y+"px";
 });

 animate1.oncompleted(function(){
    alert("Completed");
 });

 var animate2=new AnimateCore(2000);
 //TODO: animate2的初始化同animate1.

 animate1.chainedAnimate(animate2);

 var interval;

 +function(){
    interval = requestAnimationFrame(arguments.callee);
    animate1.update(Date.now());
    if(animate1.getAnimateStates=="3"&&animate2.getAnimateStates=="3"){
        cancelAnimationFrame(interval);
    }
 }();
 *
 */
define(function (require) {
    var tools = require("../tools/util"),
        observer = require("../tools/observer"),
        log = require("../tools/log"),
        easingObj = require("../animation/easing");

    if (!"now" in Date) {
        Date.now = function () {
            return new Date().getTime();
        }
    }
    /*
     * 动画运行的状态
     * READY:动画开始前的状态
     * START:动画开始
     * RUNNING:动画正在运行
     * COMPLETED:动画完成
     * PAUSE:动画暂停
     * STOP:动画停止
     */
    var animateStates = {
        READY: "0",
        START: "1",
        RUNNING: "2",
        PAUSE: "3",
        COMPLETETED: "4",
        STOP: "5"

    };

    function AnimateCore(/* 生命周期,单位ms */duration) {

        var
        /*动画的生命周期*/
            _duration = duration,

        /*动画延迟执行的时间*/
            _delayTime = 0,

        /*开始时间*/
            _startTime = 0,

        /*Step事件的状态flag*/
            _isUpdateStep = false,

        /*update的flag*/
            _isTrigger = false,

        /*属性的初始状态*/
            _startPropreties = {},

        /*属性的目标状态*/
            _endPropreties = {},

        /*事件委托*/
            _eventHandler = new observer(this),

        /*缓动函数*/
            _easingFunction = tools.bind(easingObj.linear, easingObj),

        /*当前动画完成后，继续执行的链表动画*/
            _chainedAnimate = [],

        /*当前动画的状态*/
            _animateState = animateStates.READY,

        /*动画是否全部完成，包括链表中的动画*/
            _isCompleted = false,

        /*暂停的时长*/
            _pauseStart = 0,
            _pauseEnd = 0,
            _pauseDuration = 0;

        /* 唯一识别码*/
        this._guid = tools.newId();

        function stopStep() {
            _isUpdateStep = false;
        }

        /*
         * 设置动画的生命周期
        */
        this.setDuration = function (duration) {
            _duration = duration;
            return this;
        }
        /*指定属性的初始值*/
        this.from = function (sPropreties) {
            _startPropreties = tools.clone(sPropreties);
            return this;
        }
        /* 指定属性的目标值*/
        this.to = function (ePropreties) {
            _endPropreties = tools.clone(ePropreties);
            return this;
        }
        /* 指定缓动函数*/
        this.easing = function (easingStr) {
            if (tools.isString(easingStr)) {
                _easingFunction = easingStr in easingObj ? easingObj[easingStr] : easingObj.linear;
            }
            else if (tools.isFunction(easingStr)) {
                _easingFunction = easingStr;
            }
            else {
                _easingFunction = easingObj.linear;
            }
            _easingFunction = tools.bind(_easingFunction, easingObj)
            return this;
        }
        /* 启动动画，只用在启动动画时使用一次*/
        this.start = function () {
            _startTime = undefined;
            _isUpdateStep = true;
            _isTrigger = true;
            _animateState = animateStates.START;
            _eventHandler.notifyByKey("start");
            return this;
        }
        /* 停止动画，不保存动画数据，*/
        this.stop = function () {
            _animateState = animateStates.STOP;
            _isTrigger = false;
            _isUpdateStep = false;
            _startTime = undefined;

            return this;
        }

        /* 重新启动动画, */
        this.restart = function () {
            _startTime = undefined;
            _isUpdateStep = true;
            _isTrigger = true;
            _repeatCount = _repeatCount_Backup;
            _loopCount = _loopCount_Backup;
            _animateState = animateStates.START;
            _eventHandler.notifyByKey("start");

            return this;
        }
        /*
         * 暂停动画
        */
        this.pause = function () {
            /*
             *确保连续暂停时，只有第一次有效
            */
            if (_animateState == animateStates.PAUSE) {
                return this;
            }
            /*
             *动画只有处于running或completed状态时，暂停才生效
            */
            if (_animateState == animateStates.RUNNING /*|| _animateState == animateStates.COMPLETETED*/) {

                _animateState = animateStates.PAUSE;

                _isTrigger = false;

                _pauseStart = Date.now();


            }
            return this;
        }
        /*
         * 继续暂停的动画
        */
        this.active = function () {
            if (_isTrigger) return this;
            _isTrigger = true;
            _pauseEnd = Date.now();
            _pauseDuration = _pauseEnd - _pauseStart;
            /*弥补应暂停造成的的时间差*/
            if (_animateState == animateStates.PAUSE) {
                _startTime = _startTime + _pauseDuration
            }
            return this;
        }
        /*
         * 设置动画延迟执行的时间
        */
        this.delay = function (delay) {
            _delayTime = delay;
            return this;
        }
        /*动画运行时的回调函数*/
        this.onstep = function (func, isClear) {
            if (isClear) {
                _eventHandler.remove("step");
            }
            if (tools.isFunction(func)) {
                _eventHandler.attach("step", func);
            }
            else {
                log.write("Error:Argument 'func' is not a function"
                                 , "Path:core.js"
                                 , "function:onstep");
            }
            return this;
        }
        /*动画完成时的回调函数*/
        this.oncompleted = function (func, isClear) {
            if (isClear) {
                _eventHandler.remove("step");
            }
            if (tools.isFunction(func)) {
                _eventHandler.attach("completed", func);
            }
            else {
                log.write("Error:Argument 'func' is not a function"
                                 , "Path:core.js"
                                 , "function:oncompleted");
            }
            return this;
        }

        /*动画启动时的回调函数*/
        this.onstart = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("start", func);
            }
            return this;
        }

        /*
         *获取动画的运行状态
        */
        this.getAnimateStates = function () {
            return _animateState;
        }
        /*
        * 判定动画（包括链表动画）是否完成*
        */
        this.isCompleted = function () {
            var isCompleted = this.getAnimateStates() == animateStates.COMPLETETED;
            return isCompleted;
        }
        /*
        * 反转当前动画
        */
        this.animateReverse = function () {
            var animate = new AnimateCore();
            animate.setDuration(_duration)
                   .from(_endPropreties)
                   .to(_startPropreties)
                   .delay(_delayTime)
                   .easing(_easingFunction);

            var steps = _eventHandler.getHandlerByKey("step");
            if (!tools.isUndefined(steps) && steps.length > 0) {
                for (var i = 0; i < steps.length; i++) {
                    animate.onstep(steps[i]);
                }
            }
            return animate;
        }
        /*
         * 克隆当前动画
        */
        this.clone = function () {
            var animate = new AnimateCore();
            animate.setDuration(_duration)
                   .from(_startPropreties)
                   .to(_endPropreties)
                   .delay(_delayTime)
                   .easing(_easingFunction);

            var steps = _eventHandler.getHandlerByKey("step");
            if (!tools.isUndefined(steps) && steps.length > 0) {
                for (var i = 0; i < steps.length; i++) {
                    animate.onstep(steps[i]);
                }
            }

            return animate;
        }
        /*
        * 每帧动画执行
        */
        this.update = function () {
            _update(Date.now());
        }
        var _update = function (time) {
            var elapsed,

                property,

                startValue,

                endValue,

                result = {};

            if (!_isTrigger) {
                return;
            }

            _startTime = _startTime ? _startTime : time;

            /*实现动画的延迟*/
            if (time < _startTime + _delayTime) {
                return;
            }

            if (_animateState == animateStates.STOP) {
                return;
            }

            /*计算动画已运行的时间*/
            elapsed = time - _startTime - _delayTime;

            elapsed = elapsed > _duration ? _duration : elapsed;


            if (_isUpdateStep) {

                for (property in _endPropreties) {
                    startValue = _startPropreties[property] || 0;
                    endValue = _endPropreties[property];

                    if (tools.isString(endValue)) {
                        endValue = startValue + parseFloat(endValue);
                    }

                    if (tools.isNumber(endValue)) {
                        result[property] = _easingFunction(elapsed, startValue, endValue - startValue, _duration);

                    }
                }
                _animateState = animateStates.RUNNING;
                _eventHandler.notifyByKey("step", result, elapsed, _duration, _startTime);
            }

            if (elapsed == _duration) {
                /*
                 *这里的stop主要用于停止对step事件的执行。
                 */
                stopStep();
                /*
                 *动画完成后保证，completed的CallBack只执行一次
                 */
                if (_animateState != animateStates.COMPLETETED) {
                    _animateState = animateStates.COMPLETETED;
                    _eventHandler.notifyByKey("completed");
                }
                // }
            }
        }
    }

    function Animate(segments) {

        this.animateCore = null;

        return this.init(segments);

    }

    Animate.prototype = function () {
        return {
            /*
             * 创建AnimateCore对象
             *
             * @param:{segment}            
                segmnet = {
                    duration: 1000,          //动画的生命周期
                    from: {},                //初始变化属性       
                    to: {},                  //目标变化属性 
                    delay: 0,                //动画的延迟执行时间
                    easing: "",              //缓动函数
                    onstep: null,            //动画变化过程中的更新操作
                    oncompleted: null        //动画完成后的回调
                }
             *
             *
             * @param:{defauls} 同 {segment}  
            */
            init: function (segment) {
                var _segmnet = {
                    duration: 1000,
                    from: {},
                    to: {},
                    delay: 0,
                    loop: 0,
                    repeat: 0,
                    easing: "",
                    onstep: null,
                    oncompleted: null
                }, aniCore;

                segment = tools.extend(_segmnet, segment || {});
                aniCore = new AnimateCore(segment.duration);
                aniCore.from(segment.from)
                              .to(segment.to)
                              .onstep(segment.onstep)
                              .oncompleted(segment.oncompleted)
                              .delay(segment.delay)
                              .easing(segment.easing);

                this.animateCore = aniCore;
                //var that = this;
                //var _prototype = Animate.prototype;
                //for (var pro in aniCore) {
                //    if (!_prototype.hasOwnProperty(pro)) {
                //        if (tools.isFunction(aniCore[pro])) {
                //            _prototype[pro] = (function (pro, obj) {
                //                return function () {
                //                    return obj.animateCore[pro].apply(obj.animateCore, arguments);
                //                }
                //            })(pro, this)
                //        }
                //        else {
                //            _prototype[pro] = that.animateCore[pro];
                //        }
                //    }
                //}

                return aniCore;
            }
        }
    }();
    return Animate;

});