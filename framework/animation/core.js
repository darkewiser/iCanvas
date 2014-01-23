/*
 * 动画的核心处理类
 *
 * @author Mingli (v-minggu@microsoft.com)
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
 * chainedAnimate            添加动画链
 * update                    更新动画
 * easing                    添加缓动函数
 * loop                      动画是否循环，与repeat互斥
 * repeat                    动画是重复，参数小于等于0时，重复无限次，与loop互斥
 * restartChainedAnimate     重新启动链表动画。
 * isChainedAnimateCompleted 链表动画是否完成。
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
            _easingFunction = easingObj.linear,

        /*当前动画完成后，继续执行的链表动画*/
            _chainedAnimate = [],

        /*当前动画的状态*/
            _animateState = animateStates.READY,

        /*动画是否全部完成，包括链表中的动画*/
            _isCompleted = false,

        /*动画是否循环执行*/
            _isLoop = false,

        /*动画重复次数*/
            _repeatCount = 1,

        /*保存动画的重复次数，在重启动画时，恢复 _repeatCount */
            _repeatCount_Backup = 1,

        /*动画重复,不限次数*/
            _repeatForover = false,

        /*暂停的时长*/
            _pauseStart = 0,
            _pauseEnd = 0,
            _pauseDuration = 0;


        function stopStep() {
            _isUpdateStep = false;
        }

        /*
         *遍历链表动画数组
        */
        function eachChainedAnimate(func) {
            for (var i = 0, ci; ci = _chainedAnimate[i]; i++) {

                func.call(null, ci);

            }

        }
        this.setDuration=function(duration){
            _duration=duration;
            return this;
        }

        this.loop = function (flag) {
            _isLoop = tools.isBool(flag) ? flag : !!flag;

            _repeatCount = _isLoop ? 1 : _repeatCount;
            return this;
        }

        this.restartChainedAnimate = function () {
            this.restart();

            eachChainedAnimate(function (ci) {
                ci.restartChainedAnimate();

            });          
        }

        this.repeat = function (count) {
            /*重复次数*/
            _repeatCount = tools.isNumber(count) && count > 0 ? count : 1;
            _repeatCount_Backup = _repeatCount;
            /*是否不限次数的重复*/
            _repeatForover = count <= 0 ? true : false;
            /*动画重复，动画的循环失效*/
            _isLoop = _repeatForover || _repeatCount > 1 ? false : _isLoop;
            return this;
        }
        this.from = function (sPropreties) {
            _startPropreties = tools.clone(sPropreties);
            return this;
        }

        this.to = function (ePropreties) {
            _endPropreties = tools.clone(ePropreties);
            return this;
        }
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
            return this;
        }
        this.start = function () {
            _isUpdateStep = true;
            _isTrigger = true;
            _animateState = animateStates.START;
            _eventHandler.notifyByKey("start");
            return this;
        }
        this.restart = function () {
            _startTime = undefined;
            _isUpdateStep = true;
            _isTrigger = true;
            _repeatCount = _repeatCount_Backup;
            _animateState = animateStates.START;

            eachChainedAnimate(function (ci) {
                ci.restart();

            });
            return this;
        }
        this.stop = function () {
            _animateState = animateStates.STOP;
            _isTrigger = false;
            _isUpdateStep = false;

            eachChainedAnimate(function (ci) {
                ci.stop();

            });
            return this;
        }
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
            if (_animateState == animateStates.RUNNING || _animateState == animateStates.COMPLETETED) {

                _animateState = animateStates.PAUSE;

                _isTrigger = false;

                _pauseStart = Date.now();

                eachChainedAnimate(function (ci) {
                    ci.pause();
                });
            }
            return this;
        }
        this.active = function () {
            if (_isTrigger) return this;
            _isTrigger = true;
            _pauseEnd = Date.now();
            _pauseDuration = _pauseEnd - _pauseStart;
            /*弥补应暂停造成的的时间差*/
            if (_animateState == animateStates.PAUSE) {                
                _startTime = _startTime + _pauseDuration
            }
            eachChainedAnimate(function (ci) {
                ci.active();

            });

            return this;
        }
        this.delay = function (delay) {
            _delayTime = delay;
            return this;
        }
        this.onstep = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("step", func);
            }
            return this;
        }
        this.oncompleted = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("completed", func);
            }
            return this;
        }
        this.onstart = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("start", func);
            }
            return this;
        }
        this.chainedAnimate = function (animate) {
            _chainedAnimate.push(animate);
            return this;
        }

        this.getAnimateStates = function () {
            return _animateState;
        }
        /*
        * 判定动画（包括链表动画）是否完成        *
        */
        this.isChainedAnimateCompleted = function () {
            var isCompleted = this.getAnimateStates() == animateStates.COMPLETETED;

            eachChainedAnimate(function (ci) {
                isCompleted = isCompleted && ci.isChainedAnimateCompleted();

            });

            return isCompleted;
        }
        this.update = function (time) {
            var elapsed, property, startValue, endValue, result = {};
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

                _repeatCount--;

                if (_repeatCount > 0 || _repeatForover) {
                    /*重复执行*/
                    _startTime = 0;
                }
                else if (_isLoop) {
                    /*循环动画*/
                    _startTime = 0;
                    var tmp = tools.clone(_startPropreties);
                    _startPropreties = tools.clone(_endPropreties);
                    _endPropreties = tmp;
                }
                else {

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
                    /*
                     * 执行当前动画中的动画链表
                     */
                    eachChainedAnimate(function (ci) {
                        ci.update(Date.now());

                    });
                }
            }
        }
    }

    return AnimateCore;
});