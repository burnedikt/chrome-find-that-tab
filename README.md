# chrome-open-anytab
Source code of the Chrome Extension "Open Anytab" inspired by Sublime's Open Anything functionality.

# Setup

Make sure to run `bower install && npm install` before starting to contribute to this extension.

# Developing

This extension features chrome livereload for easier and faster extension development. Just run `grunt debug` to setup the live reload and compile all assets. Then add the Chrome Extension as an 'unpacked extension' as explained in detail [here](https://developer.chrome.com/extensions/getstarted#unpacked)

# Testing

Right now, there are no really useful tests. Just some experiments with filtering tabs based on a fuzzy search using [Fuse](https://github.com/krisk/Fuse) or my own RegEx-based search.

Simply run `grunt test`.

# Building

Simply run `grunt build`.

# Credits

Credits go to:
- the excellent [MaterializeCSS Library](http://materializecss.com/icons.html)
- the Chrome / Chromium Developer Team
