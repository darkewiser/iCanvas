/* 
 * 日志记录
 * @author MingLi (guomilo@gmail.com)
 *
 * window.debugMode 用于设置调试模式
   debugMode=0 不记录错误信息。
   debugMode=1 抛出异常，有浏览器处理。
   debugMode=2 在控制台输出。
   debugMode=3 弹出错误信息。
 *
 */

/*依赖 util.js */
var IR = IR || {};
(function (IR) {
    var tools = IR.Util;
    window.debugMode = 2;
    function Log() {
        if (typeof Log.instance == "undefined") {
            return getInstance.apply(this);
        }
        else {
            return Log.instance;
        }
        function getInstance() {
            Log.instance = this;

            this.write = function () {
                if (window.debugMode == 0) {
                    return;
                }
                else if (window.debugMode == 1) {
                    for (var k in arguments) {
                        throw new Error(arguments[k]);
                    }
                }
                else if (window.debugMode == 2) {
                    for (var k in arguments) {
                        console.log(arguments[k]);
                    }
                    console.log("")
                }
                else {
                    for (var k in arguments) {
                        alert(arguments[k]);
                    }
                }
            }
            return this;
        }
    }

    IR.Log = new Log();
})(IR)
