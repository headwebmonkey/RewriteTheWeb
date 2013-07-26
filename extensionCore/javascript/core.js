//
// ReWrite The Web
//
// File: core.js
// Description: The main core of RWTW
// Contributors: Kody Peterson (headwebmonkey)
// 

var RWTW = {
   variables: {
      urls: {
         welcome: "http://headwebmonkey.github.io/RewriteTheWeb/welcome/",
         update: "http://headwebmonkey.github.io/RewriteTheWeb/update/",
         checkUpdate: "http://headwebmonkey.github.io/RewriteTheWeb/update/liveVersion.htm",
         bugReport: "https://github.com/headwebmonkey/RewriteTheWeb/issues/new"
      },
      logLevel: 5,
      sites: {}
   },
   // Logs to the console based on logLevel variable
   //
   // @namespace RWTW
   // @function getExtensionVersion
   // @param {String} type of log (DEBUG, INFO)
   // @param {String} content to be logged
   log: function(type, content){
      if (
         (type === "DEBUG" && this.variables.logLevel == 5) ||
         (type === "INFO" && this.variables.logLevel >= 4)
      ){
         console.log("["+type+"] "+content);
      }
   },
   // Check if an update is avaliable
   //
   // @namespace RWTW
   // @function checkForUpdates
   // @param {Boolean} should we notify the user
   checkForUpdates: function(silent) {
      var self = this;
      $.ajax({
         url: self.variables.checkUpdate,
         type: "get",
         success: function(text) {
            if(text != localStorage['version']){
               // A different version is avaliable - is it higher?
               if(text.replace(/\./g,'') > localStorage['version'].replace(/\./g,'')) {
                  // Yep! It is an update
                  self.log("INFO", "Update "+text+" Avaliable");
                  if(silent){
                     return true;
                  }else{
                     self.alert("Version "+text+" is avaliable!");
                  }
               }
            }
            self.log("INFO", "No Update Avaliable");
            if(silent){
               return false;
            }
         }
      });
   },
   // Load sites into memory
   //
   // @namespace RWTW
   // @function loadSites
   loadSites: function(){
      var sites = JSON.parse(localStorage['manifest']).web_accessible_resources;
      for (var i = 0; i < sites.length; i++) {
         var temp = sites[i].split("/");
         if(this.variables.sites[temp[1]] === undefined){
            this.variables.sites[temp[1]] = {};
         }
         if((sites[i].indexOf("css") !== -1 || sites[i].indexOf("js") !== -1) && sites[i].indexOf("json") === -1){
            this.variables.sites[temp[1]][Object.keys(this.variables.sites[temp[1]]).length] = sites[i];
         }
      }
   },
   // Render the contents of popup.htm
   //
   // @namespace RWTW
   // @function loadSites
   renderPopup: function() {
      var self = this;
      var popup = $("#popup").html('<p class="loading">Loading styles...</p>');
      this.loadSites();
      $("#popup").empty();
      var siteOnClick = function(event) {
         $(this).toggleClass("disabled");
      };
      for (var key in this.variables.sites) {
         console.log(key);
         var li = $('<li/>', {html: key, rel: key})
            .appendTo(popup)
            .click(siteOnClick);
         $('<span/>', {class:'icon'}).appendTo(li);
      }
      $('<li/>', {class: 'bugs', html: 'Submit Bug Report'})
         .appendTo(popup)
         .click(function(event) {
            chrome.tabs.create({
               active: true,
               url: self.variables.urls.bugReport
            }, function() {});
         });
   }
};

var GR_OLD = {
   json_name:     'GoogleRedesigned',
   json_url:      'http://www.globexdesigns.com/products/gr/extension/styles',
   mode:       'stable',
   updateInterval:   1800000,
   urlWelcome:    'http://www.globexdesigns.com/products/gr/?page=welcome',
   urlUpdate:     'http://www.globexdesigns.com/products/gr/changelogs.php',
   urlBugs:    'http://www.globexdesigns.com/bugtracker',
   urlStyles:     {
      'Gmail Redesigned':     [new RegExp(/^http(s)?:\/\/mail\.google\.[a-z]+\//)],
      'Gcal Redesigned':      [new RegExp(/^http(s)?:\/\/www\.google\.[a-z]+\/calendar\//)],
      'Greader Redesigned':   [new RegExp(/^http(s)?:\/\/www\.google\.[a-z]+\/reader\//)],
      'Gdocs Redesigned':     [new RegExp(/^http(s)?:\/\/drive\.google\.[a-z]+\//)],
      'G Redesigned':      [new RegExp(/^http(s)?:\/\/www\.google\.[a-z]+\//)]
   },


   // readJSON()
   // Loads in the latest JSON file. If one is not available in
   // the storage DB, will read the default file on disk
   readJSON: function(callback) {
      var self = this
      callback = callback || function() {}
      
      chrome.storage.local.get(null, function(items) {
         if (items[self.json_name]) {
            callback(items[self.json_name])
         } else {
            self.downloadJSON(function(GRJSON) {
               self.setJSON(GRJSON)
               callback(GRJSON)
            })
         }
      })
      
      return;
   },
   
   
   // setJSON()
   // Replaces the existing JSON file with a new one
   setJSON: function(GRJSON, callback) {
      var self = this
      if (!GRJSON) return
      callback = callback || function() {}
      
      data = {}
      data[this.json_name] = GRJSON
      
      chrome.storage.local.set(data, function() {
         self.enableAllStyles(callback)
      });
      
      return;
   },
   
   
   // enableAllStyles()
   // Sets all styles to enabled if nothing has been setup yet
   enableAllStyles: function(callback) {
      var self = this
      callback = callback || function() {}
      
      chrome.storage.local.get(null, function(items) {
         // If no styles set as enabled - enable all
         if (items['enabled']) {
            callback()
         } else {
            chrome.storage.local.get(self.json_name, function(items) {
               var GRJSON = items[self.json_name]
               enabled = {'enabled': []}
               for (var i = 0, l = GRJSON.length; i < l; i++) {
                  for (s in GRJSON[i]) {
                     if (s == 'images') {continue}
                     enabled['enabled'].push(s)
                  }
               }
               chrome.storage.local.set(enabled, function() {
                  callback()
               })
            })
         }
      })
   },
   
   
   // setStyle()
   // Saves a CSS string to the storage
   setStyle: function(style, css, callback) {
      callback = callback || function() {}
      data = {}
      data[style] = css
      chrome.storage.local.set(data, function() {
         callback()
      })
   },
   
   
   // renderPopup()
   // Given the extension's JSON object, render the popup menu
   renderPopup: function() {
      var self = this
      var popup = $("#popup").html('<p class="loading">Loading styles...</p><p class="note">Sometimes it may take up to 5 minutes to finish downloading the latest styles. Please wait.</p>')
      
      this.readJSON(function(GRJSON) {
         // Check options to ensure the right mode is set
         var settings = localStorage.settings ? JSON.parse(localStorage.settings) : {}
         if (settings.nightly) {
            this.mode = "dev";
         }
         
         $("#popup").empty()
         
         // Check which styles are enabled
         chrome.storage.local.get('enabled', function(data) {
            var enabled = data.enabled || null
            
            // If no enabled data exists -- everything is enabled
            if (!enabled) {
               enabled = []
               $.each(GRJSON, function(key, style) {
                  for (name in style) {
                     if (name == 'images') continue
                     enabled.push(name);
                  }
               })
            }
            
            // Styles
            $.each(GRJSON, function(key, style) {
               for (name in style) {
                  if (name == 'images') continue;
                  var data = style[name]
                  var li = $('<li/>', {html: name, rel: name}).appendTo(popup)
                     .click(function(event) {
                        self.toggleStyle($(this).attr('rel'))
                     })
                  
                  if (enabled.indexOf(name) < 0) {
                     li.addClass('disabled') 
                  }
                  
                  $('<span/>', {class:'version', html:data[self.mode]}).appendTo(li)
                  $('<span/>', {class:'icon'}).appendTo(li)
               }
            })
            
            // Check for style updates
            $('<li/>', {class: 'checker', html: 'Check For Style Updates'}).appendTo(popup)
               .click(function(event) {
                  self.checkForStyleUpdates()
               })
            
            // Submit Bug Report
            $('<li/>', {class: 'bugs', html: 'Submit Bug Report'}).appendTo(popup)
               .click(function(event) {
                  chrome.tabs.create({
                     active: true,
                     url: self.urlBugs
                  }, function() {})
               })
         })
      })
   },
   
   
   // setBrowserIcon()
   // Change the browser's icon
   setBrowserIcon: function(type) {
      type = type || 'default'
      if (type == 'loading') {
         chrome.browserAction.setIcon({"path":"img/icon-19-loading.gif"})
      } else {
         chrome.browserAction.setIcon({"path":"img/icon-19.png"})
      }
   },
   
   
   // msg()
   // Displays a 3 second notification message
   msg: function(text) {
      var notification = webkitNotifications.createNotification(
        chrome.extension.getURL('img/icon-32.png'),
        'Google Redesigned',
        text
      )
      notification.show();
      
      setTimeout(function(){
         notification.cancel()
      }, 5000);
   },
   
   
   
   // toggleStyle()
   // Toggles an individual style
   toggleStyle: function(style) {
      var self = this
      var popupitem = $("#popup li[rel='"+style+"']").first()
      popupitem.toggleClass('disabled')
      
      var on = true
      if (popupitem.hasClass('disabled')) {
         on = false
      }
      
      chrome.storage.local.get('enabled', function(data) {
         var enabled = []
         for (var i = 0, l = data.enabled.length; i < l; i++) {
            var s = data.enabled[i]
            if (s != style) {
               enabled.push(s)
            }
         }
         
         if (on && enabled.indexOf(style) < 0) {
            enabled.push(style);
         }
         
         chrome.storage.local.set({'enabled': enabled}, function() {
            // Look through open tabs, and toggle the styling in them
            self.updateTabs("toggleStyle")
         })
      })
   },
   
   
   // downloadJSON()
   // Download the latest JSON file from the server
   downloadJSON: function(callback) {
      var jsontime = new Date().toJSON().replace(/[A-Z-:\.]/g, "")
      $.ajax({
         url: this.json_url+"?rel=chrome&amp;time="+jsontime,
         type: "post",
         dataType: "text",
         success: function(GRJSON) {
                var t = {};
                t.images = {};
                t.images.url = "http://ec2-50-112-24-98.us-west-2.compute.amazonaws.com/img/";
                t.images.stable = "1.0.0";
                t.images.dev = "1.0.0";
                
                t["Gmail Redesigned"] = {};
                t["Gmail Redesigned"].url = "http://ec2-50-112-24-98.us-west-2.compute.amazonaws.com/css/";
                t["Gmail Redesigned"].css = "gmail";
                t["Gmail Redesigned"].stable = "5.0.16";
                t["Gmail Redesigned"].dev = "5.0.16";
                t["Gmail Redesigned"].bugs = "http://www.globexdesigns.com/bugtracker/4-gmail-redesigned";
                
                t["Gcal Redesigned"] = {};
                t["Gcal Redesigned"].url = "http://ec2-50-112-24-98.us-west-2.compute.amazonaws.com/css/";
                t["Gcal Redesigned"].css = "gcal";
                t["Gcal Redesigned"].stable = "5.0.3";
                t["Gcal Redesigned"].dev = "5.0.3";
                t["Gcal Redesigned"].bugs = "http://www.globexdesigns.com/bugtracker/5-gcal-redesigned";
                
                t["Greader Redesigned"] = {};
                t["Greader Redesigned"].url = "http://ec2-50-112-24-98.us-west-2.compute.amazonaws.com/css/";
                t["Greader Redesigned"].css = "greader";
                t["Greader Redesigned"].stable = "4.0.1";
                t["Greader Redesigned"].dev = "4.0.1";
                t["Greader Redesigned"].bugs = "http://www.globexdesigns.com/bugtracker/6-greader-redesigned";
                
                t["Gdocs Redesigned"] = {};
                t["Gdocs Redesigned"].url = "http://ec2-50-112-24-98.us-west-2.compute.amazonaws.com/css/";
                t["Gdocs Redesigned"].css = "gdocs";
                t["Gdocs Redesigned"].stable = "3.0.1";
                t["Gdocs Redesigned"].dev = "3.0.1";
                t["Gdocs Redesigned"].bugs = "http://www.globexdesigns.com/bugtracker/7-gdocs-redesigned";
                
                t["G Redesigned"] = {};
                t["G Redesigned"].url = "https://or-petek072-ml1.local:10088/gRedesign/";
                t["G Redesigned"].css = "google";
                t["G Redesigned"].stable = "1.0.0";
                t["G Redesigned"].dev = "1.0.0";
                t["G Redesigned"].bugs = "";
                
            callback(JSON.parse("["+JSON.stringify(t)+"]"));
         },
         error: function(xhr, text, err) {
            console.error('GR.downloadJSON() was unable to download JSON file from '+this.url+'. Reason: '+err);
         }
      });
   },
   
   
   // checkForStyleUpdates()
   // Checks for style updates by downloading JSON data
   // from Google Redesigned server
   checkForStyleUpdates: function(callback, silent) {
      var self = this
      silent = silent || false
      callback = callback || function() {}
      
      if (!silent) {
         this.setBrowserIcon('loading')
      }
      
      // Check options to ensure the right mode is set
      var settings = localStorage.settings ? JSON.parse(localStorage.settings) : {}
      if (settings.nightly) {
         this.mode = "dev";
      }
      
      this.downloadJSON(function(GRJSON) {
         var remoteJSON = GRJSON;
         self.setBrowserIcon()
         
         // Compare versions
         self.readJSON(function(oldJSON) {
            var updates = self.compareStyles(oldJSON, remoteJSON)
            
            chrome.storage.local.get(null, function(data) {
               // Check to see if anything has been downloaded yet
               var empty = false
               remoteJSON.forEach(function(st) {
                  for (key in st) {
                     if (key != 'images') {
                        if (!data[key]) empty = true
                     }
                  }
               })
               
               if (updates.length < 1 && self.mode != 'dev' && !empty) {
                  if (!silent) {
                     self.msg('No style updates found.')
                  }
                  callback()
               } else {
                  if (self.mode == 'dev' || empty) {
                     updates = []
                     for (var i = 0, l = remoteJSON.length; i < l; i++) {
                        for (key in remoteJSON[i]) {
                           if (key == 'images') continue
                           updates.push(key)
                        }
                     }
                  }
                  
                  self.setJSON(remoteJSON, function() {
                     self.renderPopup()
                     self.downloadStyles(updates, function() {
                        if (!silent) {
                           if (self.mode == 'dev') {
                              self.msg('All styles have been synced.')
                           } else {
                              self.msg('New style updates have been installed for: '+updates.join(', ')+'.')
                           }
                        }
                        
                        self.updateTabs("updateStyles")
                        
                        callback()
                     })
                  })
               }
            })
         })
      });
   },
   
   
   // compareStyles()
   // Compares version numbers between two JSON objects
   compareStyles: function(oldJSON, newJSON) {
      var newStyles = []
      for (var i = 0, l = oldJSON.length; i < l; i++) {
         for (key in oldJSON[i]) {
            if (key == 'images') continue
            for (var j = 0, m = newJSON.length; j < m; j++) {
               for (nkey in newJSON[j]) {
                  if (key == nkey) {
                     if (oldJSON[i][key][self.mode] != newJSON[j][nkey][self.mode]) {
                        newStyles.push(key)
                     }
                  }
               }
            }
         }
      }
      return newStyles
   },
   
   
   // downloadStyles()
   // Download CSS files from the data server
   downloadStyles: function(styles, callback) {
      var self = this
      var gathered = 0;
      var gather = function() {
         gathered++
         if (gathered == styles.length) {
            callback()  
         }
      }
      
      this.readJSON(function(GRJSON) {
         for (var i = 0, l = GRJSON.length; i < l; i++) {
            for (style in GRJSON[i]) {
               if (styles.indexOf(style) >= 0) {
                  var url = GRJSON[i][style].url+GRJSON[i][style].css+'_'+GRJSON[i][style][self.mode]+'.css?rel=chrome';
                  
                  var getEr = function(url, style) {
                     $.ajax({
                        url: url,
                        method: 'post',
                        success: function(css) {
                           // Strip the -moz-document from the style
                           css = css.replace(/@-moz-document(.*?){/,"")
                           css = css.substring(0, css.length-1)
                           
                           // Point insecure URLs to local image pack
                           css = css.replace(/http:\/\/[a-zA-Z0-9.-]+\.amazonaws\.com\/img\/2\.0\.0\//gi, chrome.extension.getURL('image-pack')+'/')
                           
                           self.setStyle(style, css, function() {
                              gather()
                           })
                        },
                        error: function(xhr, text, err) {
                           console.error(err)
                        }
                     })
                  }
                  
                  getEr(url, style);
               }
            }
         }
      })
   },
   
   
   // getStyleFromURL
   // Given a URL returns the style that shuold be loaded
   getStyleFromURL: function(url) {
      if (!url) return null
      for (style in this.urlStyles) {
         var regexps = this.urlStyles[style]
         for (var i = 0, l = regexps.length; i < l; i++) {
            if (url.match(regexps[i])) {
               return style
            }
         }
      }
   },
   
   
   // loadStyles()
   // Given an array of styles, load them (if they're not disabled)
   loadStyles: function(style, tab, callback) {
      tab = tab || null
      
      // Skip if disabled
      chrome.storage.local.get(null, function(items) {
         // On install, this sometimes get fired prematurely. Suppress it
         // if nothing has been enabled yet
         if (!items.enabled) {
            callback(null)
            return
         }
         
         var enabled = false
         for (var i = 0, l = items.enabled.length; i < l; i++) {
            if (style == items.enabled[i]) {enabled = true}
         }
         
         if (enabled) {
            var css = items[style];
            return callback(css);
            /*
            Unfortunately, insertCSS limits the allowed code and truncates
            the CSS data - making it corrupted.
            
            chrome.tabs.insertCSS(tab.id, {
               allFrames: true,
               code: css,
               runAt: "document_start"
            })
            */
         } else {
            callback(null)
         }
         
         return null
      })
   },
   
   
   // updateTabs()
   // Scans the open tabs and updates the styles from the JSON
   updateTabs: function(requestName) {
      var self = this
      chrome.tabs.query({}, function(tabs) {
         tabs.forEach(function(tab) {
            var style = self.getStyleFromURL(tab.url)
            if (!style) {return}
            GR.loadStyles(style, tab, function(css) {
               chrome.tabs.sendRequest(tab.id, {name: requestName, css: css})
            })
         })
      })
   }
}