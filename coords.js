browser.browserAction.onClicked.addListener(() => {
    let tabId;

    browser.tabs.query({ currentWindow: true, active: true})
    .then(tabs => { 
        tabId = tabs[0].id;
        return browser.tabs.sendMessage(tabId, {message: "Start"});
    })
    .then()
    .catch(err => {
        browser.tabs.insertCSS({file: "coords.css"})
        .then(() => browser.tabs.executeScript(tabId, {file: "lib/browser-polyfill.min.js"}))
        .then(() => browser.tabs.executeScript(tabId, {file: "lib/pixi.min.js"}))
        .then(() => browser.tabs.executeScript(tabId, {file: "lib/pixi_helper.js"}))
        .then(() => browser.tabs.executeScript(tabId, {file: "main.js"}))
        .then(() => browser.tabs.sendMessage(tabId, {message: "Start"}))
        .then()
        .catch(err => console.error(`Error: ${err}`));
    });
});