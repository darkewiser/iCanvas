define(function (require) {
    var AnimateContext = require(" ../../../animation/animatecontext");
    var animateContext = new AnimateContext();
    var $$ = function (id) {
        return document.getElementById(id);
    }
    var start = $$("start");
    var stop = $$("stop");
    var circle = $$("circle");
    var loop = $$("loop");
    var noloop = $$("noloop");
    var rect = $$("rect");
    var speed = $$("addSpeed");
    //easeInOutElastic
    var animate = animateContext.createAnimate([
        {
            duration: 2000,
            from: { top: 50, left: 500, w: 100, h: 100 },
            to: { top: 500, left: 500, w: 20, h: 20 }

        },
        {
            duartion: 3000,
            from: { top: 500, left: 500, w: 20, h: 20 },
            to: { top: 500, left: 1000, w: 50, h: 50 }
        },
        {
            duartion: 3000,
            from: { top: 500, left: 1000, w: 50, h: 50 },
            to: { top: 50, left: 500, w: 100, h: 100 },
            easing: 'easeInOutElastic',
            oncompleted: function () {
                console.log("year");
            }
        }

    ], {
        onstep: function (d) {
            circle.style.left = d.left + "px";
            circle.style.top = d.top + "px";
            circle.style.width = d.w + "px";
            circle.style.height = d.h + "px";
            circle.style.borderRadius = d.w / 2 + "px /" + d.h / 2 + "px"
        }
    });

    var allAnimates = animate.getAnimates();



    var animate1 = animateContext.createAnimate([{
        duration: 1000,
        from: { top: 300, left: 0, deg: 0 },
        to: { top: 300, left: 1000, deg: 360 },
        easing: 'easeInOutElastic',
    }


    ], {
        onstep: function (d) {
            rect.style.left = d.left + "px";
            rect.style.top = d.top + "px";
            rect.style.webkitTransform = "rotate(" + d.deg + "deg)"


        }
    });

    var animate2 = animateContext.createAnimate([{
        duration: 2000,
        delay: 500,
        from: { top: 10, left: 100, deg: 0 },
        to: { top: 500, left: 100, deg: 360 },
        easing: 'easeInOutElastic',

    }


    ], {
        onstep: function (d) {
            stop.style.left = d.left + "px";
            stop.style.top = d.top + "px";
            stop.style.webkitTransform = "rotate(" + d.deg + "deg)"


        }
    });

    var animate3 = animateContext.createAnimate([{
        duration: 2000,
        delay: 1000,
        from: { top: 10, left: 200, deg: 0 },
        to: { top: 500, left: 200, deg: 360 },
        easing: 'easeInOutElastic',

    }
    ], {
        onstep: function (d) {
            loop.style.left = d.left + "px";
            loop.style.top = d.top + "px";
            loop.style.webkitTransform = "rotate(" + d.deg + "deg)"
        }
    });

    var animate4 = animateContext.createAnimate([{
        duration: 2000,
        delay: 1500,
        from: { top: 10, left: 300, deg: 0 },
        to: { top: 500, left: 300, deg: 360 },
        easing: 'easeInOutElastic',

    }
    ], {
        onstep: function (d) {
            noloop.style.left = d.left + "px";
            noloop.style.top = d.top + "px";
            noloop.style.webkitTransform = "rotate(" + d.deg + "deg)"
        }
    });
    var animate5 = animateContext.createAnimate([{
        duration: 2000,
        delay: 2000,
        from: { top: 10, left: 400, deg: 0 },
        to: { top: 500, left: 400, deg: 360 },
        easing: 'easeInOutElastic',

    }
    ], {
        onstep: function (d) {
            speed.style.left = d.left + "px";
            speed.style.top = d.top + "px";
            speed.style.webkitTransform = "rotate(" + d.deg + "deg)"
        }
    });

    animate.completedCallback(animate1);

    animate1.completedCallback(animate2);
    animate2.completedCallback(animate3);
    animate3.completedCallback(animate4);
    animate4.completedCallback(animate5);

    /*控制*/

    speed.onclick = function () {
        for (var i = 0; i < allAnimates.length; i++) {
            allAnimates[i].setDuration(500);
            allAnimates[i].onstep(function (k) {

                return function () {

                    console.log(k);
                }
            }(i))
        }
    }
    stop.onclick = function () {
        animateContext.pause();
    }
    start.onclick = function () {
        animateContext.active();
    }

    loop.onclick = function () {
        animate.setRepeat(true);
    }
    noloop.onclick = function () {
        animate.setRepeat(false);
    }
    animateContext.startTimer();

});