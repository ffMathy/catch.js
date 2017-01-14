var CatchJs = (function () {
    function CatchJs() {
        var _this = this;
        this.onError = function (messageOrEvent, url, line, col, error) {
            if (typeof messageOrEvent === 'ErrorEvent') {
                _this.onError(messageOrEvent.message, messageOrEvent.filename, messageOrEvent.lineno, messageOrEvent.colno, messageOrEvent.error);
                return;
            }
            for (var _i = 0, _a = _this.listeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                try {
                    listener(messageOrEvent, url, line, col, error);
                }
                catch (ex) {
                }
            }
        };
        this.listeners = new Array();
    }
    CatchJs.getInstance = function () {
        if (this.instance)
            return this.instance;
        var newInstance = new CatchJs();
        this.instance = newInstance;
        newInstance.inject();
        return newInstance;
    };
    CatchJs.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    CatchJs.prototype.inject = function () {
        this.onWindowLoad();
    };
    CatchJs.prototype.onWindowLoad = function () {
        this.handleGlobal();
        this.handleXMLHttp();
        this.handleImage();
        this.handleScript();
        this.handleEvents();
    };
    CatchJs.prototype.handleGlobal = function () {
        var onErrorOriginal = window.onerror;
        window.onerror = function (msg, url, line, col, error) {
            CatchJs.instance.onError(msg, url, line, col, error);
            if (onErrorOriginal)
                return onErrorOriginal.apply(null, arguments);
        };
    };
    CatchJs.prototype.handleXMLHttp = function () {
        var addEventListenerOriginal = XMLHttpRequest.prototype.addEventListener;
        var sendOriginal = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.addEventListener = function (type, listener, useCapture) {
            var _this = this;
            var originalListener = listener;
            listener = function (ev) {
                originalListener.apply(_this, ev);
            };
            return addEventListenerOriginal(type, listener, useCapture);
        };
        XMLHttpRequest.prototype.send = function () {
            CatchJs.instance.handleAsync(this);
            return sendOriginal.apply(this, arguments);
        };
    };
    CatchJs.prototype.handleImage = function () {
        var ImageOriginal = Image;
        Image = ImageOverride;
        function ImageOverride() {
            var img = new ImageOriginal;
            CatchJs.instance.wrapInTimeout(function () {
                CatchJs.instance.handleAsync(img);
            });
            return img;
        }
    };
    CatchJs.prototype.handleScript = function () {
        var HTMLScriptElementOriginal = HTMLScriptElement;
        HTMLScriptElement = HTMLScriptElementOverride;
        function HTMLScriptElementOverride() {
            var script = new HTMLScriptElement;
            CatchJs.instance.wrapInTimeout(function () {
                CatchJs.instance.handleAsync(script);
            });
            return script;
        }
    };
    CatchJs.prototype.handleEvents = function () {
        var addEventListenerOriginal = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = addEventListener;
        var removeEventListenerOriginal = EventTarget.prototype.removeEventListener;
        EventTarget.prototype.removeEventListener = removeEventListener;
        function addEventListener(event, handler, bubble) {
            var handlerx = wrap(handler);
            return addEventListenerOriginal.call(this, event, handlerx, bubble);
        }
        function removeEventListener(event, handler, bubble) {
            handler = handler._withError || handler;
            removeEventListenerOriginal.call(this, event, handler, bubble);
        }
        function wrap(fn) {
            fn._withError = withError;
            function withError() {
                try {
                    fn.apply(this, arguments);
                }
                catch (e) {
                    CatchJs.instance.onError(e);
                    throw e;
                }
            }
            return withError;
        }
    };
    CatchJs.prototype.handleAsync = function (obj) {
        var onErrorOriginal = obj.onerror;
        obj.onerror = onError;
        var onAbortOriginal = obj.onabort;
        obj.onabort = onAbort;
        var onLoadOriginal = obj.onload;
        obj.onload = onLoad;
        function onError(event) {
            var message = "An error occured while loading an " + event.srcElement.tagName.toUpperCase() + "-tag.";
            var srcElementAny = event.srcElement;
            var url = srcElementAny.src || null;
            CatchJs.instance.onError(message, url, null, null, null);
            if (onErrorOriginal)
                return onErrorOriginal.apply(this, arguments);
        }
        ;
        function onAbort(error) {
            CatchJs.instance.onError.call(this, error);
            if (onAbortOriginal)
                return onAbortOriginal.apply(this, arguments);
        }
        ;
        function onLoad(request) {
            if (request.status && request.status >= 400) {
                CatchJs.instance.onError.call(this, request);
            }
            if (onLoadOriginal)
                return onLoadOriginal.apply(this, arguments);
        }
    };
    CatchJs.prototype.wrapInTimeout = function (fn) {
        setTimeout(fn, 0);
    };
    return CatchJs;
}());
