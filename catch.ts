declare interface CatchJsOptions {
    correlationId?: {
        enabled: boolean;
        headerName?: string;
    }
}

class CatchJs {
    private static instance: CatchJs;

    private listeners: Array<ErrorEventHandler>;
    private options: CatchJsOptions;

    constructor() {
        this.listeners = new Array<ErrorEventHandler>();
    }

    public static getInstance(options?: CatchJsOptions) {
        if(!options) {
            options = {};
            if(!options.correlationId) {
                options.correlationId = { enabled: true };
                if(!options.correlationId.headerName) {
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
        this.handleDocumentCreate();
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
            if (onErrorOriginal) return onErrorOriginal.apply(window, arguments);
        };
    }

    private createCorrelationId() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    private handleXMLHttp() {
        var addEventListenerOriginal = XMLHttpRequest.prototype.addEventListener;
        var sendOriginal = XMLHttpRequest.prototype.send;

        type CorrelatedXMLHttpRequest = {
            _correlationId: string;
        };

        var globalCorrelationId: string = null;

        XMLHttpRequest.prototype.send = function (this: XMLHttpRequest & CorrelatedXMLHttpRequest) {
            this._correlationId = globalCorrelationId || CatchJs.instance.createCorrelationId();

            var onreadystatechangeOriginal = this.onreadystatechange;
            this.onreadystatechange = (ev) => {
                var oldGlobalCorrelationId = globalCorrelationId;
                if(!globalCorrelationId) {
                    globalCorrelationId = this._correlationId;
                }
                if(onreadystatechangeOriginal) {
                    onreadystatechangeOriginal.call(this, ev);
                }
                globalCorrelationId = oldGlobalCorrelationId;
            };

            if(CatchJs.instance.options.correlationId.enabled) {
                this.setRequestHeader(CatchJs.instance.options.correlationId.headerName, this._correlationId);
            }

            CatchJs.instance.handleAsync(this);
            sendOriginal.apply(this, arguments);
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

    private handleDocumentCreate() {
        var createElementOriginal = document.createElement;
        document.createElement = <any>createElementOverride;

        function createElementOverride(tag: string) {
            var element = createElementOriginal.call(document, tag);
            CatchJs.instance.wrapInTimeout(function () { 
                CatchJs.instance.handleAsync(element); 
            });
            return element;
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

            return withError;
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
            var tagName = event.srcElement.tagName;

            var srcElementAny = <any>event.srcElement;
            var url: string = srcElementAny.src || null;

            var message: string;
            if(tagName) {
                message = `An error occured while loading an ${tagName.toUpperCase()}-element.`;
            } else {
                message = `An error occured while fetching an AJAX resource.`;
            }

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