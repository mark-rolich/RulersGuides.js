RulersGuides.js
=================

This Javascript package creates Photoshop-like guides and rulers interface on a web page.

<a href="http://mark-rolich.github.io/RulersGuides.js/" target="_blank"><strong>DEMO</strong></a>

Main window:

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/main.png" />

Menu:

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/menu.png" />

Guides are created by click-and-dragging corresponding horizontal or vertical ruler.
Guide position is shown while dragging and on mouse over.

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/guides.png" />

It is possible to open/save created guides as grids
(Note: grids will be saved on a page location basis, so it's not possible to use the same grids in another browser window/tab).

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/save_grid.png" />&nbsp;
<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/open_grid.png" />

Rulers can be unlocked, so that one of the rulers will scroll along the page and the other will be always visible.

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/unlock.png" />

Guides can be snapped to defined number of pixels.

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/snap_to.png" />

Detailed info mode is available, which shows position and size of regions created by the guides.
Works on guide position change too.

<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/detailed_info1.png" />
<img src="http://mark-rolich.github.io/RulersGuides.js/screenshots/detailed_info2.png" />

Guides can be snapped to DOM elements (experimental, use with caution, can be slow or unresponsive on complex pages with lots of elements).

Following hotkeys are available:

* Toggle rulers - `Ctrl + Alt + R`
* Toggle guides - `Ctrl + Alt + G`
* Toggle rulers and guides - `Ctrl + Alt + A`
* Clear all guides - `Ctrl + Alt + D`
* Save grid dialog - `Ctrl + Alt + S`
* Open grid dialog - `Ctrl + Alt + O`
* Lock/unlock rulers - `Ctrl + Alt + L`
* Open Snap to dialog - `Ctrl + Alt + C`
* Toggle detailed info - `Ctrl + Alt + I`
* Toggle snap to DOM - `Ctrl + Alt + E`

Look-and-feel can be adjusted using CSS.

RulersGuides.js is available as a bookmarklet, please see bookmarklet.js file provided with the package.

For IE users there is a bookmarklet_ie.js file, which loads necessary packages externally due to IE bookmark size restriction.

You can copy and include them locally by changing paths in the bookmarklet.

RulersGuides.js is available as an extension for Google Chrome browser, download it [here](http://mark-rolich.github.io/RulersGuides.js/RulersGuides.crx),
and drag and drop downloaded file to extensions tab (chrome://extensions).

RulersGuides.js requires Event.js and Dragdrop.js packages, which can be acquired at the following links:

Event.js

* [Github](https://github.com/mark-rolich/Event.js)
* [JS Classes](http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html)

Dragdrop.js

* [Github](https://github.com/mark-rolich/Dragdrop.js)
* [JS Classes](http://www.jsclasses.org/package/215-JavaScript-Handle-drag-and-drop-events-of-page-elements.html)

Browser Compatibility
--------------------

Currently tested in:

* Chrome 24
* Firefox 18
* IE 7, 8 and 9 (without grid saving functionality)
* Safari for Windows 5.1.7

Bug tracker
-----------

Have a bug? Please create an issue here on GitHub!

https://github.com/mark-rolich/RulersGuides.js/issues

Copyright and License
---------------------

The MIT License (MIT)

Copyright (c) 2013 Mark Rolich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
