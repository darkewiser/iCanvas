var animationMgr = function () {
    var first, last;
    return {
        save: function (animation) {
            if (!animation) {
                return;
            }
            if (!first) {
                first = animation;
                last = animation;
                return;
            }
            last.Next = animation;
            last = animation;
        }
        , start: function () {
            first.start();
        }
        , loop: function () {
            this.save(first);
        }
    }

}();