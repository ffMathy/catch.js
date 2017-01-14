////// <reference path="./node_modules/@types/selenium-webdriver/index.d.ts" />

import * as webdriver from 'selenium-webdriver';

var by = webdriver.By;
var until = webdriver.until;

describe('catch.js', function() {
    var driver: webdriver.WebDriver;

    var getErrorObject = async function() {
        while(true) {

            console.log("Waiting for alert to show up...");
            await driver.wait(until.alertIsPresent());
            console.log("Alert is present.");

            var alertText = await driver.switchTo().alert().getText();
            console.log("Alert text fetched.", alertText);

            var response = <AlertResponse>JSON.parse(alertText);
            if(response.type === "error") {
                return <ErrorModel>response;
            }

            await driver.switchTo().alert().dismiss();
            switch(response.type) {
                case "click":
                    var clickCommand = <ClickCommand>response;
                    var targetElement = await driver.findElement(by.id(clickCommand.targetId));
                    console.log("Clicking element with ID \"" + clickCommand.targetId + "\"...");
                    await driver.actions().click(targetElement).perform();
                    break;

                default:
                    throw new Error("Unknown command!");
            }

        }
    };

    var useTest = async function(name: string) {
        console.log("Invoking " + name + "...");
        await driver.get('file:///' + process.cwd() + '/tests/' + name);
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
            console.log("Spawning driver...");
            driver = driverFactory();

            try {
                console.log("Running test...");
                await callback();
                console.log("No errors during test.");
            } finally {
                console.log("Killing driver...");
                driver.quit();
                driver = null;
            }
        }

        doneCallback();
    };

	it('should handle error-strings thrown from event handlers', async function(done) {
        await withEachDriver(done, async () => {
            await useTest('event.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("event error");
        });
	});

	it('should handle error-strings thrown from event handlers', async function(done) {
        await withEachDriver(done, async () => {
            await useTest('timeout.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Uncaught timeout error");
        });
	});

	it('should handle image not found', async function(done) {
        await withEachDriver(done, async () => {
            await useTest('image.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("An error occured while loading an IMG-tag.");
            expect(error.url).toEqual("http://invalid-url-that-doesnt-exist-at-all.com/");
        });
	});

	it('should handle script not found', async function(done) {
        await withEachDriver(done, async () => {
            await useTest('script.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Script error.");
        });
	});

	it('should handle ajax not found correctly', async function(done) {
        await withEachDriver(done, async () => {
            await useTest('xhr.html');

            var error = await getErrorObject();
            expect(error.message).toEqual("Script error.");
        });
	});
});

