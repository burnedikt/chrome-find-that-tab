'use strict';

// classnames
var classNames = require('classnames');
// helpers
var helpers = require('./helpers.js');
// ReactJS for Rendering
// jshint unused:false
var React = require('react');
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

var Tab = React.createClass({
  clickHandler: function(e) {
    // forward click event on one tab item to the tab list
    this.props.handleClick(e, this.props.data);
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
        <span className="title truncate" dangerouslySetInnerHTML={{__html: (this.props.data.displayTitle||this.props.data.title)}} />
        <p className="truncate">{this.props.data.url}</p>
      </li>
    );
    /*jshint ignore:end */
  }
});

var TabList = React.createClass({
  handleClick: function(e, tabData) {
    // forward the click event from any tab item to the parent application
    this.props.handleItemClick(e, tabData);
  },
  render: function() {
    var tabNodes = this.props.tabs.map(function(tab) {
      /*jshint ignore:start */
      return (
        <Tab key={tab.id} data={tab} handleClick={this.handleClick} />
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

var OpenAnyTabInput = React.createClass({
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

var OpenAnyTab = React.createClass({
  getInitialState: function() {
    return {
      tabs: [],
      _tabs: [],
      activeTabIdx: 0
    };
  },
  componentDidMount: function() {
    // load all currently open tabs, as soon as the popup is loaded
    this.loadTabs().finally(function() {
      // also make sure to listen on keydown events for navigation, as soon as we have all tabs
      // we need arrows for navigation and return to confirm
      document.body.addEventListener('keydown', this.handleKeydownEvent);
    }.bind(this));
    // find the actual dom node of the tab list
    this._tablistDOMNode = this.refs.tablist.getDOMNode();
  },
  handleKeydownEvent: function(e) {
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
      this.handleSubmit(e);
    }
  },
  handleSubmit: function(e) {
    if (e.nativeEvent) {
      // only try to stop the event from bubbling and triggering default actions if there is a matching native event
      e.preventDefault();
      e.stopPropagation();
    }
    helpers.switchToTab(this.state.tabs[this.state.activeTabIdx], helpers.closePopup);
  },
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
  handleInputChange: function(keyword) {
    var tabs = helpers.findMatchingTabs(keyword, this.state._tabs);
    // set the tabs
    this._updateTabs(tabs).then(function() {
      // highlight first tab per default
      this._highlightTabAtIndex(0);
    }.bind(this));
  },
  _updateTabs: function(newTabs) {
    var deferred = q.defer();
    this.setState({
      tabs: newTabs
    }, function() {
      deferred.resolve();
    });
    return deferred.promise;
  },
  _highlightTabAtIndex: function(idx, cb) {
    if (typeof cb !== 'function') {
      cb = function() {};
    }
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
      cb();
    }.bind(this));
  },
  handleItemClick: function(e, tabData) {
    // determine index of clicked element
    var idx = this.state.tabs.indexOf(tabData);
    this._highlightTabAtIndex(idx, function() {
      // highlight this item and do a submit
      this.handleSubmit(e);
    }.bind(this));
  },
  render: function() {
    /*jshint ignore:start */
    return (
      <div className="container">
        <div className="row">
          <form className="col s12" onSubmit={this.handleSubmit} >
            <div className="row">
              <div className="input-field col s12">
                <i className="material-icons prefix">search</i>
                <OpenAnyTabInput onInputChange={this.handleInputChange} />
                <label htmlFor="tabTypeAheadInput">Just type ahead ...</label>
              </div>
            </div>
          </form>
        </div>
        <div className="row">
          <div className="col s12">
            <TabList ref="tablist" tabs={this.state.tabs} handleItemClick={this.handleItemClick}/>
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
