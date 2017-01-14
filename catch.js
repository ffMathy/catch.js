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
    CatchJs.getInstance = function (options) {
        if (!options) {
            options = {};
            if (!options.correlationId) {
                options.correlationId = { enabled: true };
                if (!options.correlationId.headerName) {
                    options.correlationId.headerName = "X-CATCHJS-CORRELATION-ID";
                }
            }
        }
        if (this.instance) {
            this.instance.options = options;
            return this.instance;
        }
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
        this.handleDocumentCreate();
        this.handleEvents();
    };
    CatchJs.prototype.handleGlobal = function () {
        var onErrorOriginal = window.onerror;
        window.onerror = function (msg, url, line, col, error) {
            CatchJs.instance.onError(msg, url, line, col, error);
            if (onErrorOriginal)
                return onErrorOriginal.apply(window, arguments);
        };
    };
    CatchJs.prototype.createCorrelationId = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
    CatchJs.prototype.handleXMLHttp = function () {
        var addEventListenerOriginal = XMLHttpRequest.prototype.addEventListener;
        var sendOriginal = XMLHttpRequest.prototype.send;
        var globalCorrelationId = null;
        XMLHttpRequest.prototype.send = function () {
            var _this = this;
            this._correlationId = globalCorrelationId || CatchJs.instance.createCorrelationId();
            var onreadystatechangeOriginal = this.onreadystatechange;
            this.onreadystatechange = function (ev) {
                var oldGlobalCorrelationId = globalCorrelationId;
                if (!globalCorrelationId) {
                    globalCorrelationId = _this._correlationId;
                }
                if (onreadystatechangeOriginal) {
                    onreadystatechangeOriginal.call(_this, ev);
                }
                globalCorrelationId = oldGlobalCorrelationId;
            };
            if (CatchJs.instance.options.correlationId.enabled) {
                this.setRequestHeader(CatchJs.instance.options.correlationId.headerName, this._correlationId);
            }
            CatchJs.instance.handleAsync(this);
            sendOriginal.apply(this, arguments);
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
    CatchJs.prototype.handleDocumentCreate = function () {
        var createElementOriginal = document.createElement;
        document.createElement = createElementOverride;
        function createElementOverride(tag) {
            var element = createElementOriginal.call(document, tag);
            CatchJs.instance.wrapInTimeout(function () {
                CatchJs.instance.handleAsync(element);
            });
            return element;
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
        var onLoadOriginal = obj.onload;
        obj.onload = onLoad;
        function onError(event) {
            var message = "An error occured.";
            var url = null;
            if (event) {
                var tagName = null;
                if (event.srcElement) {
                    tagName = event.srcElement.tagName;
                }
                var srcElementAny = event.srcElement;
                url = srcElementAny.src || null;
                if (tagName) {
                    message = "An error occured while loading an " + tagName.toUpperCase() + "-element.";
                }
                else {
                    message = "An error occured while fetching an AJAX resource.";
                }
            }
            CatchJs.instance.onError(message, url, null, null, null);
            if (onErrorOriginal)
                return onErrorOriginal.apply(this, arguments);
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
