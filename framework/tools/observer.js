define(function (require) {
    var tools = require("./util"), observer;
    observer = function (sender) {
        this._sender = sender;
        this._listeners = {};
    }
    observer.prototype = {
        attach: function (key, handler) {
            if (tools.isUndefined(key)) return;
            if (!tools.isFunction(handler)) return;
            if (tools.isUndefined(this._listeners[key])) {
                this._listeners[key] = [];
            }
            this._listeners[key].push(handler);
        },
        notify: function () {
            var listeners = this._listeners,
                args = Array.prototype.slice.call(arguments);

            for (var ci in listeners) {
                this.notifyByKey.apply(this, Array.prototype.concat([ci], args));
            }
        },
        notifyByKey: function (key) {
            if (tools.isUndefined(key)) return;
            var listeners = this._listeners;
            if (tools.isUndefined(listeners[key])) { return; }
            for (var i = 0, cii; cii = listeners[key][i]; i++) {
                cii.apply(this._sender, Array.prototype.slice.call(arguments, 1));
            }
        },
        remove: function (key, index) {
            if (tools.isUndefined(key)) return;
            if (tools.isUndefined(index)) {
                delete this._listeners[key];
            }
            else {
                this._listeners[key].splice(index, 1);
            }
        },
        getHandlerByKey: function (key) {
            if (tools.isUndefined(key)) return undefined;
            var listeners = this._listeners;
            if (tools.isUndefined(listeners[key])) { return undefined; }
            return listeners[key];
        },
        clear: function () {
            this._listeners = {};
        }
    }

    return observer;
})