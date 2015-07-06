'use strict';

// helpers
var helpers = require('./helpers.js');

/**
 * all the data that can be searched by the tabtype aheadr
 * will be modified whenever a new tab appears or is closed.
 * Is stored in the indexed DB
 * @type {Array}
 */
var searchableData = [];

helpers.loadTabs().then(function(tabs) {
  // the data to be searched are all tabs
  // this could be extended later on to support deeper searches (like parsing the data with contentscripts)
  searchableData = tabs;

  // as soon as tabs are known, listen to the input change
  document.getElementById('tabTypeAheadInput').addEventListener('input', function(e) {
    // whenever input is changed, filter the list of tabs
    helpers.findMatchingTabs(e.target.value, searchableData);
  }, true);
});
