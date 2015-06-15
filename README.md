<div align="center">
  <a href="http://miromannino.github.io/Justified-Gallery/" target="_blank">
    <img src="https://raw.github.com/miromannino/Justified-Gallery/gh-imgs/jgcover.png" />
  </a>
</div>

This is a JQuery plugin that allows you to create an high quality justified gallery of images. 

A common problem, for people who create sites, is to create an elegant image gallery that manages 
the various sizes of images. Flickr and Google+ manage this situation in an excellent way, 
the purpose of this plugin is to give you the power of this solutions, with a new fast algorithm.

<div style="text-align: center; font-size: 110%;">
	<a href="http://miromannino.github.io/Justified-Gallery/" target="_blank">Official project page</a>
</div>

## Release History

### 3.5.5

* Added a "selector" option for overriding the default `> a, > div:not(.spinner)` selector used to
  find child elements to justify.

  ```javascript
  $('.list_of_paragraphs').justifiedGallery({selector: '> p'})
  ```

### 3.5.4

* Added the border option
* Fixed some problems with waitThumbnailsLoad and infinite scroll

### 3.5

* The default suffixes are all empty, to be simpler to understand. To have the previous suffixes,
the following settings can be used:

	```
	sizeRangeSuffixes : { 
		'lt100': '_t', 
		'lt240': '_m', 
		'lt320': '_n', 
		'lt500': '', 
		'lt640': '_z', 
		'lt1024': '_b' 
	}
	```

* Now is possible to have entries with the structure: 

	```
	<div>
		<a href="...">
			<img src="..." />
		</a>
		<div class="caption">...</div>
	</div>
	```

* Fixed margins
* The border of the entire gallery can be customized
* Corrected bugs for the callbacks when waitThumbnailsLoad = false

### 3.4

* Performance improvements
	* In presence of width and height attributes in thumbnails, and with the option 
	  'waitThumbnailsLoad', the layout is immediately built, and the thumbnails will appear randomly
	  while they are loaded.
	* Other code refactorings to be more performant
* With nojustify, if there is only a row, it doesn't justify anything. The previous behaviour seems
too like a bug than a feature.
* Infinite scroll example with plain javascript to be more understandable.
* Fixes some bugs with infinite scroll

### 3.3

* No more crops
	* Removed some floating point approximations that caused some small crops
* Initial opacity settings for the caption to allow them to be always visible
	* Can be also configured changing the less file, if one prefers CSS animations
* All caption settings in a single object to be more compact

	```
	captionSettings : { //ignored with css animations
		animationDuration : 500,
		visibleOpacity : 0.7, 
		nonVisibleOpacity : 0.0 
	},
	```
* Justification formulas refactoring to be more maintainable

### 3.2

* A gallery of `div` can be used instead of `a`
* Fixed errors for the last rows
* Option to use only css animations (i.e `cssAnimation`)
* Without css animations
	* Configurable caption fadein/fadeout time (i.e. `captionsAnimationDuration`)
	* Configurable caption final opacity (i.e. `captionsVisibleOpacity`)
	* Configurable images fadein time (i.e. `imagesAnimationDuration`)
* Configurable treshold that decides to justify the row also in presence of nojustify (i.e. `justifyThreshold`)

### 3.1

* Improved the algorithm to reduce the image crops
* Fixed errors with some jQuery versions
* Fixed errors with fixed height
* Settings checks and parsing
* Added event jg.rowflush

### 3.0

* Totally rewritten!
* Row by row loading
 	* The plugin doesn't wait that all the gallery thumbnails are loaded
	* A row is printed when the its thumbnails are available 
	* Non-blocking layout creation
* No more white spaces (If the gallery needs to load a bigger image, it first show the smaller and then replace it with the bigger)
* Improved the algorithm for a better result
	* No more white pixels at the end of a row (bugfix)
	* Reduced a lot the image crops
		* Vertical centering
		* Proportional images enlargement looking the image aspect ratio
* Improved the algorithm efficiency
	* No more extra tags or new elements added to create the layout
	* All the images remain in the DOM, they aren't deleted or created
		* Hence, each tag remains in the links and in the images
* Added `maxRowHeight` option
* Custom captions
* Thumbnails randomization (`randomize` option)
* Statefulness
	* can be called again changing only some settings
	* can be called again to update the layout (after add or remove of images)
* Infinite scroll capable
* Improved last row behavior
	* Last row option changed
		* `justifyLastRow` setting has been renamed to `lastRow`, and it accepts: `'justify'`, `'nojustify'`, `'hide'`.
	* Option to hide the row if it is incomplete and cannot be justified 
	* The plugin can justify also with `lastRow = 'nojustify'`, if the free space is small.
* Silent error handling
	* If a thumbnail doesn't exists, it is ignored in the layout (hided)
	* If the plugin needs an inexistent thumbnail, it maintains the previous one
	* Errors are still visible in the console
* Loading spinner
	* Visible when a new row needs to be loaded
	* Pure CSS spinner
	* Configurable changing the CSS/Less
* Project structure
	* Grunt to manage the build
	* Less
	* Tests
	* Javascript and CSS validation
	* CSS filename changed to be more standard
* License changed to MIT
* Improved the gallery size check to be less invasive
* Fixed lightbox removal when the page is resized

### 2.1

* Setting removed: 'usedSizeRange', now the plugin do it automatically
* Setting behavior changed: 'extension', now it accept a regular expression. The old behavior still works, but is not safe.
* New behavior: if an image defines the attribute `data-safe-src`, this is choice, no matter what the src attribute is. This can be used to avoid the problems with Photon or other services that resize the images, changing the image `src`s.

### 2.0

* Setting removed: 'lightbox', now can be done simply with the onComplete callback.
* Added Setting: 'rel' to change all the links `rel` attribute.
* Added Setting: 'target' to change all the links `target` attribute.
* Setting name changed: 'complete' to 'onComplete'.
* Setting name changed: 'sizeSuffixes' to 'sizeRangeSuffixes'.
* Setting name changed: 'usedSuffix' to 'usedSizeRange'.
* Added the CSS for the div that shows the Justified Gallery errors. Now can be changed, or hided.

## Contributing

### Important notes
Please don't edit files in the `dist` subdirectory as they are generated via Grunt. You'll find source code in the `src` subdirectory.

#### Code style
Regarding code style like indentation and whitespace, **follow the conventions you see used in the source already.**

### Modifying the code
 
 - Prerequisites:
	- Ensure that you have the latest [Node.js](http://nodejs.org/) and [npm](http://npmjs.org/) installed.
	- Test that Grunt's CLI is installed by running `grunt --version`.  If the command isn't found, run `npm install -g grunt-cli`.  For more information about installing Grunt, see the [getting started guide](http://gruntjs.com/getting-started).
	- Ensure that you have Bower installed. If not, install it using `npm install -g bower`. 

 - Steps:
	- Fork and clone this repository.
	- Open a terminal and change the current directory to the cloned folder.
	- Run `npm install` to install all dependencies (including Grunt).
	- Run `bower install` to install all the dependencies needed for the tests.
	- Run `grunt debug` to build the library only for testing (debug mode).
	- Run `grunt` to build this project in release mode.

### Submitting pull requests

- Create a new branch, please don't work in your `master` branch directly.
- Add failing tests for the change you want to make.
- Fix stuff.
- Ensure that the written tests don't fail anymore, as well as the other tests.
- Update the documentation to reflect any changes.
- Push to your fork and submit a pull request.



