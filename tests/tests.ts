////// <reference path="./node_modules/@types/selenium-webdriver/index.d.ts" />

import * as webdriver from 'selenium-webdriver';

var by = webdriver.By;
var until = webdriver.until;

interface ErrorModel {
    message?: string;
    url?: string;
    line?: number;
    col?: number;
    error?: Error
};

describe('catch.js', function() {
    var driver: webdriver.WebDriver;

    var getErrorObject = async function() {
        var alertText = await driver.switchTo().alert().getText();
        var error = <ErrorModel>JSON.parse(alertText);
        return error;
    };

    var useTest = function(name: string) {
        driver.get('file:///' + process.cwd() + '/tests/' + name);
        driver.wait(until.elementLocated(by.id("container")));
        driver.actions().click(driver.findElement(by.id("container")));
        driver.wait(until.alertIsPresent());
    };

    var withEachDriver = async function(
        doneCallback: () => void, 
        callback: () => Promise<void>
    ) {
        var drivers = new Array<() => webdriver.WebDriver>();
        drivers.push(() => new webdriver.Builder()
            .withCapabilities(
                webdriver.Capabilities.chrome())
            .build());

        for(var driverFactory of drivers) {
            driver = driverFactory();

            try {
                await callback();
            } finally {
                driver.quit();
                driver = null;
            }
        }

        doneCallback();
    };

	it('should handle error-strings thrown from event handlers', async function(done) {
        await withEachDriver(done, async () => {
            useTest('event.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Uncaught event error");
        });
	});

	it('should handle error-strings thrown from event handlers', async function(done) {
        await withEachDriver(done, async () => {
            useTest('timeout.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Uncaught timeout error");
        });
	});

	it('should handle image not found', async function(done) {
        await withEachDriver(done, async () => {
            useTest('image.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("An error occured while loading an IMG-tag.");
            expect(error.url).toEqual("http://invalid-url-that-doesnt-exist-at-all.com/");
        });
	});

	it('should handle script not found', async function(done) {
        await withEachDriver(done, async () => {
            useTest('script.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Script error.");
        });
	});

	it('should handle ajax not found correctly', async function(done) {
        await withEachDriver(done, async () => {
            useTest('xhr.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Script error.");
        });
	});
});

