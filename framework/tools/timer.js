define(function (require) {
    var tools = require("./util");
    require("../tools/requestAnimationFrame");
    function Timer() {
        var that = this;
        this.interval = undefined;
        this.functionList = [];

        /*  
        // 单例的实现
        if (tools.isUndefined(Timer.instance)) {
            return getInstance();
        }
        else {
            return Timer.instance;
        }
        function getInstance() {
            Timer.instance = that;
            return that;
        }
        
        */
    }
    Timer.prototype = {
        start: function (func,caller) {
            var that = this;
            if (!tools.isUndefined(caller)) {
                func = tools.bind(func, caller);
            }
            (function () {
                that.interval = window.requestAnimationFrame(arguments.callee);
                func();
            })();
        },
        stop: function () {
            window.cancelAnimationFrame(this.interval);
        },      
       
    };
    return Timer;

});