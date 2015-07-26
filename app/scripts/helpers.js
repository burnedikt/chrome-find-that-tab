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
 * repacer function to highlight the given string / char
 * this function is an argument to the Regexp.replace function and gets to parameters:
 * - match
 * - char
 * @param  {String|Char} match the latest match
 * @return {String}            highlighted version of the char / string
 */
function replacer(charMatch) {
  return '<b>' + charMatch + '</b>';
}

/**
 * helper function to highlight any matched chars in a string using the regex result
 * @param  {RegExp} regExpMatch the result of the executed regular expression
 * @return {String}             the initial string with every matched char highlighted
 */
function highglightMatches(regExpMatch) {
  // the result of the RegExp.match is an Array with
  // - the complete matched string / subsctring on index 0
  // - all matched chars one by one on the following indizes
  // we want to highlight every matched char, so we remove the first entry (complete match)
  /** @type {Array} list of all chars to be highlighted */
  var _highlightPlease = Array.prototype.slice.call(regExpMatch, 1);
  // highlight all the matched chars in the matched substring
  /** @type {String} The matched substring in which the chars are to be highlighted */
  var tempString = regExpMatch[0];
  var tempRegex = null;
  // loop over all matched chars to highlight them
  for (var j = 0; j < _highlightPlease.length; j++) {
    // only find chars that are not followed by a highlight tag (</b>) and surround them with the highlight tag
    tempRegex = new RegExp('(' + _highlightPlease[j]  + ')(?!>|<\/b>)');
    tempString = tempString.replace(tempRegex, replacer);
  }
  // now insert the modified, highlighted string into the whole string and save it
  // to do so, use array concatenation and split the initial string into parts first
  var newString = regExpMatch.input.split('');
  // use splice to insert the highlighted string into the array while removing the old stuff
  // due to the regexp match we know exactly where the matched subtitle started, so we will insert our highlighted
  // version instead of the old, unhighlighted matched part of the string
  newString.splice(regExpMatch.index, regExpMatch[0].length, tempString);
  // finally convert the title array back to a string
  return newString.join('');
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
     * @param  {Array} attributes             optional parameter to specify which attributes of the tab to search
     * @return {Array<chrome.tabs.Tab>}       the filtered list of tabs that match the actual keyword
     */
    findMatchingTabs: function(keyword, tabs, attributes) {
      if (!attributes) {
        attributes = ['title', 'url'];
      }
      /** @type {RegExp} get the regular expression used to perform a search on any tab */
      var regex = _createTypeAheadRegex(keyword);
      /** @type {Array} list of tabs matching the keyword */
      var matches = [];
      /** @type {Array} Array to store all matches on any attribute specified by attributes */
      var regExpMatches = [];
      // loop over all tabs
      for (var i = tabs.length - 1; i >= 0; i--) {
        // reset the matches for any tab
        regExpMatches = [];
        // unselect the tab per default
        tabs[i]._active = false;
        /** @type {RegExp} temporary variable to store intermediate regexp results */
        var regExpMatch = null;
        // run regex on all specified attributes and store the results
        for (var ii = attributes.length - 1; ii >= 0; ii--) {
          // run the regex
          regExpMatch = tabs[i][attributes[ii]].match(regex);
          // if we have a match, store the regex, else discard it
          if (regExpMatch) {
            regExpMatch._type = attributes[ii];
            regExpMatches.push(regExpMatch);
            // highlight any matches
            tabs[i]['highlighted-' + attributes[ii]] = highglightMatches(regExpMatch);
          }
        }
        // if we found anything, put it to the stack
        if (regExpMatches.length) {
          // store all information about any matches on the tab
          tabs[i]._regExpMatches = regExpMatches;
          // and save the matched tab
          matches.push(tabs[i]);
        }
      }

      // before returning the matches, sort them according to the awesomeness of their match
      // 3 levels of comparison are defined
      // 1. compare the lengths of the matched substrings -> the shorter the substrings the more exact the match
      // 2. compare the indizes of the matched substrings within the original string --> the lower the index, the better
      //    the match
      // 3. compare the sheer number of matched substrings in attributes, e.g. a match in title and url is rated highter
      //    than just a match in the title
      matches = matches.sort(function compareFunction(a, b) {
        // title should be more important than url
        var weights = {
          url: 0.5,
          title: 1
        };
        // loop over all matches and compare their matched lengths
        var aLength = 0, bLength = 0;
        for (var i = a._regExpMatches.length - 1; i >= 0; i--) {
          aLength += a._regExpMatches[i][0].length * weights[a._regExpMatches[i]._type];
          if (b._regExpMatches[i]) {
            bLength += b._regExpMatches[i][0].length * weights[b._regExpMatches[i]._type];
          }
        }
        var firstComparator = aLength - bLength;
        // if firstComparator is 0, take another condition, else return the first comparator
        if (!firstComparator) {
          // loop over all matches and compare their matched indizes
          var aIndex = 0, bIndex = 0;
          for (var j = a._regExpMatches.length - 1; j >= 0; j--) {
            aIndex += a._regExpMatches[j].index * weights[a._regExpMatches[j]._type];
            if (b._regExpMatches[i]) {
              bIndex += b._regExpMatches[j].index * weights[b._regExpMatches[j]._type];
            }
          }
          var comparator = aIndex - bIndex;
          // if length is equal for both, take another condition, else return the comparator
          if (!comparator) {
            return -1 * (a._regExpMatches.length - b._regExpMatches.length);
          }
          return comparator;
        }
        console.info(firstComparator, a, b);
        return firstComparator;
      });

      return matches;
    },
    /**
     * helper function to close the popup
     */
    closePopup: chrome.extension.getBackgroundPage().closePopup
  };
};
