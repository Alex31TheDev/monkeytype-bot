import "geckodriver";
import { Builder, Browser, By, until } from "selenium-webdriver";

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isElementPresent(parent, locator) {
    try {
        return await parent.findElement(locator);
    } catch(err) {
        return false;
    }
}

const defaults = {
    testLength: 30,
    targetWpm: 100,
    targetAccuracy: 100
},
     alphabet = "abcdefghijklmnopqrstuvwxyz";

class MonkeytypeBot {
    constructor(options) {
        this.executed = false;
        this.url = "https://monkeytype.com/";
    }

    async setupDriver() {
        const driver = await new Builder().forBrowser(Browser.FIREFOX).build();
        return driver;
    }

    async closePopups() {
        await this.driver.findElement(By.className("button rejectAll")).click();

        try {
            const consent = By.linkText("Consent");
            await this.driver.wait(until.elementLocated(consent), 1000);
            await this.driver.findElement(consent).click();
        } catch(err) {}
        
        try {
            const consent = By.className(" css-47sehv");
            await this.driver.wait(until.elementLocated(consent), 1000);
            await this.driver.findElement(consent).click();
        } catch(err) {}

        while(await isElementPresent(this.driver, By.className("fas fa-fw fa-times"))) {
            await this.driver.findElement(By.className("fas fa-fw fa-times")).click();
        }

        await delay(100);
    }

    async changeSettings(testLength) {
        if(testLength === defaults.testLength) {
            return;
        }


    }

    async runTest(options) {
        Object.assign(options, {
            ...defaults,
            ...options
        });

        await this.changeSettings(options.testLength);

        let wait = 60 / options.targetWpm * 1000,
            wordsTyped = 0;

        wait -= wait * 0.1;
        const error = options.targetWpm - options.targetWpm * options.targetAccuracy / 100;

        const words = await this.driver.findElement(By.id("words")),
              body = await this.driver.findElement(By.tagName("body"));

        await words.click();

        while(await isElementPresent(words, By.className("word active"))) {
            const activeWord = await words.findElement(By.className("word active")),
                  letterElems = await activeWord.findElements(By.xpath(".//*")),
                  letters = Array(letterElems.length);

            for(const [i, letter] of letterElems.entries()) {
                letters[i] = await letter.getText();
            }

            if(options.targetAccuracy !== 100 && wordsTyped !== 0 && wordsTyped % error === 0) {
                letters[~~(Math.random() * letters.length)] = alphabet[~~(Math.random() * alphabet.length)];
            }

            await body.sendKeys(letters.join("") + " ");
            wordsTyped++;

            await delay(wait);
        }

        this.executed = true;
        return wordsTyped;
    }

    async setup() {
        this.driver = await this.setupDriver();
        
        try {
            await this.driver.get(this.url);
            await delay(100);

            await this.closePopups();
        } catch(err) {
            await this.quit();
            throw err;
        }
    }

    quit() {
        this.driver.quit();
    }
}

export default MonkeytypeBot;