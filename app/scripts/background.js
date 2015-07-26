'use strict';
/** @type {String} Path to the popup html page to be displayed */
const popupPage = 'popup.html';
/** @type {Window} Reference to the chrome.window (the acutal popup) which is opened below */
var openedPopup = null;

// function that can be used to close the popup
// jshint unused:false
/**
 * helper function to close the popup, works only after the popup has been opened obviously
 */
function closePopup() {
  if (openedPopup) {
    chrome.windows.remove(openedPopup.id);
  } else {
    throw new Error('Popup isn\'t open yet and closePopup() hase been called');
  }
}
var i = 0;
chrome.commands.onCommand.addListener(function(command) {
  if (command === 'open-anytab') {
    window.alert('open anytab called for the ' + (i++) + 'th time');
    var width = 600;
    var height = 600;
    chrome.windows.create({
      url: chrome.extension.getURL(popupPage),
      // this will open a normal popup (though a panel would be cooler)
      type: 'panel',
      // fixed dimensions
      width: width,
      height: height,
      // position it in the center
      left: (screen.width - width) / 2,
      top: (screen.height - height) / 2,
      // focus the popup
      focused: true,
      // should be always on top of all other chrome windows
      // alwaysOnTop: true
    }, function(popup) {
      // save a reference to the popup
      openedPopup = popup;
    });
  }
});
