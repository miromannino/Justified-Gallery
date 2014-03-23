<div align="center">
  <a href="http://miromannino.com/projects/justified-gallery/" target="_blank">
    <img src="https://raw.github.com/miromannino/Justified-Gallery/gh-imgs/jgcover.png" />
  </a>
</div>

This is a JQuery plugin that allows you to create an high quality justified gallery of images. 

A common problem, for people who create sites, is to create an elegant image gallery that manages 
the various sizes of images. Flickr and Google+ manage this situation in an excellent way, 
the purpose of this plugin is to give you the power of this solutions, with a new fast algorithm.

You can read the entire description of this project 
in the <a href="http://miromannino.com/projects/justified-gallery/">official project page</a>.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/miro/Justified-Gallery/master/dist/justifiedGallery.min.js
[max]: https://raw.github.com/miro/Justified-Gallery/master/dist/justifiedGallery.js
TODO

In your web page:

```html
TODO
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History

= 3.0 =

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
		* Proportional images enlargment looking the image aspect ratio
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
* Improved last row behaviour
	* Last row option changed
		* `justifyLastRow` setting has been renamed to `lastRow`, and it accepts: `'justify'`, `'nojustify'`, `'hide'`.
	* Option to hide the row if it is incomplete and cannot be justifyied 
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


= 2.1 = 

* Setting removed: 'usedSizeRange', now the plugin do it automatically
* Setting behavior changed: 'extension', now it accept a regular expression. The old behavior still works, but is not safe.
* New behavior: if an image defines the attribute `data-safe-src`, this is choice, no matter what the src attribute is. This can be used to avoid the problems with Photon or other services that resize the images, changing the image `src`s.

= 2.0 =

* Setting removed: 'lightbox', now can be done simply with the onComplete callback.
* Added Setting: 'rel' to change all the links `rel` attribute.
* Added Setting: 'target' to change all the links `target` attribute.
* Setting name changed: 'complete' to 'onComplete'.
* Setting name changed: 'sizeSuffixes' to 'sizeRangeSuffixes'.
* Setting name changed: 'usedSuffix' to 'usedSizeRange'.
* Added the css for the div that shows the Justified Gallery errors. Now can be changed, or hided.

