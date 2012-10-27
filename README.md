This is a JQuery plugin that allows you to create an high quality justified gallery of images.

A common problem, for people who create sites, is to create an elegant image gallery that manages the various sizes of images. Flickr and Google+ manage this situation in an excellent way, the purpose of this plugin is to give you the power of this solutions, with a new fast algorithm.


Important configurations
------------------------

An important configuration of the plugin is the <i>row height</i>. If you have an height of 100px, the algorithm resizes the images to have an height of 100px, for example:

<img src="http://miromannino.it/wp-content/uploads/2012/10/fig1.png" style="width: 100%; max-width:450px;" />

Then, if the row is full, the algorithm remove the images that can't stay in the same row, and resizes their width to fill all the row.

<img src="http://miromannino.it/wp-content/uploads/2012/10/fig2.png" style="width: 100%; max-width:374px;" />

This increases the row height (or cuts the images if you have configured the plugin to have a <i>fixed height</i>). 

<img src="http://miromannino.it/wp-content/uploads/2012/10/fig3.png" style="width: 100%; max-width:367px;" />

All the images that can't stay in the same row are placed in the next row. This algorithm is executed examining all rows until it reaches the last. But, the last row may not have enough images to fill all the row, in this case you can decide to leave a blank space or to justify the images, filling all the row (<em>justified last row</em> in configuration). But note that, if you decide to justify the last row, and you don't have fixed height, the last images can be much larger than the others.

<img src="http://miromannino.it/wp-content/uploads/2012/10/fig4.png" style="width: 100%; max-width:323px;" />


High quality galleries
----------------------

The plugin is based on the concept that you must have various thumbnails of your images. You know that you can configure the gallery to show your images in different height, and also the plugin may decide to resize some images to fill all the available space. The plugin needs thumbnails of various sizes to guarantee an high quality.

In practice, you must resize your images in the upload instead to resize them when someone needs them. The plugin use, by default, the <a href="http://www.flickr.com/services/api/misc.urls.html" target="_blank">Flickr Size Suffix</a>:

	"<strong>_t</strong>": thumbnail, 100 on longest side
	"<strong>_m</strong>": small, 240 on longest side
	"<strong>_n</strong>": small, 320 on longest side
	"<strong></strong>"  : medium, 500 on longest side
	"<strong>_z</strong>": medium 640, 640 on longest side
	"<strong>_c</strong>": medium 800, 800 on longest side
	"<strong>_b</strong>": large, 1024 on longest side

For example, if you have the original image with the name "myimage.jpg", your site must resize this image and create various thumbnails "myimage_t.jpg", "myimage_m.jpg", ... 

This is important because when the algorithm resizes the images, the appropriate image is chosen. And this ensures the maximum quality of the images, with a good bandwidth usage.


How to use the plugin
---------------------

The plugin accept a standard format for a gallery:

	<div id="mygallery" >
		<a href="myimage1.jpg" title="Title 1">
			<img alt="Title 1" src="myimage1_m.jpg"/>
	  	</a>
		<a href="myimage2.jpg" title="Title 2">
    		<img alt="Title 2" src="myimage2_m.jpg"/>
		</a>
	  	<!-- other images... -->
	</div>
	
Now, you need only to call the plugin that will justify all the images, with the default options.

	$("#mygallery").justifiedGallery();
	
It's simple!


Options
-------

In the latter example we used the "_m" suffix, that is the standard suffix for the plugin. But if we had used a different suffix? 

For example, if we use the "_n" suffix, we have thumbnails that is lower than 320px on the longer side. This time, we need to say to the plugin that we have been used this suffix with the option <code>usedSuffix</code> set to <code>'lt320'</code>.

	$("#mygallery").justifiedGallery('usedSuffix':'lt320');

There are other options, let me introduce these options seeing the defaults.


Default Options
---------------------

The default options of the plugins are the following:

	{
		'sizeSuffixes' : {
			'lt100':'_t', 
			'lt240':'_m', 
			'lt320':'_n', 
			'lt500':'', 
			'lt640':'_z', 
			'lt1024':'_b'
	},
		'usedSuffix' : 'lt240',
		'justifyLastRow' : true,
		'rowHeight' : 120,
		'fixedHeight' : false,
		'lightbox' : false,
		'captions' : true,
		'margins' : 1,
		'extension' : '.jpg',
		'refreshTime' : 500
	}

The options: <code>justifyLastRow</code>, <code>rowHeight</code> and <code>fixedHeight</code> correspond to the concepts we have seen before. The default <code>usedSuffix</code> option corresponds to the default <code>rowHeight</code> option considering an average aspect ratio of 4:3.

The <code>sizeSuffixes</code> defines the suffix names, here you can decide the quality of your images in the gallery. For example you may have only a thumbnail for an image and set this option in this way:

	{ 'lt100':'_thumb', 
	  'lt240':'_thumb', 
	  'lt320':'_thumb', 
	  'lt500':'_thumb', 
	  'lt640':'_thumb', 
	  'lt1024':'' }

The <code>lightbox</code> option specify that you can show the images with a lightbox, the plugin uses <a href="http://www.jacklmoore.com/colorbox" target="_blank">Colorbox</a>, you must ensure that you have it installed if you set this option to true.

The <code>captions</code> option specify if you want that the title appears when your mouse is over the image.

<img src="http://miromannino.it/wp-content/uploads/2012/10/captions.jpg" style="width: 100%; max-width:271px;" />

The <code>margins</code> option set the margin between the images, in the latter image, for example, this is set to 1. The <code>extension</code> option is used to reconstruct the filename of the images, change it if you use different extensions.

The <code>refreshTime</code> option is the time that the plugin wait before checking the page size, and if it is changed it recreates the gallery layout.


Choosing the right options
--------------------------

Choosing the right options is important to have a gallery that uses low bandwidth. In fact, the plugin must know the images width and height, it needs to download them at least one time.
If you have images with an average aspect ratio of 4:3, you can choose which images to put in the HTML code with this pseudocode:

	if rowHeight <= 75:
		#image sizes must be with longest side = 100
		usedSuffix = "lt100"
	elif rowHeight <= 180:
		#image sizes must be with longest side = 240
		usedSuffix = "lt240"
	elif rowHeight <= 240:
		#image sizes must be with longest side = 320
		usedSuffix = "lt320"
	#...

In this way the images you put in the HTML code are probably the ones that are used after the justification. Only some images may be reloaded.