define(function (require) {
   
    var timer = require("../../../tools/timer");
    var core = require("../../../animation/core");
    var tobj = new timer();
    var stop = $$("stop");
    function $$(id) {
        return document.getElementById(id);
    };
    var rect = $$("rect");
    function step(d) {
        rect.style.left = d.left + "px";
        rect.style.top = d.top + "px";
        rect.style.webkitTransform = "rotate(" + d.deg + "deg)"
    }
    var animate1 = new core({
        duration: 3000,
        from: { top: 300, left: 0, deg: 0 },
        to: { top: 300, left: 1000, deg: 360 },
        easing: 'easeInOutElastic',
        onstep: step,
    });
    var animate2 = new core({
        duration: 3000,
        from: { top: 300, left: 1000, deg: 0 },
        to: { top: 500, left: 1000, deg: 360 },
        easing: 'easeInOutElastic',
        onstep: step,
    });
    var animate3 = new core({
        duration: 3000,
        from: { w: 100, h: 100, deg: 1440 },
        to: { w: 200, h: 200, deg: 0 },
        easing: 'easeInOutElastic',
        onstep: function (d) {
            rect.style.width = d.w + "px";
            rect.style.height = d.h + "px";
            rect.style.webkitTransform = "rotate(" + d.deg + "deg)"
        }
    });
    animate1.start();
    animate1.oncompleted(function () {
        animate2.start();
    })
    animate2.oncompleted(function () {
        animate3.start();
    })
    var animate31 = animate3.animateReverse();
    var animate21 = animate2.animateReverse();
    var animate11 = animate1.animateReverse();
    animate3.oncompleted(function () {
        animate31.start();
    })
    animate31.oncompleted(function () {
        animate21.start();
    })
    animate21.oncompleted(function () {
        animate11.start();
    })
    animate11.oncompleted(function () {
        animate1.start();
    })

    function update() {
        animate1.update();
        animate2.update();
        animate3.update();
        animate11.update();
        animate21.update();
        animate31.update();

    }
    tobj.start(update);   
});