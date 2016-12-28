////// <reference path="./node_modules/@types/selenium-webdriver/index.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var webdriver = require("selenium-webdriver");
var by = webdriver.By;
var until = webdriver.until;
;
describe('catch.js', function () {
    var driver;
    var getErrorObject = function () {
        return __awaiter(this, void 0, void 0, function () {
            var alertText, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, driver.switchTo().alert().getText()];
                    case 1:
                        alertText = _a.sent();
                        error = JSON.parse(alertText);
                        return [2 /*return*/, error];
                }
            });
        });
    };
    var useTest = function (name) {
        driver.get('file:///' + process.cwd() + '/tests/' + name);
        driver.wait(until.elementLocated(by.id("container")));
        driver.actions().click(driver.findElement(by.id("container")));
        driver.wait(until.alertIsPresent());
    };
    var withEachDriver = function (doneCallback, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var drivers, _i, drivers_1, driverFactory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        drivers = new Array();
                        drivers.push(function () { return new webdriver.Builder()
                            .withCapabilities(webdriver.Capabilities.chrome())
                            .build(); });
                        _i = 0, drivers_1 = drivers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < drivers_1.length))
                            return [3 /*break*/, 6];
                        driverFactory = drivers_1[_i];
                        driver = driverFactory();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, callback()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        driver.quit();
                        driver = null;
                        return [7 /*endfinally*/];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        doneCallback();
                        return [2 /*return*/];
                }
            });
        });
    };
    it('should handle error-strings thrown from event handlers', function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, withEachDriver(done, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        useTest('event.html');
                                        return [4 /*yield*/, getErrorObject()];
                                    case 1:
                                        error = _a.sent();
                                        expect(error.message).toEqual("Uncaught event error");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle error-strings thrown from event handlers', function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, withEachDriver(done, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        useTest('timeout.html');
                                        return [4 /*yield*/, getErrorObject()];
                                    case 1:
                                        error = _a.sent();
                                        expect(error.message).toEqual("Uncaught timeout error");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle image not found', function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, withEachDriver(done, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        useTest('image.html');
                                        return [4 /*yield*/, getErrorObject()];
                                    case 1:
                                        error = _a.sent();
                                        expect(error.message).toEqual("An error occured while loading an IMG-tag.");
                                        expect(error.url).toEqual("http://invalid-url-that-doesnt-exist-at-all.com/");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle script not found', function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, withEachDriver(done, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        useTest('script.html');
                                        return [4 /*yield*/, getErrorObject()];
                                    case 1:
                                        error = _a.sent();
                                        expect(error.message).toEqual("Script error.");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
    it('should handle ajax not found correctly', function (done) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, withEachDriver(done, function () { return __awaiter(_this, void 0, void 0, function () {
                            var error;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        useTest('xhr.html');
                                        return [4 /*yield*/, getErrorObject()];
                                    case 1:
                                        error = _a.sent();
                                        expect(error.message).toEqual("Script error.");
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
