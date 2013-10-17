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
