#Stack View

The jQuery virtual stack plugin

Check out the [Project Page](http://librarylab.law.harvard.edu/stackview/demo) for more information.

## Development

A single concatenated and minified `jquery.stackview.min.js` file containing Stack View and all its dependencies is located in `/lib`.  Developers making changes to the project should do so in `/src/js` and compile the minified file by running `make js`.  If any files in `/src` are added or renamed, they should be added to this list of source files in `Makefile`.

Styles are written in [Sass](http://sass-lang.com) and compiled to CSS.  Sass files are located in `/src/scss` and compiled to `/lib/jquery.stackview.css`. Developers can compile the Sass by installing it and running `make css`.  Developers making a lot of changes can watch for changes to the Sass directory by running:

```
sass --watch --style expanded src/scss/:lib/
```

Tests are written using [Jasmine](http://pivotal.github.com/jasmine/) and can be run by opening `/test/index.html`.

## License

Dual licensed under the MIT license (below) and [GPL license](http://www.gnu.org/licenses/gpl-3.0.html).

<small>
MIT License

Copyright (c) 2012 The Harvard Library Innovation Lab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</small>
