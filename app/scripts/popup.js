'use strict';

// classnames
var classNames = require('classnames');
// helpers
var helpers = require('./helpers.js');
// ReactJS for Rendering
// jshint unused:false
var React = require('react');

const KEY_DOWN = 40;
const KEY_UP = 38;
const KEY_RETURN = 13;


/*jshint ignore:start */
var Tab = React.createClass({
  render: function() {
    var classes = classNames({
      tab: true,
      'collection-item': true,
      avatar: true,
      active: this.props.data._active
    });
    return (
      <li href="#!" className={classes}>
        <img src={this.props.data.favIconUrl} alt="" className="circle" />
        <span className="title">{this.props.data.title}</span>
        <p>{this.props.data.url}</p>
      </li>
    );
  }
});

var TabList = React.createClass({
  render: function() {
    var tabNodes = this.props.tabs.map(function(tab) {
      return (
        <Tab data={tab} />
      );
    });
    return (
      <ul className="collection red">
        {tabNodes}
      </ul>
    );
  }
});

var TabAheadrInput = React.createClass({
  handleInput: function(e) {
    this.props.onInputChange(e.target.value);
  },
  render: function() {
    return (
      <input type="text" id="tabTypeAheadInput" className="" onInput={this.handleInput} onKeydown={this.handleKeydown} autofocus="true" />
    );
  }
});

var TabAheadr = React.createClass({
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
      console.log('lalala');
      // also make sure to listen on keydown events for navigation, as soon as we have all tabs
      // we need arrows for navigation and return to confirm
      document.body.addEventListener('keydown', this.handleKeydownEvent);
    }.bind(this));
  },
  handleKeydownEvent: function(e) {
    if (e.keyCode === KEY_DOWN) {
      // prevent scrolling
      e.preventDefault();
      // switch to next tab in list (if there is any)
      this._highlightTabAtIndex(this.state.activeTabIdx + 1);
      console.log('downing');
    } else if (e.keyCode === KEY_UP) {
      // prevent scrolling
      e.preventDefault();
      this._highlightTabAtIndex(this.state.activeTabIdx - 1);
      console.log('upping');
    } else if (e.keyCode === KEY_RETURN) {
      // switch to selected tab
      helpers.switchToTab(this.state.tabs[this.state.activeTabIdx]);
    }
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
    // highlight the first tab
    // set the tabs
    this._updateTabs(tabs);
  },
  _updateTabs: function(newTabs) {
    this.setState({
      tabs: newTabs
    });
  },
  _highlightTabAtIndex: function(idx) {
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
    this._updateTabs(_tabs, idx);
    // store the newly selected index
    this.setState({
      activeTabIdx: idx
    });
  },
  render: function() {
    var title = 'Tab TypeAheadr';
    return (
      <div className="container">
        <div className="row">
          <div className="col s12">
            <h4>{title}</h4>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <TabAheadrInput onInputChange={this.handleInputChange} />
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <TabList tabs={this.state.tabs} />
          </div>
        </div>
      </div>
    );
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
  console.log('DOM fully loaded and parsed');
  /*jshint ignore:start */
  // render the whole shit
  React.render(
    <TabAheadr />,
    document.getElementById('output')
  );
  /*jshint ignore:end */
});
