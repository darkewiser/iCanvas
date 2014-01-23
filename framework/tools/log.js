define(function (require) {
    var tools = require("./util")
    window.debugMode = 2;

    function Log() {
        if (typeof Log.instance == "undefined") {
            return getInstance.apply(this);
        }
        else {
            return Log.instance;
        }
        function getInstance() {
            Log.instance = this;

            this.write = function () {
                if (window.debugMode == 0) {
                    return;
                }
                else if (window.debugMode == 1) {
                    for (var k in arguments) {
                        throw new Error(arguments[k]);
                    }
                }
                else if (window.debugMode == 2) {
                    for (var k in arguments) {
                        console.log(arguments[k]);
                    }
                }
                else {
                    for (var k in arguments) {
                        alert(arguments[k]);
                    }
                }
            }
            return this;
        }
    }
    return new Log();
});

