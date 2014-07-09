/*
 * Justified Gallery - v3.2.0
 * http://miromannino.com/projects/justified-gallery/
 * Copyright (c) 2014 Miro Mannino
 * Licensed under the MIT license.
 */
(function($) {

	/* Events
		jg.complete : called when all the gallery has been created
		jg.resize : called when the gallery has been resized
	*/

	$.fn.justifiedGallery = function (arg) {

		// Default options
		var defaults = {
			sizeRangeSuffixes : {
				'lt100': '_t', 
				'lt240': '_m', 
				'lt320': '_n', 
				'lt500': '', 
				'lt640': '_z', 
				'lt1024': '_b'
			},
			rowHeight : 120,
			maxRowHeight : 0, //negative value = no limits, 0 = 1.5 * rowHeight
			margins : 1,
			lastRow : 'nojustify', // or can be 'justify' or 'hide'
			justifyThreshold: 0.35, // if available space / row width <= 0.35 it will be always justified 
															// (lastRow setting is not considered)
			cssAnimation: false,
			captionsAnimationDuration : 500,
			captionsVisibleOpacity : 0.7, 
			imagesAnimationDuration : 300,
			fixedHeight : false,
			captions : true,
			rel : null, //rewrite the rel of each analyzed links
			target : null, //rewrite the target of all links
			extension : /\.[^.]+$/,
			refreshTime : 250,
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

		function onEntryMouseEnterForCaption (ev) {
			var $caption = $(ev.currentTarget).find('.caption');
			if (ev.data.settings.cssAnimation) {
				$caption.addClass('caption-visible').removeClass('caption-hidden');
			} else {
				$caption.stop().fadeTo(ev.data.settings.captionsAnimationDuration, ev.data.settings.captionsVisibleOpacity);
			}
		}

		function onEntryMouseLeaveForCaption (ev) {
			var $caption = $(ev.currentTarget).find('.caption');
			if (ev.data.settings.cssAnimation) {
				$caption.removeClass('caption-visible').removeClass('caption-hidden');
			} else {
				$caption.stop().fadeTo(ev.data.settings.captionsAnimationDuration, 0.0);
			}
		}

		function displayEntry($entry, x, y, imgWidth, imgHeight, rowHeight, context) {
			var $image = $entry.find('img');
			$image.css('width', imgWidth);
			$image.css('height', imgHeight);
			$image.css('margin-left', - imgWidth / 2);
			$image.css('margin-top', - imgHeight / 2);
			$entry.width(imgWidth);
			$entry.height(rowHeight);
			$entry.css('top', y);
			$entry.css('left', x);

			//DEBUG// console.log('displayEntry: $image.width() = ' + $image.width() + ' $image.height() = ' + $image.height());

			// Image reloading for an high quality of thumbnails
			var imageSrc = $image.attr('src');
			var newImageSrc = imageSrc.replace(context.settings.extension, '').replace(context.usedSizeRangeRegExp, '') + 
								getSuffix(imgWidth, imgHeight, context) + 
								imageSrc.match(context.settings.extension)[0];

			$image.one('error', function () {
				//DEBUG// console.log('revert the original image');
				$image.attr('src', $image.data('jg.originalSrc')); //revert to the original thumbnail, we got it.
			});

			var loadNewImage = function () {
				if (imageSrc !== newImageSrc) { //load the new image after the fadeIn
					$image.attr('src', newImageSrc);
				}
			};

			if (context.settings.cssAnimation) {
				$entry.addClass('entry-visible');
				loadNewImage();
			} else {
				$entry.stop().fadeTo(context.settings.imagesAnimationDuration, 1.0, loadNewImage);
			}

			// Captions ------------------------------
			//TODO option for caption always visible
			var captionMouseEvents = $entry.data('jg.captionMouseEvents');
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
				if ($imgCaption.length !== 0 && typeof captionMouseEvents === 'undefined') { 
					captionMouseEvents = {
						mouseenter: onEntryMouseEnterForCaption,
						mouseleave: onEntryMouseLeaveForCaption
					};
					$entry.on('mouseenter', undefined, context, captionMouseEvents.mouseenter);
					$entry.on('mouseleave', undefined, context, captionMouseEvents.mouseleave);
					$entry.data('jg.captionMouseEvents', captionMouseEvents);
				}
			} else {
				if (typeof captionMouseEvents !== 'undefined') {
					$entry.off('mouseenter', undefined, context, captionMouseEvents.mouseenter);
					$entry.off('mouseleave', undefined, context, captionMouseEvents.mouseleave);
					$entry.removeData('jg.captionMouseEvents');
				}
			}

		}

		function prepareBuildingRow(context, isLastRow) {
			var i, $entry, $image, stdImgW, newImgW, newImgH, justify = true;
			var minHeight = 0;
			var availableWidth = context.galleryWidth;
			var extraW = availableWidth - context.buildingRow.width - 
							((context.buildingRow.entriesBuff.length - 1) * context.settings.margins);

			//Skip the last row if we can't justify it and the lastRow == 'hide'
			if (isLastRow && context.settings.lastRow === 'hide' && (extraW / availableWidth > context.settings.justifyThreshold)) {
				for (i = 0; i < context.buildingRow.entriesBuff.length; i++) {
					$entry = context.buildingRow.entriesBuff[i];
					if (context.settings.cssAnimation) 
						$entry.removeClass('entry-visible');						
					else
						$entry.stop().fadeTo(0, 0);
				}
				return -1;
			}

			// With lastRow = nojustify, justify if (extraW / availableWidth <= context.settings.justifyThreshold)
			if (isLastRow && context.settings.lastRow === 'nojustify' && (extraW / availableWidth > context.settings.justifyThreshold)) 
				justify = false;

			//DEBUG// console.log('prepareBuildingRow: availableWidth: ' + availableWidth + ' extraW: ' + extraW);

			for (i = 0; i < context.buildingRow.entriesBuff.length; i++) {
				$image = context.buildingRow.entriesBuff[i].find('img');
				stdImgW = Math.ceil($image.data('jg.imgw') / ($image.data('jg.imgh') / context.settings.rowHeight));

				if (justify) {
					if (i < context.buildingRow.entriesBuff.length - 1) {
						// Scale proportionally of the image aspect ratio (the more is long, the more can be extended)
						newImgW = stdImgW + Math.ceil(stdImgW / context.buildingRow.width * extraW);
					} else {
						newImgW = availableWidth;
					}

					// Scale factor for the new width is (newImgW / stdImgW), hence:
					newImgH = Math.ceil(context.settings.rowHeight * (newImgW / stdImgW));

					// With fixedHeight the newImgH >= rowHeight. In some cases here this is not satisfied (due to the justification)
					if (context.settings.fixedHeight && newImgH < context.settings.rowHeight) {
						newImgW = stdImgW;
						newImgH = context.settings.rowHeight;
					}
				} else {
					newImgW = stdImgW;
					newImgH = context.settings.rowHeight;
				}

				$image.data('jg.imgw', newImgW);
				$image.data('jg.imgh', newImgH);

				//DEBUG// console.log($image.attr('alt') + ' new jq.imgw = ' + $image.data('jg.imgw') + ' new jg.imgh = ' + $image.data('jg.imgh'));
				
				availableWidth -= newImgW + ((i < context.buildingRow.entriesBuff.length - 1) ? context.settings.margins : 0);
				if (i === 0 || minHeight > newImgH) minHeight = newImgH;
			}

			//DEBUG// console.log('availableWidth: ' + availableWidth + ' extraW: ' + extraW);

			if (context.settings.fixedHeight) minHeight = context.settings.rowHeight;
			return minHeight;
		}

		function rewind(context) {
			context.lastAnalyzedIndex = -1;
			context.buildingRow.entriesBuff = [];
			context.buildingRow.width = 0;
			context.offY = 0;
			context.firstRowFlushed = false;
		}

		function flushRow(context, isLastRow) {
			var $entry, $image, minHeight, offX = 0;

			//DEBUG// console.log('flush (width: ' + context.buildingRow.width + ', galleryWidth: ' + context.galleryWidth + ', ' + 'isLastRow: ' + isLastRow + ')');

			minHeight = prepareBuildingRow(context, isLastRow);
			if (isLastRow && context.settings.lastRow === 'hide' && minHeight === -1) {
				context.buildingRow.entriesBuff = [];
				context.buildingRow.width = 0;
				return;
			}

			if (context.settings.maxRowHeight > 0 && context.settings.maxRowHeight < minHeight)
				minHeight = context.settings.maxRowHeight;
			else if (context.settings.maxRowHeight === 0 && (1.5 * context.settings.rowHeight) < minHeight)
				minHeight = 1.5 * context.settings.rowHeight;

			for (var i = 0; i < context.buildingRow.entriesBuff.length; i++) {
				$entry = context.buildingRow.entriesBuff[i];
				$image = $entry.find('img');
				displayEntry($entry, offX, context.offY, $image.data('jg.imgw'), $image.data('jg.imgh'), minHeight, context);
				offX += $image.data('jg.imgw') + context.settings.margins;
			}

			//Gallery Height
			context.$gallery.height(context.offY + minHeight +
				(context.spinner.active ? context.spinner.$el.innerHeight() : 0)
			);

			if(!isLastRow) {
				//Ready for a new row
				context.offY += minHeight + context.settings.margins;

				//DEBUG// console.log('minHeight: ' + minHeight + ' offY: ' + context.offY);

				context.buildingRow.entriesBuff = []; //clear the array creating a new one
				context.buildingRow.width = 0;
				context.firstRowFlushed = true;
				context.$gallery.trigger('jg.rowflush');
			}
		}

		function checkWidth(context) {
			context.checkWidthIntervalId = setInterval(function () {
				var galleryWidth = parseInt(context.$gallery.width(), 10);
				if (context.galleryWidth !== galleryWidth) {
					//DEBUG// console.log("resize. old: " + context.galleryWidth + " new: " + galleryWidth);
					
					context.galleryWidth = galleryWidth;
					rewind(context);

					// Restart to analyze
					startImgAnalyzer(context, true);
				}
			}, context.settings.refreshTime);
		}	

		function startLoadingSpinnerAnimation(spinnerContext) {
			clearInterval(spinnerContext.intervalId);
			spinnerContext.intervalId = setInterval(function () {
				if (spinnerContext.phase < spinnerContext.$points.length) 
					spinnerContext.$points.eq(spinnerContext.phase).fadeTo(spinnerContext.timeslot, 1);
				else
					spinnerContext.$points.eq(spinnerContext.phase - spinnerContext.$points.length).fadeTo(spinnerContext.timeslot, 0);
				spinnerContext.phase = (spinnerContext.phase + 1) % (spinnerContext.$points.length * 2);
			}, spinnerContext.timeslot);
		}

		function stopLoadingSpinnerAnimation(spinnerContext) {
			clearInterval(spinnerContext.intervalId);
			spinnerContext.intervalId = null;
		}

		function stopImgAnalyzerStarter(context) {
			context.yield.flushed = 0;
			if (context.imgAnalyzerTimeout !== null) clearTimeout(context.imgAnalyzerTimeout);
		}

		function startImgAnalyzer(context, isForResize) {
			stopImgAnalyzerStarter(context);
			context.imgAnalyzerTimeout = setTimeout(function () { analyzeImages(context, isForResize); }, 0.001);
			analyzeImages(context, isForResize);
		}

		function analyzeImages(context, isForResize) {
			
			//DEBUG// 
			/*var rnd = parseInt(Math.random() * 10000, 10);
			//DEBUG// console.log('analyzeImages ' + rnd + ' start');
			//DEBUG// console.log('images status: ');
			for (var i = 0; i < context.entries.length; i++) {
				var $entry = $(context.entries[i]);
				var $image = $entry.find('img');
				//DEBUG// console.log(i + ' (alt: ' + $image.attr('alt') + 'loaded: ' + $image.data('jg.loaded') + ')');
			}*/

			/* The first row */
			var isLastRow;
			
			for (var i = context.lastAnalyzedIndex + 1; i < context.entries.length; i++) {
				var $entry = $(context.entries[i]);
				var $image = $entry.find('img');

				//DEBUG// console.log('checking: ' + i + ' (loaded: ' + $image.data('jg.loaded') + ')');

				if ($image.data('jg.loaded') === true) {
					var newImgW = Math.ceil($image.data('jg.imgw') / ($image.data('jg.imgh') / context.settings.rowHeight));

					//DEBUG// console.log('analyzed img ' + $image.attr('alt') + ', imgW: ' + $image.data('jg.imgw') + ', imgH: ' + $image.data('jg.imgh') + ', rowWidth: ' + context.buildingRow.width);

					isLastRow = i >= context.entries.length - 1;
					
					// NOTE: If we have fixed height we need to never have a negative extraW, else some images can be hided.
					//				This is because the images need to have a smaller height, but fixed height doesn't allow it
					if (context.buildingRow.width + (context.settings.fixedHeight ? newImgW : newImgW / 2) + 
								(context.buildingRow.entriesBuff.length - 1) * 
								context.settings.margins > context.galleryWidth) {

						flushRow(context, isLastRow);

						if(++context.yield.flushed >= context.yield.every) {
							//DEBUG// console.log("yield");
							startImgAnalyzer(context, isForResize);
							return;
						}

					}

					context.buildingRow.entriesBuff.push($entry);
					context.buildingRow.width += newImgW;
					context.lastAnalyzedIndex = i;

				} else if ($image.data('jg.loaded') !== 'error') {
					return;
				}
			}

			// Last row flush (the row is not full)
			if (context.buildingRow.entriesBuff.length > 0) flushRow(context, context.firstRowFlushed);

			if (context.spinner.active) {
				context.spinner.active = false;
				context.$gallery.height(context.$gallery.height() - context.spinner.$el.innerHeight());
				context.spinner.$el.detach();
				stopLoadingSpinnerAnimation(context.spinner);
			}

			/* Stop, if there is, the timeout to start the analyzeImages.
					This is because an image can be set loaded, and the timeout can be set,
					but this image can be analyzed yet. 
			*/
			stopImgAnalyzerStarter(context);

			//On complete callback
			if (!isForResize) context.$gallery.trigger('jg.complete'); else context.$gallery.trigger('jg.resize');

			//DEBUG// console.log('analyzeImages ' + rnd +  ' end');
		}

		function checkSettings (context) {

			function checkSuffixesRange(range) {
				if (typeof context.settings.sizeRangeSuffixes[range] !== 'string')
					throw 'sizeRangeSuffixes.' + range + ' must be a string';
			}

			function checkOrConvertNumber(setting) {
				if (typeof context.settings[setting] === 'string') {
					context.settings[setting] = parseFloat(context.settings[setting], 10);
					if (isNaN(context.settings[setting])) throw 'invalid number for ' + setting;
				} else if (typeof context.settings[setting] === 'number') {
					if (isNaN(context.settings[setting])) throw 'invalid number for ' + setting;
				} else {
					throw setting + ' must be a number';
				}
			}

			if (typeof context.settings.sizeRangeSuffixes !== 'object')
				throw 'sizeRangeSuffixes must be defined and must be an object';

			checkSuffixesRange('lt100');
			checkSuffixesRange('lt240');
			checkSuffixesRange('lt320');
			checkSuffixesRange('lt500');
			checkSuffixesRange('lt640');
			checkSuffixesRange('lt1024');

			checkOrConvertNumber('rowHeight');
			checkOrConvertNumber('maxRowHeight');
			checkOrConvertNumber('margins');

			if (context.settings.lastRow !== 'nojustify' &&
					context.settings.lastRow !== 'justify' &&
					context.settings.lastRow !== 'hide') {
				throw 'lastRow must be "nojustify", "justify" or "hide"';
			}

			checkOrConvertNumber('justifyThreshold');
			if (context.settings.justifyThreshold < 0 || context.settings.justifyThreshold > 1)
				throw 'justifyThreshold must be in the interval [0,1]';
			if (typeof context.settings.cssAnimation !== 'boolean') {
				throw 'cssAnimation must be a boolean';	
			}
			
			checkOrConvertNumber('captionsAnimationDuration');
			checkOrConvertNumber('imagesAnimationDuration');

			checkOrConvertNumber('captionsVisibleOpacity');
			if (context.settings.captionsVisibleOpacity < 0 || context.settings.captionsVisibleOpacity > 1)
				throw 'captionsVisibleOpacity must be in the interval [0,1]';

			if (typeof context.settings.fixedHeight !== 'boolean') {
				throw 'fixedHeight must be a boolean';	
			}

			if (typeof context.settings.captions !== 'boolean') {
				throw 'captions must be a boolean';	
			}

			checkOrConvertNumber('refreshTime');

			if (typeof context.settings.randomize !== 'boolean') {
				throw 'randomize must be a boolean';	
			}

		}

		return this.each(function (index, gallery) {

			var $gallery = $(gallery);
			$gallery.addClass('justified-gallery');

			var context = $gallery.data('jg.context');
			if (typeof context === 'undefined') {

				if (typeof arg !== 'undefined' && arg !== null && typeof arg !== 'object') 
					throw 'The argument must be an object';

				// Spinner init
				var $spinner = $('<div class="spinner"><span></span><span></span><span></span></div>');

				//Context init
				context = {
					settings : $.extend({}, defaults, arg),
					imgAnalyzerTimeout : null,
					entries : null,
					buildingRow : {
						entriesBuff : [],
						width : 0
					},
					lastAnalyzedIndex : -1,
					firstRowFlushed : false,
					yield : {
						every : 2, /* do a flush every context.yield.every flushes (
												* must be greater than 1, else the analyzeImages will loop */
						flushed : 0 //flushed rows without a yield
					},
					offY : 0,
					spinner : {
						active : false,
						phase : 0,
						timeslot : 150,
						$el : $spinner,
						$points : $spinner.find('span'),
						intervalId : null
					},
					checkWidthIntervalId : null,
					galleryWidth : $gallery.width(),
					$gallery : $gallery
				};

				$gallery.data('jg.context', context);

			} else if (arg === 'norewind') {
				// In this case we don't rewind, and analyze all the images
			} else {
				context.settings = $.extend({}, context.settings, arg);
				rewind(context);
			}
			
			checkSettings(context);

			context.entries = $gallery.find('> a, > div').toArray();
			if (context.entries.length === 0) return;

			// Randomize
			if (context.settings.randomize) {
				context.entries.sort(function () { return Math.random() * 2 - 1; });
				$.each(context.entries, function () {
					$(this).appendTo($gallery);
				});
			}

			context.usedSizeRangeRegExp = new RegExp("(" + 
				context.settings.sizeRangeSuffixes.lt100 + "|" + 
				context.settings.sizeRangeSuffixes.lt240 + "|" + 
				context.settings.sizeRangeSuffixes.lt320 + "|" + 
				context.settings.sizeRangeSuffixes.lt500 + "|" + 
				context.settings.sizeRangeSuffixes.lt640 + "|" + 
				context.settings.sizeRangeSuffixes.lt1024 + ")$"
			);

			if (context.settings.maxRowHeight > 0 && context.settings.maxRowHeight < context.settings.rowHeight)
				context.settings.maxRowHeight = context.settings.rowHeight;

			var imagesToLoad = false;
			$.each(context.entries, function (index, entry) {
				var $entry = $(entry);
				var $image = $entry.find('img');

				if ($image.data('jg.loaded') !== true) {
					$image.data('jg.loaded', false);

					//DEBUG// console.log('listed ' + $image.attr('alt'));

					imagesToLoad = true;

					// Spinner start
					if (context.spinner.active === false) {
						context.spinner.active = true;
						$gallery.append(context.spinner.$el);
						$gallery.height(context.offY + context.spinner.$el.innerHeight());
						startLoadingSpinnerAnimation(context.spinner);
					}

					// Link Rel global overwrite
					if (context.settings.rel !== null) $entry.attr('rel', context.settings.rel);

					// Link Target global overwrite
					if (context.settings.target !== null) $entry.attr('target', context.settings.target);

					// Image src
					var imageSrc = (typeof $image.data('safe-src') !== 'undefined') ? $image.data('safe-src') : $image.attr('src');
					$image.data('jg.originalSrc', imageSrc);
					$image.attr('src', imageSrc);

					/* Check if the image is loaded or not using another image object.
							We cannot use the 'complete' image property, because some browsers, 
							with a 404 set complete = true
					*/
					var loadImg = new Image();
					var $loadImg = $(loadImg);
					$loadImg.one('load', function imgLoaded () {
						//DEBUG// console.log('img load (alt: ' + $image.attr('alt') + ')');
						$image.off('load error');
						$image.data('jg.imgw', loadImg.width);
						$image.data('jg.imgh', loadImg.height);
						$image.data('jg.loaded', true);
						startImgAnalyzer(context, false);
					});
					$loadImg.one('error', function imgLoadError () {
						//DEBUG// console.log('img error (alt: ' + $image.attr('alt') + ')');
						$image.off('load error');
						$image.data('jg.loaded', 'error');
						startImgAnalyzer(context, false);
					});
					loadImg.src = imageSrc;

				}

			});

			if (!imagesToLoad) startImgAnalyzer(context, false);
			checkWidth(context);
		});

	};
	
}(jQuery));
