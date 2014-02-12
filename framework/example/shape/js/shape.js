define(function (require) {
    var timer = require("../../../tools/timer");
    var core = require("../../../animation/core");
    var tobj = new timer();
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

    var animate1 = new core({
        duration: 2000,
        from: { top: 50, left: 500, w: 100, h: 100 },
        to: { top: 500, left: 500, w: 20, h: 20 },
        onstep: step
    });
    var animate2 = new core({
        duartion: 3000,
        from: { top: 500, left: 500, w: 20, h: 20 },
        to: { top: 500, left: 1000, w: 50, h: 50 },
        onstep: step
    });
    var animate3 = new core({
        duartion: 3000,
        from: { top: 500, left: 1000, w: 50, h: 50 },
        to: { top: 50, left: 500, w: 100, h: 100 },
        easing: 'easeInOutElastic',
        onstep: step
    });
    function step(d) {
        circle.style.left = d.left + "px";
        circle.style.top = d.top + "px";
        circle.style.width = d.w + "px";
        circle.style.height = d.h + "px";
        circle.style.borderRadius = d.w / 2 + "px /" + d.h / 2 + "px"
    }   

    animate1.start();
    animate1.oncompleted(function () {
        animate2.start();
    })
    animate2.oncompleted(function () {
        animate3.start();
    })
    animate3.oncompleted(function () {
        animate1.start();
    })

    function update() {
        animate1.update();
        animate2.update();
        animate3.update();
    }
    tobj.start(update);


  

    /*控制*/

    speed.onclick = function () {

    }
    stop.onclick = function () {
        animate1.pause();
        animate2.pause();
        animate3.pause();
    }
    start.onclick = function () {
        animate1.active();
        animate2.active();
        animate3.active();
    }  
  

});