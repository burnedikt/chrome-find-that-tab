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
        <span className="title" dangerouslySetInnerHTML={{__html: (this.props.data.displayTitle||this.props.data.title)}} />
        <p className="truncate">{this.props.data.url}</p>
      </li>
    );
  }
});

var TabList = React.createClass({
  render: function() {
    var tabNodes = this.props.tabs.map(function(tab) {
      return (
        <Tab key={tab.id} data={tab} />
      );
    });
    return (
      <ul className="collection">
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
      <input type="text" id="tabTypeAheadInput" className="validate" onInput={this.handleInput} onKeydown={this.handleKeydown} autofocus="true" />
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
    } else if (e.keyCode === KEY_UP) {
      // prevent scrolling
      e.preventDefault();
      this._highlightTabAtIndex(this.state.activeTabIdx - 1);
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
    // store the newly selected index
    this.setState({
      tabs: _tabs,
      activeTabIdx: idx
    });
  },
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <form className="col s12">
            <div className="row">
              <div className="input-field col s12">
                <i className="material-icons prefix">search</i>
                <TabAheadrInput onInputChange={this.handleInputChange} />
                <label htmlFor="tabTypeAheadInput">Just type ahead ...</label>
              </div>
            </div>
          </form>
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
  /*jshint ignore:start */
  // render the whole shit
  React.render(
    <TabAheadr />,
    document.getElementById('output')
  );
  /*jshint ignore:end */
});
