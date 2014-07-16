var EventHandler = function () {
    this.list = {};
}

EventHandler.prototype = function () {
    var evt = function (sender) {
        this.sender = sender;
        this.handlers = [];
    }

    evt.prototype = {
        attach: function (func) {
            if (typeof func != "function") {
                return;
            }
            this.handlers.push(func);
        }
        , notify: function () {
            for (var i = 0, ci; ci = this.handlers[i]; i++) {
                if (typeof ci == "function") {
                    ci.apply(this.sender, arguments);
                }
            }
        }
        , unbind: function (func) {
            for (var i = 0, ci; ci = this.handlers[i]; i++) {
                if (func === ci) {
                    delete this.handlers[i];
                    return;
                }
            }
        }
    }
    
    //generate GUID
    function newId() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }

    return {
           on: function () {
            var _list = [].slice.apply(arguments);
            var _key, _func, _sender;
            for (var i = 0; i < _list.length; i++) {
                var ci = _list[i];
                switch (typeof ci) {
                    case "string":
                        _key = ci;
                        break;
                    case "function":
                        _func = ci;
                        break;
                    case "undefined":
                        break;
                    default:
                        _sender = ci;
                        break;
                }
            }
            if (_key == undefined) {
                _key = newId();
            }

            if (!this.list[_key]) {
                this.list[_key] = new evt(_sender);
            }
            this.list[_key].attach(_func);
            return _key;
        }
        , once: function (key, callback, sender) {
            //the callback will only be implemented once
            var _key = key;
            var that = this;
            _key = this.on(_key, function () {
                var _args = arguments;
                callback.apply(that, _args);
                that.list[_key].unbind(_args.callee);
            }, sender);
            return _key;
        }
        , trigger: function (key) {
            if (key != undefined && this.list[key]) {
                this.list[key].notify([].slice.call(arguments, 1));
            }
        }
        , del: function (key) {
            delete this.list[key];
        }
    }
}();