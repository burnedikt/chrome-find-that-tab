'use strict';

// promises baby
var q = require('q');
// fuzzy search
var fuzzy = require('fuzzy');

module.exports = function(chrome) {
  return {
    /**
     * switchtes to the specified tab, then executes the callback function afterwards
     * @param  {chrome.tabs.Tab}   tab the tab to be selected / highlighted
     * @return {Promise}           a promise resolved as soon as the switch is done
     */
    switchToTab: function(tab) {
      var deferredTabSwitch = q.defer();
      chrome.tabs.highlight({
        windowId: tab.windowId,
        tabs: tab.index
      }, function(wndw) {
        chrome.windows.update(wndw.id, {
          focused: true
        }, deferredTabSwitch.resolve);
      });
      return deferredTabSwitch.promise;
    },
    /**
     * helper function to load all tabs via the chrome api
     * @return {Promise} the promise which will be resolved to all opened tabs
     */
    loadTabs: function() {
      // create a deferred object using the q-library
      var deferred = q.defer();

      /** @type {Object} options to query for tabs */
      var queryInfo = {
        //currentWindow: true
      };

      // find all tabs and resolve the promise when done
      chrome.tabs.query(queryInfo, function(tabs) {
        // filter the tabs to ignore the popup itself if it is in there
        tabs = tabs.filter(function(tab) {
          if (tab.title !== 'Find That Tab') {
            return true;
          }
          return false;
        });
        deferred.resolve(tabs);
      });

      // return the promise which will be resolved
      return deferred.promise;
    },
    /**
     * finds all tabs that are matched by the given input keyword
     * searches various attributes on any tab (e.g. title and url)
     * @param  {String} keyword               the input keyword
     * @param  {Array<chrome.tabs.Tab>} tabs  the list of tabs that should be searched
     * @param  {Array} attributes             optional parameter to specify which attributes of the tab to search
     * @return {Array<chrome.tabs.Tab>}       the filtered list of tabs that match the actual keyword
     */
    findMatchingTabs: function(keyword, tabs, attributes) {
      // scanned by default: title and url
      if (!attributes) {
        attributes = ['title', 'url'];
      }
      // consolidate results for all attributes
      // we can use the index attribute to match the tabs
      let matches = [];
      // performa fuzzy search for all attributes
      for (var j = attributes.length - 1; j >= 0; j--) {
        var options = { 
          pre: '<b>', 
          post: '</b>',
          /* jshint loopfunc:true */
          extract: function(el) { return el[attributes[j]]; }
          /* jshint loopfunc:false */
        };
        var results = fuzzy.filter(keyword, tabs, options);
        // consolidate matches by adding up score (with some factor)
        for (var i = 0; i < results.length; i++) {
          let res = results[i];
          // check if there is already an entry for this match in the matches list
          let match = matches.find(function(m) {
            return m.index === res.index;
          });
          // match is new
          if (!match) {
            match = res;
            // add it to the matches array
            matches.push(match);
          } else {
            // consolidate the scores now
            match.score += res.score; 
          }
          // save the version of the attribute with formatting on the tab
          match.original['highlighted-' + attributes[j]] = res.string;
        }
      }
      // resort the matches array based on score and reduce it to the tab data
      return matches.sort(function(a, b) {
        return b.score - a.score;
      }).map(function(m) {
        return m.original;
      });
    },
    /**
     * helper function to close the popup
     */
    closePopup: function () {
      const bgPage = chrome.extension.getBackgroundPage();
      if (bgPage) {
        return bgPage.closePopup();
      } else {
        return null;
      }
    }
  };
};
