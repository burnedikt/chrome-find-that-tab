# Find That Tab

> Reduce tab clutter and be more productive by getting to the tab you're
> looking for with just a few keystrokes

Source code of the Chrome Extension "Open Anytab" inspired by Sublime's Open 
Anything functionality.

## Setup

Make sure to run `bower install && npm install` before starting to contribute 
to this extension.

## Developing

This extension features chrome livereload for easier and faster extension 
development. Just run `grunt debug` to setup the live reload and compile all 
assets. Then add the Chrome Extension as an 'unpacked extension' as explained 
in detail [here](https://developer.chrome.com/extensions/getstarted#unpacked)

## Testing

Right now, there are no really useful tests. Just some experiments with
filtering tabs based on a fuzzy search using [Fuse](https://github.com/krisk/Fuse)
or my own RegEx-based search.

Simply run `grunt test`.

## Building

Simply run `grunt build`.

## Roadmap

There is a bunch of features that can be added in the future, e.g.:

- Also allow for opening new tabs through text search (e.g. from Bookmarks, History)
- List tabs in all windows and incognito mode
- ...

## Credits

Credits go to:

- the excellent [MaterializeCSS Library](http://materializecss.com/icons.html)
- the Chrome / Chromium Developer Team
