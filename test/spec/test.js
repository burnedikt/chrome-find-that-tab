(function () {
  'use strict';

  /* global expect */

  // helpers
  // we need the chrome mock for helpers.js
  // jshint unused:false
  var chrome = require('chrome-mock');
  var helpers = require('../../.tmp/scripts/helpers.js');

  describe('Tab Search Algorithm', function () {

    /** @type {Array} list of tabs to be searched */
    var tabs = [
      {
        title: 'Facebook',
        url: 'http://www.facebook.com'
      },
      {
        title: 'Assertion Styles - Chai',
        url: 'http://chaijs.com/guide/styles/'
      },
      {
        title: 'Extensions',
        url: 'chrome://extensions'
      }
    ];

    console.log(helpers);
    console.log(tabs);

    describe('using own regex', function () {
      it('should work', function () {
        expect(true).to.be.equal(true);
      });
    });

    describe('using fuzzy search / Fuse', function () {
      it('should work', function () {
        expect(true).to.be.equal(true);
      });
    });
  });
})();
