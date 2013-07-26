//
// ReWrite The Web
//
// File: apply.js
// Description: Injected on all pages if we are "fixing" the website
// Contributors: Kody Peterson (headwebmonkey)
// 

var utils = {
   // Returns the current extension version value
   //
   // @namespace utils
   // @function getExtensionVersion
   // @param {Function} function to be calles on success
   getExtensionVersion: function(callback) {
      $.ajax({
         url: "/manifest.json",
         type: "get",
         success: function(text) {
            var temp = text.split("\n");
            //Loop through and remove comments so that we can parse the JSON
            for (var i = 0; i < temp.length; i++) {
               if(temp[i].replace(/^\s+/,'')[0] == "/" || temp[i] === ""){
                  delete temp[i];
               }
            }
            text = temp.join("\n");
            localStorage['manifest'] = text;
            callback(JSON.parse(text).version);
         }
      });
   },

   // Opens a new Chrome tab to the given URL
   //
   // @namespace utils
   // @function openURLInNewTab
   // @param {String} url to be opened in a new tab
   openURLInNewTab: function(url) {
      chrome.tabs.create({url:url});
   }
};