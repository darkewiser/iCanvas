function Animate1() {
    var _interval, _currentAnimateNode = [], _animateNodeConfig = [],
    DEFAULT = {
        time: 0,
        propreties: {},
        delay: 0,
        repeat: 1,
        loop: false,
        easing: "",
        onstep: [],
        oncompleted: []
    };

    function getLastAnimateNode() {
        var len = _currentAnimateNode.length;
        return len > 0 ? _currentAnimateNode[len - 1] : {
            start: function () {
                return this;
            },
            update: function () {
                return this;
            }

        };
    }

    this.loop = false;

    this.createAnimate = function () {
        var animate, i = 1, prev, current, duration;
        _currentAnimateNode = [], len = _animateNodeConfig.length,
        _halfLen = Math.ceil(len / 2);
        //_animateNodeConfig.sort(function (x, y) {
        //    return x.time > y.time;
        //});
        for (; i < len; i++) {

            if (i > _halfLen && this.loop) {
                prev = _animateNodeConfig[i - 1];
                current = _animateNodeConfig[i];
            }
            else {
                prev = _animateNodeConfig[i - 1];
                current = _animateNodeConfig[i];
            }

            animate = new AnimateCore(Math.abs(current.time - prev.time));

            animate.from(prev.propreties)
                   .to(current.propreties)
                   .onstep(current.onstep)
                   .oncompleted(current.oncompleted)
                   .repeat(current.repeat)
                   .loop(current.loop)
                   .delay(current.delay)
                   .easing(current.easing)
                   .start();

            animate.id = i - 1;
            _currentAnimateNode.push(animate);

            if (_currentAnimateNode.length > 1) {
                _currentAnimateNode[i - 2].chainedAnimate(animate);
            }

        }
        return this;
    }
    /*
     *为动画添加动画节点，实现动画的分段配置
     *   
     animate=new Animate();
     this.segment([  {
                    time: 0,
                    propreties: { x: 0, y: 0 },
                    delay: 0
                },
                {
                    time: 3500,
                    propreties: { x: 300, y: 400 },
                    repeat: 1,
                    onstep: function (d) {
                        test.style.left = d.x + "px";
                        test.style.top = d.y + "px";
                    }
                },
                {
                    time: 4500,
                    propreties: { x: 300, y: 800 },
                    repeat: 1,
                    loop:false,
                    onstep: function (d) {
                        test.style.left = d.x + "px";
                        test.style.top = d.y + "px";
                    }
                }
            ]);
     *
     *
     *
    */
    this.segment1 = function (options, onstep, oncompleted, loop) {
        var result = {}, tmpConfigItem = {}, isExist = false;

        this.loop = loop;

        if (tools.isArray(options)) {
            for (var j = 0; j < options.length; j++) {
                arguments.callee.call(this, options[j], onstep, oncompleted, loop);
            }

            var len = _animateNodeConfig.length;
            for (var m = 0, cm, clm ; clm = _animateNodeConfig[len - 2 - m], cm = _animateNodeConfig[m]; m++) {

                if (loop) {

                    if (clm) { _animateNodeConfig.push(clm); }
                }
                else {
                    if (m == len - 1 && tools.isFunction(oncompleted)) {
                        cm["oncompleted"] = oncompleted;
                    }
                }
            }
            if (!loop) {
                _animateNodeConfig.sort(function (x, y) {
                    return x.time > y.time;
                });
            }
        }
        else if (tools.isObject(options)) {
            result = tools.extend(DEFAULT, options);
            if (_animateNodeConfig && _animateNodeConfig.length > 0) {
                for (var i = 0; i < _animateNodeConfig.length; i++) {
                    tmpConfigItem = _animateNodeConfig[i];
                    if ("time" in tmpConfigItem && tmpConfigItem['time'] == result.time) {
                        result = tools.extend(tmpConfigItem, result);
                        if (tools.isFunction(onstep)) {
                            result["onstep"] = onstep;
                        }
                        _animateNodeConfig[i] = result;
                        isExist = true;
                    }
                }
            }
            if (!isExist) {
                if (tools.isFunction(onstep)) {
                    result["onstep"] = onstep;
                }
                _animateNodeConfig.push(tools.clone(result));
            }
        }
        return this;
    }
    this.segment = function (options, onstep, oncompleted, loop) {
        this.loop = loop;
        if (tools.isArray(options)) {
            for (var j = 0; j < options.length; j++) {
                buildAnimateConfig.call(this, options[j], onstep, oncompleted, loop);
            }

            var len = _animateNodeConfig.length;
            for (var m = 0, cm, clm ; clm = _animateNodeConfig[len - 2 - m], cm = _animateNodeConfig[m]; m++) {

                if (loop) {


                    if (clm) {
                        clm = tools.clone(clm);
                        // clm.easing = _animateNodeConfig[len - 1 - m].easing;
                        // clm.onstep = _animateNodeConfig[len - 1 - m].onstep;
                        _animateNodeConfig.push(clm);
                    }
                }
                else {
                    if (m == len - 1 && tools.isFunction(oncompleted)) {
                        cm["oncompleted"] = oncompleted;
                    }
                }
            }
            if (!loop) {
                _animateNodeConfig.sort(function (x, y) {
                    return x.time > y.time;
                });
            }

        }

        function buildAnimateConfig(options, onstep, oncompleted, loop) {
            var result = {},
                tmpConfigItem = {},
                isExist = false,
                _tmpOnStep;

            if (tools.isObject(options)) {
                result = tools.extend(DEFAULT, options, true);
                if (_animateNodeConfig && _animateNodeConfig.length > 0) {
                    for (var i = 0; i < _animateNodeConfig.length; i++) {
                        tmpConfigItem = _animateNodeConfig[i];
                        /* 出现相同的时间节点时，和并属性 */
                        if ("time" in tmpConfigItem && tmpConfigItem['time'] == result.time) {
                            result = tools.extend(tmpConfigItem, result);

                            /**/
                            if (tools.isFunction(onstep) && !tools.isFunction(result["onstep"])) {
                                result["onstep"] = onstep;
                            }
                            _animateNodeConfig[i] = result;
                            isExist = true;
                        }
                    }
                }
                if (!isExist) {
                    if (tools.isFunction(onstep) && !tools.isFunction(result["onstep"])) {
                        result["onstep"] = onstep;
                    }
                    _animateNodeConfig.push(tools.clone(result));
                }
            }
        }
        return this;

    }
    this.update = function () {
        this.getAnimate().update(Date.now());
    }

    this.start = function () {
        this.getAnimate().active();
    }

    this.restart = function () {
        this.getAnimate().restartChainedAnimate();
    }
    this.stop = function () {
        this.getAnimate().pause();
    }

    this.getAnimate = function () {
        return _currentAnimateNode.length > 0 ? _currentAnimateNode[0]
                                       : {
                                           start: function () {
                                               return this;
                                           },
                                           update: function () {
                                               return this;
                                           }

                                       };
    }

    this.chinedAnimate = function (animate) {
        var anode = getLastAnimateNode();
        if (animate instanceof Animate) {
            anode.chainedAnimate(animate.getAnimate());
        }
        else if (animate instanceof AnimateCore) {
            anode.chainedAnimate(animate);
        }
        else {
            log.write("chineAnimate的参数的类型不正确");
        }

    }

    this.isChainedAnimateCompleted = function () {
        return this.getAnimate().isChainedAnimateCompleted();
    }
}