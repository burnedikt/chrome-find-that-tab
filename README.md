# Find That Tab

> Find that tab you're looking for with just a few keystrokes, 
> reduce tab clutter and be more productive

Source code of the Chrome Extension "Find That Tab". Allows you to jump to
the tab you're looking for in a heartbeat by swiftly searching through your open 
tabs with just a few keystrokes. Inspired by Sublime Text's Open Anything functionality.

## Setup

Make sure to run `npm install` before starting to contribute to this extension.

## Developing

This extension features chrome livereload for easier and faster extension 
development. Just run `grunt debug` to setup the live reload and compile all 
assets. Then add the Chrome Extension as an 'unpacked extension' as explained 
in detail [here](https://developer.chrome.com/extensions/getstarted#unpacked)

## Testing

Right now, there are no really useful tests.

Simply run `grunt test`.

## Building

Simply run `NODE_ENV=production grunt build`.

## Roadmap

There is a bunch of features that can be added in the future, e.g.:

- Also allow for opening new tabs through text search (e.g. from Bookmarks, History)
- List tabs in all windows and incognito mode
- ...

## Credits

Credits go to:

- [Matt York](https://github.com/mattyork) and his awesome [fuzzy search library](https://github.com/mattyork/fuzzy)
- the excellent [MaterializeCSS Library](http://materializecss.com/icons.html)
