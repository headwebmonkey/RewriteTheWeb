//
// ReWrite The Web
//
// File: apply.js
// Description: Injected on all pages if we are "fixing" the website
// Contributors: Kody Peterson (headwebmonkey)
// 

// Injects the css/js into the current document
//
// @function applyCSSJS
// @param {Object} JSON object for site containing files to be injected
var applyCSSJS = function(site) {
    console.log("APPLY CALLED");
    var id = location.href.replace("http://", "").replace("https://", "").replace(/\//g, '_').replace(/\./g, '_');
    temp = id.split("?");
    id = temp[0];
    if(id.slice(-1) == "_"){
        id = id.substring(0, id.length - 1);
    }
    $.ajax({
         url: "chrome-extension://pommjepgielmmlkhfgdhdddkfhkdohfg/sites/"+location.hostname+"/manifest.json",
         type: "get",
         success: function(text) {
            if(JSON.parse(text).jQuery){
                var script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.setAttribute("id", "RWTW");
                script.setAttribute("src", "chrome-extension://pommjepgielmmlkhfgdhdddkfhkdohfg/extensionCore/javascript/jquery.js");
                script.onload = function(){
                    var script = document.createElement("script");
                    script.innerHTML = "$(function() {$('body').addClass('"+id+"');});";
                    document.documentElement.appendChild(script);
                    loadCSSJS(site);
                };
                document.documentElement.appendChild(script);
            }else{
                document.addEventListener( "DOMContentLoaded", function(){
                    document.removeEventListener( "DOMContentLoaded", arguments.callee, false );
                    document.getElementsByTagName('body')[0].className+=" "+id;
                }, false );
                loadCSSJS(site);
            }
        }
    });
};

var loadCSSJS = function(site){
    for (var i = 0; i < Object.keys(site).length; i++) {
        if(site[i].indexOf("css") !== -1){
            var style = document.createElement("link");
            style.setAttribute("rel", "stylesheet");
            style.setAttribute("id", "RWTW");
            style.setAttribute("href", "chrome-extension://pommjepgielmmlkhfgdhdddkfhkdohfg/"+site[i]);
            document.documentElement.appendChild(style);
        }else if(site[i].indexOf("js") !== -1 && site[i].indexOf("jquery") === -1){
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("id", "RWTW");
            script.setAttribute("src", "chrome-extension://pommjepgielmmlkhfgdhdddkfhkdohfg/"+site[i]);
            document.documentElement.appendChild(script);
        }
    }
};

// Removes all RWTW styles
//
// @function removeCSS
var removeCSS = function() {
     var style = $('#RWTW');
     style.remove();
};

// When any tab is loaded will send request to extension
//
// @function removeCSS
chrome.extension.sendRequest({name:"loadStyles"}, function(response) {
    applyCSSJS(response);
});

// When a website is toggled via the popup, or on update check
//
// @function removeCSS
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
     if (request.name == 'toggleStyle') {
            if (request.css) {
                 applyCSS(request.css);
            } else {
                 removeCSS();
            }
     } else if (request.name == 'updateStyles') {
            removeCSS();
            applyCSS(request.css);
     }
});