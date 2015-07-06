'use strict';

// promises baby
var q = require('q');

function _createTypeAheadRegex(input) {
  // case-insensitive and global regex
  return new RegExp(input.split('').join('.*'), 'gi');
}

module.exports = {
  switchToTab: function(tab) {
    chrome.tabs.highlight({
      windowId: tab.windowId,
      tabs: tab.index
    }, function() {
      console.log('tab switched');
    });
  },
  loadTabs: function() {
    // create a deferred object using the q-library
    var deferred = q.defer();

    /** @type {Object} options to query for tabs */
    var queryInfo = {
      //currentWindow: true
    };

    // find all tabs and resolve the promise when done
    chrome.tabs.query(queryInfo, function(tabs) {
      deferred.resolve(tabs);
    });

    // return the promise which will be resolved
    return deferred.promise;
  },
  findMatchingTabs: function(keyword, tabs) {
    var regex = _createTypeAheadRegex(keyword);

    var matches = [];
    var urlMatch = null;
    var titleMatch = null;

    for (var i = tabs.length - 1; i >= 0; i--) {
      // check url first
      urlMatch = tabs[i].url.match(regex);
      // check title if there wasn'a match yet
      titleMatch = tabs[i].title.match(regex);
      // if we found anything, put it to the stack
      if (urlMatch||titleMatch) {
        console.log(urlMatch, titleMatch);
        matches.push(tabs[i]);
      }
    }

    console.log(matches);

    return matches;
  }
};
