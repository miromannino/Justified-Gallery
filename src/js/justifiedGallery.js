/*
 * Justified Gallery - v3.0.0-RC1
 * http://miromannino.com/projects/justified-gallery/
 * Copyright (c) 2014 Miro Mannino
 * Licensed under the MIT license.
 */
(function($) {

	/* Events
		jg.complete : called when all the gallery has been created
		jg.resize : called when the gallery has been resized
	*/

	$.fn.justifiedGallery = function (options) {

		// Default options
		var defaults = {
			sizeRangeSuffixes : {'lt100':'_t', 'lt240':'_m', 'lt320':'_n', 'lt500':'', 'lt640':'_z', 'lt1024':'_b'},
			rowHeight : 120,
			maxRowHeight : -1,
			margins : 1,
			justifyLastRow : true,
			fixedHeight : false,
			captions : true,
			rel : null, //rewrite the rel of each analyzed links
			target : null, //rewrite the target of all links
			extension : /\.[^.]+$/,
			refreshTime : 500,
			randomize : false
		};

		function getSuffix(width, height, context) {
			var longestSide;
			longestSide = (width > height) ? width : height;
			if (longestSide <= 100) {
				return context.settings.sizeRangeSuffixes.lt100;
			} else if (longestSide <= 240) {
				return context.settings.sizeRangeSuffixes.lt240;
			} else if (longestSide <= 320) {
				return context.settings.sizeRangeSuffixes.lt320;
			} else if (longestSide <= 500) {
				return context.settings.sizeRangeSuffixes.lt500;
			} else if (longestSide <= 640) {
				return context.settings.sizeRangeSuffixes.lt640;
			} else {
				return context.settings.sizeRangeSuffixes.lt1024;
			}
		}

		function onEntryMouseEnterForCaption (sender) {
			$(sender.currentTarget).find('.caption').stop();
			$(sender.currentTarget).find('.caption').fadeTo(500, 0.7);
		}

		function onEntryMouseLeaveForCaption (sender) {
			$(sender.currentTarget).find('.caption').stop();
			$(sender.currentTarget).find('.caption').fadeTo(500, 0.0);
		}

		function displayEntry($entry, x, y, imgWidth, imgHeight, rowHeight, context) {
			var $image = $entry.find('img');

			$image.css('margin-left', - imgWidth / 2);
			$image.css('margin-top', - imgHeight / 2);
			$entry.width(imgWidth);
			$entry.height(rowHeight);
			$entry.css('top', y);
			$entry.css('left', x);

			// Image reloading for an high quality of thumbnails
			var imageSrc = $image.attr('src');
			var newImageSrc = imageSrc.replace(context.settings.extension, '').replace(context.usedSizeRangeRegExp, '') + 
								getSuffix(imgWidth, imgHeight, context) + 
								imageSrc.match(context.settings.extension)[0];

			$image.on('error', function () {
				$image.off('error');
				//DEBUG// console.log('revert the original image');
				$image.attr('src', $image.data('originalSrc')); //revert to the original thumbnail, we got it.
			});

			$entry.fadeIn(300, function () {
				if (imageSrc !== newImageSrc) { //load the new image after the fadeIn
					$image.attr('src', newImageSrc);
				}	
			});

			// Captions ------------------------------
			//TODO option for caption always visible
			if (context.settings.captions === true) {
				var $imgCaption = $entry.find('.caption');
				if ($imgCaption.length === 0) { // Create it if it doesn't exists
					var caption = $image.attr('alt');
					if (typeof caption === 'undefined') caption = $entry.attr('title');
					if (typeof caption !== 'undefined') { // Create only we found something
						$imgCaption = $('<div class="caption">' + caption + '</div>');
						$entry.append($imgCaption);
					}
				}
			
				// Create events (we check again the $imgCaption because it can be still inexistent)
				if ($imgCaption.length !== 0 && $entry.data('captionMouseEventsBinded') !== true) { 
					$entry.mouseenter(onEntryMouseEnterForCaption);
					$entry.mouseleave(onEntryMouseLeaveForCaption);
					$entry.data('captionMouseEventsBinded', true);
				}
			}

		}

		function justifyBuildingRow(context) {
			var $image, imgExtraW;
			var minHeight = 0;
			var availableWidth = context.galleryWidth;
			var extraW = availableWidth - context.buildingRow.width - 
							((context.buildingRow.entriesBuff.length - 1) * context.settings.margins);
			//DEBUG// console.log('availableWidth: ' + availableWidth + ' extraW: ' + extraW);
			for (var i = 0; i < context.buildingRow.entriesBuff.length; i++) {
				$image = context.buildingRow.entriesBuff[i].find('img');

				if (i < context.buildingRow.entriesBuff.length - 1) {
					// Scale in proportion of the image aspect ratio (the more is long, the more can be extended)
					imgExtraW = Math.ceil(($image.width() / context.buildingRow.width) * extraW);
				} else {
					imgExtraW = availableWidth - $image.width();
				}

				// Scale factor for the new width is ((width + extraW) / width)), hence:
				$image.height(Math.ceil($image.height() * (1 + imgExtraW / $image.width())));
				$image.width($image.width() + imgExtraW);

				availableWidth -= $image.width() + ((i < context.buildingRow.entriesBuff.length - 1) ? context.settings.margins : 0);

				if (i === 0 || minHeight > $image.height()) minHeight = $image.height();
			}

			//DEBUG// console.log('availableWidth: ' + availableWidth);

			return minHeight;
		}

		function flushRow(context, isLastRow) {
			var $entry, $image, minHeight = context.settings.rowHeight, offX = 0;

			if (!isLastRow || context.settings.justifyLastRow) {
				if (context.settings.fixedHeight) {
					justifyBuildingRow(context);
				} else {
					minHeight = justifyBuildingRow(context);
				}
			}

			if (context.settings.maxRowHeight > 0 && context.settings.maxRowHeight < minHeight)
				minHeight = context.settings.maxRowHeight;

			while(context.buildingRow.entriesBuff.length > 0) {
				$entry = context.buildingRow.entriesBuff.shift();
				$image = $entry.find('img');
				displayEntry($entry, offX, context.offY, $image.width(), $image.height(), minHeight, context);
				offX += $image.width() + context.settings.margins;
			}

			context.offY += minHeight;

			//Gallery Height
			context.$gallery.height(context.offY + 
				((!isLastRow && context.spinner !== null) ? context.spinner.$el.innerHeight() : 0)
			);

			//Ready for a new row
			context.offY += context.settings.margins;
			context.buildingRow.entriesBuff = []; //clear the array creating a new one
			context.buildingRow.width = 0;
		}

		function checkWidth(context) {
			setInterval(function () {
				var galleryWidth = parseInt(context.$gallery.width(), 10);
				if (context.galleryWidth !== galleryWidth) {
					
					//DEBUG// console.log("resize. old: " + context.galleryWidth + " new: " + galleryWidth);
					
					context.galleryWidth = galleryWidth;
					/*context.$entries.find('img').each(function (_, el) {
						$el = $(el);
						if ($el.data('loaded') === true) {
							$el.attr('src', $el.data('originalSrc')); //revert to the original thumbnail 
							$el.off('load'); //prevent the fadein when is loaded (due to a src change)
						}
					});*/
					context.lastAnalyzedIndex = -1;
					context.buildingRow.entriesBuff = [];
					context.buildingRow.width = 0;
					context.offY = 0;

					// Restart to analyze
					analyzeImages(context, true);
					return;
				}
			}, context.settings.refreshTime);
		}	

		function startLoadingSpinnerAnimation(context) {
			context.spinner.intervalId = setInterval(function animateSpinner () {
				var spinner = context.spinner;
				if (spinner.phase < spinner.$points.length) 
					spinner.$points.eq(spinner.phase).fadeTo(spinner.timeslot, 1);
				else
					spinner.$points.eq(spinner.phase - spinner.$points.length).fadeTo(spinner.timeslot, 0);
				spinner.phase = (spinner.phase + 1) % (spinner.$points.length * 2);
			}, context.spinner.timeslot);
		}

		function stopLoadingSpinnerAnimation(context) {
			clearInterval(context.spinner.intervalId);
			context.spinner.intervalId = null;
		}

		function analyzeImages(context, isForResize) {
			
			/* DEBUG
			var rnd = parseInt(Math.random() * 10000, 10);
			console.log('analyzeImages ' + rnd + ' start');
			*/
			
			for (var i = context.lastAnalyzedIndex + 1; i < context.entries.length; i++) {
				var $entry = $(context.entries[i]);
				var $image = $entry.find('img');
				if ($image.data('loaded')) {
					var image = $image.get(0);

					/* We store width and height as data 
						(we don't use image.width and $image.width()) 
					*/
					$image.width(Math.ceil(image.width / (image.height / context.settings.rowHeight)));
					$image.height(context.settings.rowHeight);

					//DEBUG// console.log('analyzed img ' + $image.attr('alt'));

					if (context.buildingRow.width +
							$image.width() +
							(context.buildingRow.entriesBuff.length - 1) * context.settings.margins > context.galleryWidth) {
						//DEBUG// console.log('flush (width: ' + context.buildingRow.width + ', galleryWidth: ' + context.galleryWidth + ')');
						if (context.buildingRow.entriesBuff.length > 0) {
							flushRow(context, false);
						}
					}

					context.buildingRow.entriesBuff.push($entry);
					context.buildingRow.width += $image.width();
					context.lastAnalyzedIndex = i;
				} else {
					return;
				}
			}

			context.spinner.$el.detach();
			stopLoadingSpinnerAnimation(context);

			// Last row flush (even it is not full)
			if (context.buildingRow.entriesBuff.length > 0) {
				flushRow(context, true);
			}

			//On complete callback
			if (!isForResize) context.$gallery.trigger('jg.complete'); else context.$gallery.trigger('jg.resize');

			//DEBUG// console.log('analyzeImages ' + rnd +  ' end');
		}

		return this.each(function (index, gallery) {

			var context = {
				settings : $.extend({}, defaults, options),
				entries : [],
				buildingRow : {
					entriesBuff : [],
					width : 0
				},
				lastAnalyzedIndex : -1,
				offY : 0,
				spinner : {
					timeslot : 150,
					phase : 0,
					$el : null,
					$points : null,
					intervalId : null
				},
				galleryWidth : $(gallery).width(),
				$gallery : $(gallery)
			};

			context.entries = context.$gallery.find('a').toArray();
			if (context.entries.length === 0) return;

			// Randomize
			if (context.settings.randomize) {
				context.entries.sort(function () { return Math.random() * 2 - 1; });
				$.each(context.entries, function () {
					$(this).appendTo(context.$gallery);
				});
			}

			context.$gallery.addClass('justified-gallery');
			context.usedSizeRangeRegExp = new RegExp("(" + 
				context.settings.sizeRangeSuffixes.lt100 + "|" + 
				context.settings.sizeRangeSuffixes.lt240 + "|" + 
				context.settings.sizeRangeSuffixes.lt320 + "|" + 
				context.settings.sizeRangeSuffixes.lt500 + "|" + 
				context.settings.sizeRangeSuffixes.lt640 + "|" + 
				context.settings.sizeRangeSuffixes.lt1024 + ")$"
			);

			if(context.settings.maxRowHeight > 0 && context.settings.maxRowHeight < context.setings.rowHeight)
				context.settings.maxRowHeight = context.settings.rowHeight;

			// Spinner init
			context.spinner.$el = $('<div class="spinner"><span></span><span></span><span></span></div>');
			context.spinner.$points = context.spinner.$el.find('span');
			context.$gallery.append(context.spinner.$el);
			context.$gallery.height(context.spinner.$el.innerHeight());
			startLoadingSpinnerAnimation(context);

			$.each(context.entries, function (index, entry) {
				var $entry = $(entry);
				var $image = $entry.find('img');

				$image.data('loaded', false);
				$entry.hide();
				
				// Link Rel global overwrite
				if (context.settings.rel !== null) $(entry).attr('rel', context.settings.rel);

				// Link Target global overwrite
				if (context.settings.target !== null) $(entry).attr('target', context.settings.target);

				// Loading callbacks
				$image.on('load', function () {
					$image.off('load error');
					$image.data('loaded', true);
					analyzeImages(context, false);
				});
				$image.on('error', function (e) {
					$image.off('load error');
					for (var i = 0; i < context.entries.length; i++) {
						if ($(context.entries[i]).find('img').get(0) === e.target) {
							context.entries.splice(i, 1);
							break;
						}
					}
					analyzeImages(context, false);
				});

				// Image src
				var imageSrc = (typeof $image.data('safe-src') !== 'undefined') ? $image.data('safe-src') : $image.attr('src');
				$image.data('originalSrc', imageSrc);
				$image.attr('src', imageSrc); //always necessary, even if we are assigning the same value
			});

			checkWidth(context);
		});

	};
	
}(jQuery));