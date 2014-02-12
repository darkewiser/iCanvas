/* 公共辅助函数
 *
 * @author MingLi (v-minggu@microsoft.com)
 *
 * getType: 获取对象的类型
 * isNumber:判定对象是否是Number
 * isFunction: 判定对象是否是function
 * isString: 判定对象是否是String
 * isUndefined: 判定对象是否是Undefined
 * isArray: 判定对象是否是Array
 * isBool:判定对象是否是boolean
 * isEmptyOrNullObject: 判定对象是否是空对象
 * isCanvas: 判定对象是否是HtmlCanvasElement
 * isHtmlElement: 判定对象是否是HtmlElement
 * isSvgElement: 判定对象是否是SvgElement,
 * isSvg: 判定对象是否是svg.<svg> </svg>
 * getStyles: 获取对象的style集合
 * inheritPrototype:继承对象的prototype
 * clone: 深度克隆
 * extend: 合并源对象的属性到目标对象
 * fireCustomEvent: 触发自定义事件
 * 
 */
define(function (require) {
    /*
    *获取对象的类型
    *@param  
    *@return 对象类型。
    */
    function getType(obj) {
        var type = typeof obj;
        if (type == "object") {
            type = Object.prototype.toString.call(obj);
            return type.replace(/^\[object\s*/gi, "").replace(/\]$/, "").toLowerCase();
        }
        else {
            return type.toLocaleLowerCase();
        }
    }


    /*
     *判定对象是否是Number
     *@return bool
   */
    function isNumber(obj) {
        return getType(obj) == "number";
    }
    /*
     *判定对象是否是Number
     *@return bool
   */
    function isBool(obj) {
        return getType(obj) == "boolean";
    }
    /*
    *判定对象是否是function
    *@return bool
    */
    function isFunction(func) {
        return getType(func) == "function";
    }
    /*
   *判定对象是否是undefined
   *@return bool
   */
    function isUndefined(obj) {
        var _type = getType(obj);
        return _type == "undefined" || _type == "null";
    }
    /*
   *判定对象是否是Array
   *@return bool
   */
    function isArray(obj) {
        return getType(obj) == "array";
    }
    /*
   *判定对象是否是空对象
   *@return bool
   */
    function isEmptyOrNullObject(obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    }
    /*
     *判定对象是否是object
     *@return bool
     */
    function isObject(obj) {

        return typeof obj == "object" && getType(obj) == "object";

    }
    /*
   *判定对象是否是string
   *@return bool
   */
    function isString(obj) {
        return getType(obj) == "string";
    }
    /*
   *判定对象是否是canvas
   *@return bool
   */
    function isCanvas(obj) {
        return isHtmlElement(obj) && getType(obj) == "htmlcanvaselement"
    }
    /*
   *判定对象是否是Html Element
   *@return bool
   */
    function isHtmlElement(obj) {
        return getType(obj).search(/^html[a-z]*?element$/) >= 0;
    }
    /*
   *判定对象是否是svg Element.例 <rect />, <g/>
   *@return bool
   */
    function isSvgElement(obj) {
        return getType(obj).search(/^svg[a-z]*?element$/) >= 0;
    }
    /*
   *判定对象是否是svg.<svg> </svg>
   *@return bool
   */
    function isSvg(obj) {
        return getType(obj).search(/^svgsvgelement$/) >= 0;
    }

    /*
    *获取对象的style集合
    *@param  HtmlElement，SvgElement 或者 自定义控件
    *@return {}    
    */
    var getStyles = (function () {
        if (window.getComputedStyle) {
            return function (ele) {
                return isHtmlElement(ele) ? window.getComputedStyle(ele) :
                       isSvgElement(ele) ? ele : ele.style || ele;
            }
        }
        else {
            return function (ele) {
                return isHtmlElement(ele) ? ele.currentStyle :
                       isSvgElement(ele) ? ele : ele.style || ele;
            }
        }
    })();
    /*
    *继承指定对象的prototype。
    *
    *@param:子类
    *@param:父类，可以有多个。
    *
    */
    function inheritPrototype(subType) {
        var args = Array.prototype.slice.call(arguments, 1),
            prototype;
        if (getType(args) == "undefined" || args.length == 0) {
            return;
        }
        if (!("create" in Object)) {
            Object.create = function (obj) {
                function F() { };
                F.prototype = obj;
                return new F();
            }
        }
        for (var i = 0, ci; ci = args[i]; i++) {
            prototype = Object.create(ci.prototype);
            prototype.constructor = subType;
            for (var p in prototype) {
                subType.prototype[p] = prototype[p];
            }
        }
    }

    /*
    function swap(obj1,obj2)
    {
        var tmp;
        tmp=isObject(obj1)?clone(obj1):obj1;
        obj1=isObject(obj2)?clone(obj2):obj2;
        obj2=tmp;
    }*/


    /**
    * 对一个object进行深度拷贝
    * @param {Any} source 需要进行拷贝的对象
    * @return {Any} 拷贝后的新对象
    */
    function clone(source) {
        // buildInObject, 用于处理无法遍历Date等对象的问题
        var buildInObject = {
            '[object Function]': 1,
            '[object RegExp]': 1,
            '[object Date]': 1,
            '[object Error]': 1,
            '[object CanvasGradient]': 1
        },
        result = source, i, len;
        if (!source
            || source instanceof Number
            || source instanceof String
            || source instanceof Boolean
        ) {
            return result;
        }
        else if (source instanceof Array) {
            result = [];
            var resultLen = 0;
            for (i = 0, len = source.length; i < len; i++) {
                result[resultLen++] = this.clone(source[i]);
            }
        }
        else if ('object' == typeof source) {
            if (buildInObject[Object.prototype.toString.call(source)]
               || source.__nonRecursion
            ) {
                return result;
            }
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = this.clone(source[i]);
                }
            }
        }
        return result;
    }
    /**
    * 合并源对象的属性到目标对象    
    * @param {*} target 目标对象
    * @param {*} source 源对象    
    * @param {boolean} optOptions.recursive 是否递归  
    */
    function extend(target, source, recursive) {
        var target = arguments[0] || {}, i = 1, length = arguments.length, source, name;

        for (; i < length; i++) {
            if ((source = arguments[i]) != null) {
                for (name in source) {
                    if (recursive && !isArray(source[name]) && getType(source[name]) == "object") {
                        target[name] = arguments.callee(target[name], source[name])
                    }
                    else if (recursive && isArray(source[name])) {
                        if (name in target) {
                            if (isArray(target[name])) {
                                target[name] = target[name].concat(source[name]);
                            }
                            else {
                                var tarry = [];
                                target[name] = tarry.concat(target[name]).concat(source[name]);
                            }
                        }
                        else {
                            target[name] = source[name];
                        }
                    }
                    else if (recursive && isArray(target[name])) {
                        target[name] = target[name].concat(source[name]);
                    }
                    else {
                        target[name] = source[name];
                    }
                }
            }
        }
        return target;
    }
    /*
    * 触发自定义的事件
    *@param: 事件的类型
    *@param: 事件的目标
    *@param: 事件参数
    */
    var fireCustomEvent = (function () {
        if ("createEvent" in document) {
            return function (type, target, args) {
                var cEvent = document.createEvent('Event');
                cEvent.initEvent(type, true, true);
                for (var o in args) {
                    cEvent[o] = args[o];
                }
                target.dispatchEvent(cEvent);
            }
        }
        else {
            return function (type, target, args) {

                var cEvent = document.createEventObject();
                for (var o in args) {
                    cEvent[o] = args[o];
                }
                target.fireEvent(type, cEvent);
            }
        }
    })();

    /*******Start*************/
    /* if the browser does not support bind method of function object ,
    ** add a bind method for all  function object .
    ** the method can change caller of function object
    */
    if (!("bind" in Function)) {
        Function.prototype.bind = function () {
            var args = Array.prototype.slice.call(arguments);
            var obj = args.shift();
            var _method = this;
            return function () {
                return _method.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
            }
        }
    }

    function bind(func, caller) {
        if (isFunction(func) && !isUndefined(caller)) {
            return func.bind(caller);
        }
        else {
            return func;
        }
    }

    /*
     * 生成GUID 
    */
    function newId() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }


    return {
        getType: getType,
        isFunction: isFunction,
        isString: isString,
        isNumber: isNumber,
        isUndefined: isUndefined,
        isObject: isObject,
        isArray: isArray,
        isBool: isBool,
        isEmptyOrNullObject: isEmptyOrNullObject,
        isCanvas: isCanvas,
        isHtmlElement: isHtmlElement,
        isSvgElement: isSvgElement,
        isSvg: isSvg,
        getStyles: getStyles,
        inheritPrototype: inheritPrototype,
        clone: clone,
        extend: extend,
        bind: bind,
        newId:newId,
        fireCustomEvent: fireCustomEvent
    }

});