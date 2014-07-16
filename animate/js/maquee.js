var marqueeObj = function () {
    var aniContxt = new IR.Animation();
    var animations = [];
    var list = {};
    var _easing = "linear";
    var _delay = 0;
    var _duration = 1000;
    
    return {
        append: function (id, lineHeight,duration,easing,delay) {
            var _ul = document.getElementById(id);
            var _lineHeight;
            if (lineHeight == undefined) {
                for (var i = 0, ci; ci = _ul.childNodes[i]; i++) {
                    if (ci.tagName == "LI") {
                        _lineHeight = ci.clientHeight;
                        break;
                    }
                }
            }
            else {
                _lineHeight = lineHeight;
            }

            var animate = this.createAnimation(delay, duration, easing);

            animate.onframe(function (data) {
                _ul.style.marginTop = -_lineHeight * data.perc / 100 + "px";
            });

            animate.oncompleted(function () {
                for (var i = 0, ci; ci = _ul.childNodes[i]; i++) {
                    if (ci.tagName == "LI") {
                        _ul.appendChild(ci);
                        _ul.style.marginTop="0px";
                        break;
                    }
                }
                this.start();
            });

            animations.push(animate);
        }
        ,createAnimation:function (delay, duration, easing) {
            var _easing = easing ? easing : "linear";
            var _delay = delay == undefined ? 0 : delay;
            var _duration = duration == undefined ? 1000 : duration;
            var animate = aniContxt.create({
                from: { perc: 0 }
                   , to: { perc: 100 }
                   , easing: _easing
                   , delay: _delay
                   , duration: _duration
            });
            return animate;
        }

        , start: function () {
            for (var i = 0, ci; ci = animations[i]; i++) {
                ci.start();
            }
            aniContxt.start();
        }
    }
}();