//
// ReWrite The Web
//
// File: background.js
// Description: Functions to support the background.htm file
// Contributors: Kody Peterson (headwebmonkey)
// 

// Check for first install or update
//
// @namespace utils
// @function getExtensionVersion
// @param {String} currentVersion Installed
utils.getExtensionVersion(function(version) {
    RWTW.loadSites();
    var prevVersion = localStorage['version'] ? localStorage['version'] : null;
    if (version != prevVersion) {
        localStorage['version'] = version;
        if (typeof prevVersion == 'undefined') {
            // The extension was just installed - Say Hi!
            utils.openURLInNewTab(RWTW.variables.urls.welcome);
        } else {
            // The extension was just updated - Show changeLog
            utils.openURLInNewTab(RWTW.variables.urls.update);
        }
    }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log("onRequest Called");
    RWTW.log("INFO", "Requested URL: "+sender.tab.url);
    var domain = sender.tab.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
    if(RWTW.variables.sites[domain] !== undefined){
        RWTW.log("INFO", "Site Exists: "+domain);
        sendResponse(RWTW.variables.sites[domain]);
    }
});

RWTW.log("INFO", "Background Loaded");
// Check for updates onload
chrome.storage.local.clear();
//RWTW.checkForUpdates(false);