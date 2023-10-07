import MonkeytypeBot from "./MonkeytypeBot.js";

(async _ => {
    const bot = new MonkeytypeBot();
    await bot.setup();
    console.log(await bot.runTest({
        targetWpm: 500,
        targetAccuracy: 10,
        testLength: 30
    }));
})();

