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
  handleKeydown: function(e) {
    if (e.keyCode === KEY_DOWN) {
      console.log('downing');
    } else if (e.keyCode === KEY_UP) {
      console.log('upping');
    }
  },
  render: function() {
    return (
      <input type="text" id="tabTypeAheadInput" className="" onInput={this.handleInput} onKeydown={this.handleKeydown} autofocus="true" />
    );
  }
});

var TabAheadr = React.createClass({
  getInitialState: function() {
    return {tabs: []};
  },
  componentDidMount: function() {
    this.loadTabs();
  },
  loadTabs: function() {
    helpers.loadTabs().then(function(tabs) {
      this.setState({
        _tabs: tabs,
      });
      this._updateTabs(tabs);
    }.bind(this));
  },
  handleInputChange: function(keyword) {
    var tabs = helpers.findMatchingTabs(keyword, this.state._tabs);
    // highlight the first tab
    // set the tabs
    this._updateTabs(tabs);
  },
  _updateTabs: function(newTabs) {
    if (newTabs.length) {
      newTabs[0]._active = true;
    }
    this.setState({
      tabs: newTabs
    });
  },
  render: function() {
    return (
      <div className="container">
        <div className="row">
          <div className="col s12">
            <h1>Tab TypeAheadr</h1>
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
