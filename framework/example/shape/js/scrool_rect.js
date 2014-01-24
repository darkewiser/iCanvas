define(function (require) {
    var AnimateContext = require(" ../../../animation/animatecontext");
    var animateContext = new AnimateContext();
    var stop = $$("stop");
    function $$(id) {
        return document.getElementById(id);
    };
    
    var animate1 = animateContext.createAnimate(
        [
            {
                duration: 3000,
                from: { top: 300, left: 0, deg: 0 },
                to: { top: 300, left: 1000, deg: 360 },
                easing: 'easeInOutElastic',
                loop:0
            },
            {
                duration: 3000,
                from: { top: 300, left: 1000, deg: 0 },
                to: { top: 500, left: 1000, deg: 360 },
                easing: 'easeInOutElastic'
            },
            {
                duration: 3000,
                from: { w: 100, h: 100, deg: 1440 },
                to: { w: 200, h: 200, deg: 0 },
                easing: 'easeInOutElastic',
                onstep: function (d) {
                    rect.style.width = d.w + "px";
                    rect.style.height = d.h + "px";
                    rect.style.webkitTransform = "rotate(" + d.deg + "deg)"
                }
            }
        ],
        {
            onstep: function (d) {
                rect.style.left = d.left + "px";
                rect.style.top = d.top + "px";
                rect.style.webkitTransform = "rotate(" + d.deg + "deg)"
            }            
        },
        false);

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
        }
        
    }

);     
   animate1.completedCallback(animate2);    
    animateContext.startTimer();
});