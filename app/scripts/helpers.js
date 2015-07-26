'use strict';

// promises baby
var q = require('q');

/**
 * helper function to create the regex which is applied to any searchable information based on the given input keyword
 * @param  {String} input The input keyword to search for
 * @return {RegExp}       The regular expression which can be used for searching
 */
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
  return new RegExp(regex, 'i');
}

/**
 * function to highlight the given string / char
 * @param  {String|Char} char The char / string to be highlighted
 * @return {String}           highlighted version of the char / string
 */
function replacer(char) {
  return '<strong>' + char + '</strong>';
}

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
     * @return {Array<chrome.tabs.Tab>}       the filtered list of tabs that match the actual keyword
     */
    findMatchingTabs: function(keyword, tabs) {
      var regex = _createTypeAheadRegex(keyword);

      var matches = [];
      var urlMatch = null;
      var titleMatch = null;

      for (var i = tabs.length - 1; i >= 0; i--) {
        // unselect the tab per default
        tabs[i]._active = false;
        // check url first
        urlMatch = tabs[i].url.match(regex);
        // check title if there wasn'a match yet
        titleMatch = tabs[i].title.match(regex);
        // if we found anything, put it to the stack
        if ((false && urlMatch) || titleMatch) {
          tabs[i]._regExpMatch = titleMatch;

          var _highlightPlease = Array.prototype.slice.call(titleMatch, 1);
          // highlight all the matched chars in the matched substring
          var tempTitle = titleMatch[0];
          var tempRegex;
          for (var j = 0; j < _highlightPlease.length; j++) {
            // create the regex for this char
            tempRegex = new RegExp(_highlightPlease[j]  + '(?!\\*\\*)');
            // replace the char with it's highlighted version (use *'s for the highlithing)
            tempTitle = tempTitle.replace(tempRegex, '**$&**');
          }
          // finally replace all '**'s by <strong> blocks
          tempTitle = tempTitle.replace(/\*\*([^\*])\*\*/gi, replacer);
          // now insert the modified, highlighted string into the whole title and save it
          var newTitle = tabs[i].title.split('');
          // use splice to insert the highlighted string into the array while removing the old stuff
          newTitle.splice(titleMatch.index, titleMatch[0].length, tempTitle);
          // finally save the recreated string
          tabs[i].displayTitle = newTitle.join('');
          // and save the match
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

      return matches;
    },
    /**
     * helper function to close the popup
     */
    closePopup: chrome.extension.getBackgroundPage().closePopup
  };
};
