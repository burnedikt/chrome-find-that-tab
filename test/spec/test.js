(function () {
  'use strict';

  /* global beforeEach */


  // mock chrome
  var chrome = {
    extension: {
      getBackgroundPage: function () {
        return {
          closePopup: function () {}
        };
      }
    }
  };

  // helpers
  var helpers = require('../../app/scripts/helpers.js')(chrome);
  // fuse
  var Fuse = require('../../app/bower_components/fuse.js/src/fuse.js');
  // assertions
  var expect = require('chai').expect;

  describe('Tab Search Algorithm', function () {

    /** @type {Array} list of tabs to be searched */
    var _tabs = [
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
    var tabs = [];
    var fuse = null;

    describe('should only match facebook', function () {
      var keyword = 'face';

      // reset tabs before each testcase
      beforeEach(function () {
        tabs = _tabs.slice();
        fuse = new Fuse(tabs, {
          keys: [
            'title'
          ]
        });
      });

      it('should work with our regex', function () {
        // use the helpers function to filter the tablist
        var filtered = helpers.findMatchingTabs(keyword, tabs);
        expect(filtered.length).to.be.equal(1, 'should only have one element');
        expect(filtered[0].title).to.contain('Facebook');
      });

      it('should work with fuse', function () {
        var filtered = fuse.search(keyword);
        expect(filtered.length).to.be.equal(1, 'should only have one element');
        expect(filtered[0].title).to.contain('Facebook');
      });
    });

    describe('should match chai assertion and extensions, extensions rated higher', function () {
      var keyword = 'sio';

      // reset tabs before each testcase
      beforeEach(function () {
        tabs = _tabs.slice();
        fuse = new Fuse(tabs, {
          keys: [
            'title'
          ]
        });
      });

      it('should work with our regex', function () {
        // use the helpers function to filter the tablist
        var filtered = helpers.findMatchingTabs(keyword, tabs);
        expect(filtered.length).to.be.equal(2, 'should only have one element');
        expect(filtered[0].title).to.contain('Extensions');
        expect(filtered[1].title).to.contain('Chai');
      });

      it('should work with fuse', function () {
        var filtered = fuse.search(keyword);
        expect(filtered.length).to.be.equal(2, 'should only have one element');
        expect(filtered[0].title).to.contain('Extensions');
        expect(filtered[1].title).to.contain('Chai');
      });
    });
  });
})();
