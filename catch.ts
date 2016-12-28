class CatchJs {
    private static instance: CatchJs;

    private listeners: Array<ErrorEventHandler>;

    constructor() {
        this.listeners = new Array<ErrorEventHandler>();
    }

    static getInstance() {
        if (this.instance) return this.instance;

        var newInstance = new CatchJs();
        this.instance = newInstance;

        newInstance.inject();

        return newInstance;
    }

    public addListener(listener: ErrorEventHandler) {
        this.listeners.push(listener);
    }

    private inject() {
        this.onWindowLoad();
    }

    private onWindowLoad() {
        this.handleGlobal();
        this.handleXMLHttp();
        this.handleImage();
        this.handleScript();
        this.handleEvents();
    }

    private onError = (messageOrEvent: string|ErrorEvent, url?: string, line?: number, col?: number, error?: Error) => {
        if(typeof messageOrEvent === 'ErrorEvent') {
            this.onError(messageOrEvent.message, messageOrEvent.filename, messageOrEvent.lineno, messageOrEvent.colno, messageOrEvent.error);
            return;
        }

        for(var listener of this.listeners) {
            try {
                listener(messageOrEvent, url, line, col, error);
            } catch (ex) {
                //suppressed.
            }
        }
    }

    private handleGlobal() {
        var onErrorOriginal = window.onerror;
        window.onerror = function (msg, url, line, col, error) {
            CatchJs.instance.onError(msg, url, line, col, error);
            if (onErrorOriginal) return onErrorOriginal.apply(null, arguments);
        };
    }

    private handleXMLHttp() {
        var sendOriginal = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            CatchJs.instance.handleAsync(this);
            return sendOriginal.apply(this, arguments);
        };
    }

    private handleImage() {
        var ImageOriginal = Image;
        Image = <any>ImageOverride;

        function ImageOverride() {
            var img = new ImageOriginal;
            CatchJs.instance.wrapInTimeout(function () { 
                CatchJs.instance.handleAsync(img); 
            });
            return img;
        }
    }

    private handleScript() {
        var HTMLScriptElementOriginal = HTMLScriptElement;
        HTMLScriptElement = <any>HTMLScriptElementOverride;

        function HTMLScriptElementOverride() {
            var script = new HTMLScriptElement;
            CatchJs.instance.wrapInTimeout(function () { 
                CatchJs.instance.handleAsync(script); 
            });
            return script;
        }
    }

    private handleEvents() {
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
                } catch (e) {
                    CatchJs.instance.onError(e);
                    throw e;
                }
            }
        }
    }

    private handleAsync(obj) {
        var onErrorOriginal = obj.onerror;
        obj.onerror = onError;

        var onAbortOriginal = obj.onabort;
        obj.onabort = onAbort;

        var onLoadOriginal = obj.onload;
        obj.onload = onLoad;

        function onError(event: Event) {
            var message = `An error occured while loading an ${event.srcElement.tagName.toUpperCase()}-tag.`;

            var srcElementAny = <any>event.srcElement;
            var url: string = srcElementAny.src || null;

            CatchJs.instance.onError(message, url, null, null, null);
            if (onErrorOriginal) return onErrorOriginal.apply(this, arguments);
        };

        function onAbort(error) {
            CatchJs.instance.onError.call(this, error);
            if (onAbortOriginal) return onAbortOriginal.apply(this, arguments);
        };

        function onLoad(request) {
            if (request.status && request.status >= 400) {
                CatchJs.instance.onError.call(this, request);
            }
            if (onLoadOriginal) return onLoadOriginal.apply(this, arguments);
        }
    }

    private wrapInTimeout(fn) {
        setTimeout(fn, 0);
    }

}