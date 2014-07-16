var IR = IR || {};
(function (IR) {
    var Timer = IR.Timer,
       Animate = IR.AnimateCore,
       tools = IR.Util;
    function Animation() {
        this.timer = new Timer();
        var that = this;
        this.timer.addHandler(function () {
            for (var i = 0, ci; ci = that.animates[i]; i++) {
                ci.frame();
            }

        })
        this.animates = [];
    }
    Animation.prototype = function () {
        var _options = {
            from: {},
            to: {},
            easing: '',
            delay: 0,
            duration: 1000
        }
        return {
            create: function (options, onstep, oncompleted) {
                var settings = tools.extend(_options, options);
                var animate = new Animate(settings.duration, settings.fps);
                animate.from(settings.from);
                animate.to(settings.to);
                animate.easing(settings.easing);
                animate.delay(settings.delay);
                if (tools.isFunction(onstep)) { animate.onstep(onstep); }
                if (tools.isFunction(oncompleted)) { animate.oncompleted(oncompleted); }
                this.animates.push(animate);
                return animate;
            },
            start: function () {
                this.timer.start();
            },
            stop: function () {
                this.timer.stop();
            }

        }

    }();

    IR.Animation = Animation;

})(IR);