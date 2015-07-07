'use strict';

// promises baby
var q = require('q');

function _createTypeAheadRegex(input) {
  // case-insensitive and global regex
  var chars = input.split('');
  var regex = '';
  if (chars.length) {
    for (var i = 0; i < chars.length - 1; i++) {
      regex += '(' + chars[i] + ')[^' + chars[i + 1] + ']*';
    }
    regex += '(' + chars[chars.length - 1] + ')';
  }
  console.log(regex);
  return new RegExp(regex, 'i');
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
      if ((false && urlMatch) || titleMatch) {
        console.log(titleMatch);
        tabs[i]._regExpMatch = titleMatch;
        matches.push(tabs[i]);
      }
    }

    // before returning the matches, sort them by the length of the matched string
    // shortest match = best match
    matches = matches.sort(function compareFunction(a, b) {
      var comparator = a._regExpMatch[0].length - b._regExpMatch[0].length;
      // if comparator is 0, take another condition, else return the comparator
      if (!comparator) {
        return (a._regExpMatch.index - b._regExpMatch.index);
      }
      return comparator;
    });

    console.log(matches);

    return matches;
  }
};
