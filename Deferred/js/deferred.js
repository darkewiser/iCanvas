var DefPromise = function () {
    EventHandler.apply(this, arguments);
}

DefPromise.prototype = EventHandler.prototype;

DefPromise.prototype.registerSuccessHandler = function (handler) {
    if (typeof handler == "function") {
        this.once("success", handler);
    }
    return this;
}

DefPromise.prototype.registerErrorHandler = function (handler) {
    if (typeof handler == "function") {
        this.once("error", handler);
    }
    return this;
}

DefPromise.prototype.registerProgressHandler = function (handler) {
    if (typeof handler == "function") {
        this.on("progress", handler);
    }
    return this;
}

DefPromise.prototype.then = function (sucHandler, errHandler, proHandler) {
    return this.registerSuccessHandler(sucHandler).registerErrorHandler(errHandler).registerProgressHandler(proHandler);
}

var Deferred = function () {
    this.state = "unfullfilled";
    this.promise = new DefPromise();
}

Deferred.prototype.resolve = function (obj) {
    this.state = "success";
    this.promise.trigger("success",obj);
}

Deferred.prototype.reject = function (err) {
    this.state = "fail";
    this.promise.trigger("error", err);
}

Deferred.prototype.progress = function (info) {
    this.promise.trigger("progress", info);
}