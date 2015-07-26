'use strict';

// classnames
var classNames = require('classnames');
// helpers
var helpers = require('./helpers.js')(chrome);
// ReactJS for Rendering
// jshint unused:false
var React = require('../bower_components/react/react.min.js');
// promises baby
var q = require('q');

///////////////////////////////////
// Key codes for various buttons //
///////////////////////////////////
const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_RETURN = 13;
const KEY_ESCAPE = 27;

//////////////////////
// layout variables //
//////////////////////
const TAB_ITEM_HEIGHT = 63;
const COLLECTION_HEIGHT = 298;

////////////////////
// React elements //
////////////////////

/** React Element for one Tab in the list */
var Tab = React.createClass({
  /**
   * handler function for clicks on this item / tab. will forward the event to the parent handler
   * @param  {Event} e the click event
   */
  clickHandler: function(e) {
    // forward click event on one tab item to the tab list
    this.props.clickHandler(e, this.props.data);
  },
  render: function() {
    var classes = classNames({
      tab: true,
      'collection-item': true,
      avatar: true,
      active: this.props.data._active
    });
    /*jshint ignore:start */
    return (
      <li href="#!" className={classes} onClick={this.clickHandler}>
        <img src={this.props.data.favIconUrl} alt="" className="circle" />
        <span className="title truncate" dangerouslySetInnerHTML={{__html: (this.props.data['highlighted-title']||this.props.data.title)}} />
        <p className="truncate" dangerouslySetInnerHTML={{__html: (this.props.data['highlighted-url']||this.props.data.url)}} />
      </li>
    );
    /*jshint ignore:end */
  }
});

/** React Element for the list of tabs */
var TabList = React.createClass({
  /**
   * handler function for clicks on one tab item in the list, will forward the event to the parent handler
   * @param  {Event} e the click event
   */
  clickHandler: function(e, tabData) {
    // forward the click event from any tab item to the parent application
    this.props.itemClickHandler(e, tabData);
  },
  render: function() {
    var tabNodes = this.props.tabs.map(function(tab) {
      /*jshint ignore:start */
      return (
        <Tab key={tab.id} data={tab} clickHandler={this.clickHandler} />
      );
      /*jshint ignore:end */
    }.bind(this));
    /*jshint ignore:start */
    return (
      <ul className="collection">
        {tabNodes}
      </ul>
    );
    /*jshint ignore:end */
  }
});

/** React Element for the input field / typeahead */
var OpenAnyTabInput = React.createClass({
  /**
   * handler function for any input in the input field, will trigger filtering the tabs by forwarding the event 
   * to the parent element
   * @param  {Event} e the input event
   */
  handleInput: function(e) {
    this.props.onInputChange(e.target.value);
  },
  render: function() {
    /*jshint ignore:start */
    return (
      <input type="text" id="tabTypeAheadInput" className="validate" onInput={this.handleInput} autoFocus />
    );
    /*jshint ignore:end */
  }
});

/** React Element - Main Element containing all other elements */
var OpenAnyTab = React.createClass({
  /**
   * @return {Object} Initial component state
   */
  getInitialState: function() {
    return {
      tabs: [],
      _tabs: [],
      activeTabIdx: 0
    };
  },
  /**
   * function called as soon as the component has been mounted, i.e. when rendering is done
   * used to register event listeners and store references to rendered DOM Elements
   */
  componentDidMount: function() {
    // load all currently open tabs, as soon as the popup is loaded
    this.loadTabs().finally(function() {
      // also make sure to listen on keydown events for navigation, as soon as we have all tabs
      // we need arrows for navigation and return to confirm
      document.body.addEventListener('keydown', this.keydownHandler);
    }.bind(this));
    // find the actual dom node of the tab list
    this._tablistDOMNode = this.refs.tablist.getDOMNode();
  },
  /**
   * handler function for any keydown event
   * - switches to the currently selected tab on RETURN key
   * - rotates between tabs in the list on UP and DOWN arrows
   * @param  {Event} e the keydown event
   */
  keydownHandler: function(e) {
    if (e.keyCode === KEY_DOWN) {
      // prevent scrolling
      e.preventDefault();
      // switch to next tab in list (if there is any)
      this._highlightTabAtIndex(this.state.activeTabIdx + 1);
    } else if (e.keyCode === KEY_UP) {
      // prevent scrolling
      e.preventDefault();
      this._highlightTabAtIndex(this.state.activeTabIdx - 1);
    } else if (e.keyCode === KEY_RETURN) {
      // forward this event to a submit
      this.submitHandler(e);
    }
  },
  /**
   * handler function for submit events on the openanytab form
   * triggers a switch to the currently selected element
   * @param  {Event} e the submit event
   */
  submitHandler: function(e) {
    if (e.nativeEvent) {
      // only try to stop the event from bubbling and triggering default actions if there is a matching native event
      e.preventDefault();
      e.stopPropagation();
    }
    helpers.switchToTab(this.state.tabs[this.state.activeTabIdx]).then(helpers.closePopup);
  },
  /**
   * helper function to load all available and opened tabs as soon as the component is rendered
   * @return {Promise} returns a promise that will be resolved to the list of tabs
   */
  loadTabs: function() {
    return helpers.loadTabs().then(function(tabs) {
      // store initial tabs and current tabs
      this.setState({
        _tabs: tabs,
        tabs: tabs
      });
      // highlight first tab per default
      this._highlightTabAtIndex(0);
    }.bind(this));
  },
  /**
   * handler function for input events
   * this function will trigger filtering the list according to the new keyword (input) any time the input changes
   * @param  {String} keyword the contents of the input field
   */
  inputChangeHandler: function(keyword) {
    var tabs = helpers.findMatchingTabs(keyword, this.state._tabs);
    // set the tabs
    this._updateTabs(tabs).then(function() {
      // highlight first tab per default
      this._highlightTabAtIndex(0);
    }.bind(this));
  },
  /**
   * updates the internal state to display the updated list of tabs
   * @param  {Array<chrome.tabs.Tab>} newTabs the list of tabs to be displayed
   * @return {Promise}                        promise that will be resolved as soon as the internal state is updated
   */
  _updateTabs: function(newTabs) {
    var deferred = q.defer();
    this.setState({
      tabs: newTabs
    }, deferred.resolve);
    return deferred.promise;
  },
  /**
   * highlights the tab identified by its index in the list of tabs
   * @param  {Number}   idx The index of the tab in the array of tabs
   * @return {Promise}      promise that will be resolved as soon as the tab is highlighted
   */
  _highlightTabAtIndex: function(idx) {
    var deferredHighlighting = q.defer();
    // index sanitization
    if (idx >= this.state.tabs.length) {
      idx = 0;
    } else if (idx < 0) {
      idx = this.state.tabs.length - 1;
    }
    // get a reference to the currently stored tab list
    var _tabs = this.state.tabs;
    // unhighlight the currently active / highlighted tab
    _tabs[this.state.activeTabIdx]._active = false;
    // highlight the newly selected one
    _tabs[idx]._active = true;
    // update the state with the new data
    // store the newly selected index
    this.setState({
      tabs: _tabs,
      activeTabIdx: idx
    }, function() {
      // make sure to keep the highlighted tab in the visible bounds
      var upperBorder = (idx) * TAB_ITEM_HEIGHT;
      var lowerBorder = (idx + 1) * TAB_ITEM_HEIGHT;
      var upperScrollBorder = this._tablistDOMNode.scrollTop;
      var lowerScrollBorder = upperScrollBorder + COLLECTION_HEIGHT;
      if (lowerBorder > lowerScrollBorder) {
        // if the lower border of the current item passed the lower border of the collection, scroll down to show
        // all of the item
        this._tablistDOMNode.scrollTop = (idx + 1) * TAB_ITEM_HEIGHT - COLLECTION_HEIGHT;
      } else if (upperBorder < upperScrollBorder) {
        // if the upper border of the current item passed the upper border of the collection, scroll up a bit to show
        // all of the item
        this._tablistDOMNode.scrollTop = (idx) * TAB_ITEM_HEIGHT;
      }
      // finally execute the callback
      deferredHighlighting.resolve();
    }.bind(this));
    return deferredHighlighting.promise;
  },
  /**
   * handler function for any click on a item in the list of tabs
   * @param  {Event} e                 the click event
   * @param  {chrome.tabs.Tab} tabData the tab which has been clicked
   */
  itemClickHandler: function(e, tabData) {
    // determine index of clicked element
    var idx = this.state.tabs.indexOf(tabData);
    this._highlightTabAtIndex(idx).then(function() {
      // highlight this item and do a submit
      this.submitHandler(e);
    }.bind(this));
  },
  render: function() {
    /*jshint ignore:start */
    return (
      <div className="container">
        <div className="row">
          <form className="col s12" onSubmit={this.submitHandler} >
            <div className="row">
              <div className="input-field col s12">
                <i className="material-icons prefix">search</i>
                <OpenAnyTabInput onInputChange={this.inputChangeHandler} />
                <label htmlFor="tabTypeAheadInput">Just type ahead ...</label>
              </div>
            </div>
          </form>
        </div>
        <div className="row">
          <div className="col s12">
            <TabList ref="tablist" tabs={this.state.tabs} itemClickHandler={this.itemClickHandler}/>
          </div>
        </div>
      </div>
    );
    /*jshint ignore:end */
  }
});
/*jshint ignore:end */

/**
 * all the data that can be searched by the tabtype aheadr
 * will be modified whenever a new tab appears or is closed.
 * Is stored in the indexed DB
 * @type {Array}
 */
var searchableData = [];

document.addEventListener('DOMContentLoaded', function() {
  /*jshint ignore:start */
  // render the whole shit
  React.render(
    <OpenAnyTab />,
    document.getElementById('output')
  );
  /*jshint ignore:end */
});

// bind a listener to the escape key to be able to always close the popup directly
// this behavior is already default for the browser action so we'll only do it for the popup solution
document.body.addEventListener('keydown', function keydownEvent(e) {
  if (e.keyCode === KEY_ESCAPE) {
    // get the popup
    chrome.windows.getLastFocused(function callback(wndw) {
      console.info(wndw);
      // close the popup, but only if it is one
      if (wndw.type === 'popup') {
        // unfocus the window and the BG script will close it automatically
        helpers.closePopup();
      }
    });
  }
});
