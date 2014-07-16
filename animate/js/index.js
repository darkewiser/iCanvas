function $$(id) {
    return document.getElementById(id);
}


var aniContxt = new IR.Animation();

var animate1 = aniContxt.create({
    from: { top: 50, left: 500, w: 100, h: 100 },
    to: { top: 150, left: 400, w: 10, h: 10 },
    easing: "easeOutBounce",
    delay: 0,
    duration: 2000
});
var animate2 = aniContxt.create({
    from: { top: 300, left: 0 },
    to: { top: 300, left: 800, deg: 720 },
    easing: "easeOutBounce",
    delay: 0,
    duration: 2000
});
animate2.onframe(function (d) {
    $$("rect").style.cssText = "top:" + d.top + "px;left:" + d.left + "px;-webkit-transform:rotate(" + d.deg + "deg);-webkit-transform-origin:top";
});
animate1.onframe(function (d) {
    $$("circle").style.cssText = "top:" + d.top + "px;left:" + d.left + "px;width:" + d.w + "px;height:" + d.h + "px";
});
animate1.oncompleted(function () {
    //console.log(Date.now());
    animate2.start();
})
animate1.start();
//console.log(Date.now());


aniContxt.start();