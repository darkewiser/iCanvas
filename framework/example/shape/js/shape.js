define(function (require) {
    var AnimateContext = require(" ../../../animation/animatecontext");
    var animateContext = new AnimateContext();
    var start = document.getElementById("start");
    var stop = document.getElementById("stop");
    var circle = document.getElementById("circle");
    var loop = document.getElementById("loop");
    var noloop = document.getElementById("noloop");
    var rect = document.getElementById("rect");
    var speed = document.getElementById("addSpeed");

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

    ], function (d) {
        circle.style.left = d.left + "px";
        circle.style.top = d.top + "px";
        circle.style.width = d.w + "px";
        circle.style.height = d.h + "px";
        circle.style.borderRadius = d.w / 2 + "px /" + d.h / 2 + "px"
    });

    var allAnimates= animate.getAnimates();



    var animate1=animateContext.createAnimate([{
        duration: 5000,
        from: { top: 300, left: 0, deg: 0 },
        to: { top: 300, left: 1000, deg: 360 },
        easing: 'easeInOutElastic',
        loop: true

    }
   

    ], function (d) {
        rect.style.left = d.left + "px";
        rect.style.top = d.top + "px";
        rect.style.webkitTransform = "rotate(" + d.deg + "deg)"
    });

    speed.onclick=function(){
        for(var i=0;i<allAnimates.length;i++)
        {
            allAnimates[i].setDuration(500);
            allAnimates[i].onstep(function(k){

                return function(){

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
        animate.setLoop(true);
    }
    noloop.onclick = function () {
        animate.setLoop(false);
    }
    animateContext.startTimer();
});