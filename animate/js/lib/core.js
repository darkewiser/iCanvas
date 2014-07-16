/*
 * 动画的核心处理类
 *
 * @author Mingli (guomilo@gmail.com)
 * @vision 1.0.0
 *
 * 
 * from:                     指定属性的初始值
 * to:                       指定属性的目标值
 * start:                    启动动画
 * stop                      停止动画
 * getStates                 获取动画的状态
 * delay                     设置动画延迟执行的时间
 * onframe                   动画运行中回调函数
 * oncompleted               动画完成的回调函数
 * frame                     更新动画
 * easing                    添加缓动函数
 *
 *
 */
var IR = IR || {};
(function (IR) {
    var tools = IR.Util,
        observer = IR.Observer,
        Tween = IR.Tween;

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
     */
    var animateStates = {

        READY: "1",
        START: "2",
        RUNNING: "3",
        PAUSE: "4",
        COMPLETED: "5"

    };

    function AnimateCore(/* 生命周期,单位ms */duration, /*帧率 */fps) {
        var
        /*生命周期*/
            _duration = duration || 1000,

        /*帧率*/
            _fps = fps || 20,

        /*每帧间隔的最小时间*/
            _frameInterval = function () {
                return 1000 / _fps
            },

        /*当前帧*/
            _currentFrame = 0,

        /*帧数*/
            _frames = function () {
                return parseInt((_duration / _frameInterval()).toFixed(0), 10);
            },
            _frameCount = _frames(),

        /*最后更新的时间*/
            _lastUpdateTime = 0,

        /*动画开始时间*/
            _startTime = 0,

        /*动画延迟执行的时间*/
            _delayTime = 0,

        /*延迟定时器句柄*/
            _delayInterval,

        /*缓动函数*/
            _tween = createTween("linear"),

        /*事件委托
         * frame:动画每步更新callback
         * completed:动画完成时触发
         */
            _eventHandler = new observer(this),

        /*动画的触发开关*/
            _trigger = false,

        /*属性的初始状态*/
            _startPropreties = {},

        /*属性的目标状态*/
            _endPropreties = {},

        /*暂停的时长*/
            _pauseStart = 0,
            _pauseEnd = 0,
            _pauseDuration = 0;

        /*当前动画的状态*/
        _animateState = animateStates.READY;

        /* 创建缓动函数 */
        function createTween(easing) {

            if (!(tools.isString(easing) && easing in Tween)) {
                easing = "linear";
            }
            return tools.bind(Tween[easing], Tween);
        }

        /* 唯一识别码 */
        this._guid = tools.newId();

        /* 设置动画的状态 */
        function setStates(state) {
            _animateState = state;
        }

        /*获取动画的运行状态*/
        this.getStates = function () {
            return _animateState;
        }
        /*启动动画*/
        this.start = function () {
            _trigger = true;

            var _state = this.getStates();
            if (_state != animateStates.PAUSE) {
                _startTime = Date.now();
            }
            if (_state == animateStates.PAUSE) {
                _startTime += Date.now() - _pauseStart;
            }
            setStates(animateStates.START);
        }
        /*停止/暂停动画*/
        this.stop = function () {
            _trigger = false;
            if (_currentFrame <= _frameCount) {

                setStates(animateStates.PAUSE);
                _pauseStart = Date.now();

            }
        }

        /*设置动画的生命周期*/
        this.setDuration = function (duration) {
            _duration = duration;
            _frameCount = _frames()
            return this;
        }
        /*设置动画的帧率*/
        this.setDuration = function (fps) {
            _fps = fps;
            _frameCount = _frames()
            return this;
        }
        /*指定属性的初始值*/
        this.from = function (sPropreties) {
            _startPropreties = sPropreties;
            return this;
        };

        /* 指定属性的目标值*/
        this.to = function (ePropreties) {
            _endPropreties = ePropreties;
            return this;
        };

        /* 指定缓动函数*/
        this.easing = function (easing) {

            _tween = createTween(easing);

            return this;
        }

        /* 设置动画延迟执行的时间  */
        this.delay = function (delay) {
            _delayTime = delay;
        }

        /* 动画运行时的回调函数 */
        this.onframe = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("frame", func);
            }
        }
        /* 动画完成时的回调函数 */
        this.oncompleted = function (func) {
            if (tools.isFunction(func)) {
                _eventHandler.attach("completed", func);
            }

        }

        /* 克隆当前动画（）*/
        this.clone = function () {
            var animate = new AnimateCore();
            animate.setDuration(_duration)
                .from(_startPropreties)
                .to(_endPropreties)
                .delay(_delayTime)
                .easing(_tween);
            return animate;
        }

        /*动画帧*/
        this.frame = function () {

            if (Date.now() - _startTime < _delayTime) {
                return;
            }
            update.apply(this);

        }

        function update() {
            var _curTime = Date.now(),
                _remainFrame,
                _property,
                _startValue,
                _endValue,
                _frame = _frameCount,
                result = {};

            if (!_trigger) {
                return;
            }

            if (this.getStates() == animateStates.STOP) {
                return;
            }

            _remainFrame = _frame - _currentFrame;


            /*
             * 更新时间间隔必须大于帧的时间间隔,才可一继续下一帧的更新。
             */
            if (_curTime - _lastUpdateTime >= _frameInterval()) {
                /*
                 * 当前帧数小于动画的帧数，则更新动画。
                 */
                if (_currentFrame <= _frame) {
                    for (_property in _endPropreties) {
                        startValue = _startPropreties[_property] || 0;
                        endValue = Number(_endPropreties[_property]);
                        if (!tools.isNumber(endValue)) {
                            endValue = startValue;
                        }
                        result[_property] = _tween(_currentFrame, startValue, endValue - startValue, _frame);

                    }
                    _currentFrame++;
                    setStates(animateStates.RUNNING);
                    _eventHandler.notifyByKey("frame", result);

                }
                else {
                    _trigger = false;
                    _currentFrame = 0;
                    setStates(animateStates.COMPLETED);
                    _eventHandler.notifyByKey("completed");
                }

                _lastUpdateTime = Date.now();
            }
        }
    }

    IR.AnimateCore = AnimateCore;
})(IR)