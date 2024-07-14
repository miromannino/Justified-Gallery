/**
 * Justified Gallery - v4.0.0
 * http://miromannino.github.io/Justified-Gallery/
 *
 * Copyright (c) 2024 Miro Mannino
 * Licensed under the MIT license.
 */

import { checkOrConvertNumber, createSpinner, shuffleArray } from './helpers';
import {
  JustifiedGallerySettings,
  JustifiedGallerySettingsDefaults,
  LastRowModes,
} from './settings';
import './style/justified-gallery.scss';

export class JustifiedGallery {
  gallery: HTMLElement;
  settings: JustifiedGallerySettings;
  imgAnalyzerTimeout: number | undefined;
  entries: HTMLElement[] = [];
  lastFetchedEntry: HTMLElement | undefined;
  buildingRow: {
    entriesBuff: HTMLElement[];
    aspectRatio: number;
    width: number;
    height: number;
  };
  lastAnalyzedIndex: number;
  yield: {
    every: number; // do a flush every n flushes (must be greater than 1)
    flushed: number;
  };
  border: number;
  maxRowHeight: number | undefined;
  suffixRanges: number[];
  offY: number;
  rows: number;
  scrollBarOn: boolean;
  checkWidthIntervalId: number | undefined;
  galleryWidth: number;
  galleryHeightToSet: number;
  // Scroll position not restoring: https://github.com/miromannino/Justified-Gallery/issues/221
  galleryPrevStaticHeight: number;
  spinner: {
    phase: number;
    timeSlot: number;
    el: HTMLDivElement;
    intervalId: number | undefined;
  };

  /**
   * Returns the best suffix given the width and the height.
   * @param {number} width - The width of the image.
   * @param {number} height - The height of the image.
   * @returns {string} The best suffix.
   */
  getSuffix(width: number, height: number) {
    const longestSide = Math.max(width, height);

    // Find the first suffix range where the longest side fits
    for (const range of this.suffixRanges) {
      if (longestSide <= range) {
        return this.settings.sizeRangeSuffixes[range];
      }
    }

    // If no range was found, return the suffix for the largest range
    const lastRange = this.suffixRanges[this.suffixRanges.length - 1];
    return this.settings.sizeRangeSuffixes[lastRange];
  }

  /**
   * Remove the suffix from the string, if present.
   *
   * @param str - The original string.
   * @param suffix - The suffix to remove.
   * @returns A new string without the suffix.
   */
  removeSuffix(str: string, suffix: string) {
    return str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
  }

  /**
   * Get the used suffix of a particular URL
   * @param str - The URL string to check
   * @returns string - The used suffix or an empty string if not found
   */
  getUsedSuffix(str: string): string {
    for (const si of Object.keys(this.settings.sizeRangeSuffixes)) {
      const suffix = this.settings.sizeRangeSuffixes[parseInt(si)];
      if (suffix.length === 0) continue;
      if (str.endsWith(suffix)) return suffix;
    }
    return '';
  }

  /**
   * Given an image src, with the width and the height, returns the new
   * image src with the best suffix to show the best quality thumbnail.
   *
   * @param imageSrc - The source URL of the image
   * @param imgWidth - The width of the image
   * @param imgHeight - The height of the image
   * @param image - The image element
   * @returns string - The new image source URL with the best suffix
   */
  newSrc(
    imageSrc: string,
    imgWidth: number,
    imgHeight: number,
    image: HTMLImageElement
  ): string {
    let newImageSrc: string;

    if (this.settings.thumbnailPath) {
      newImageSrc = this.settings.thumbnailPath(
        imageSrc,
        imgWidth,
        imgHeight,
        image
      );
    } else {
      const matchRes = imageSrc.match(this.settings.extension);
      const ext = matchRes ? matchRes[0] : '';
      newImageSrc = imageSrc.replace(this.settings.extension, '');
      newImageSrc = this.removeSuffix(
        newImageSrc,
        this.getUsedSuffix(newImageSrc)
      );
      newImageSrc += this.getSuffix(imgWidth, imgHeight) + ext;
    }

    return newImageSrc;
  }

  /**
   * Shows the images that are in the given entry
   *
   * @param entry - The entry element containing images
   * @param callback - The callback that is called when the show animation is
   * finished
   */
  showImg(entry: HTMLElement, callback?: () => void): void {
    entry.classList.add('jg-entry-visible');
    if (callback) callback();
  }

  /**
   * Extract the image src from the image, looking from the 'data-safe-src',
   * and if it can't be found, from the 'src' attribute. It saves in the
   * image data the 'jg.originalSrc' field, with the extracted src.
   *
   * @param image - The image element to analyze
   * @returns string - The extracted src
   */
  extractImgSrcFromImage(image: HTMLImageElement): string {
    const imageSrc = image.dataset.safeSrc ?? image.getAttribute('src') ?? '';
    const imageSrcLoc = image.dataset.safeSrc ? 'data-safe-src' : 'src';

    // Store the extracted source in custom data attributes
    image.dataset.jgOriginalSrc = imageSrc; // saved for the destroy method
    image.dataset.jgSrc = imageSrc; // this will change over time
    image.dataset.jgOriginalSrcLoc = imageSrcLoc; // saved for the destroy method

    return imageSrc;
  }

  /**
   * Gets the image in the given entry
   * @param entry - The entry element to search in
   */
  imgFromEntry(entry: HTMLElement) {
    return entry.querySelector<HTMLImageElement>(this.settings.imgSelector);
  }

  /**
   * Gets the caption in the given entry
   * @param entry - The entry element to search in
   * @returns The found caption element or null
   */
  captionFromEntry(entry: HTMLElement): HTMLElement | null {
    const caption = entry.querySelector<HTMLElement>('.jg-caption');
    return caption || null; // Return null if not found
  }

  /**
   * Display the entry
   *
   * @param entry - The entry element to display
   * @param x - The x position where the entry must be positioned
   * @param y - The y position where the entry must be positioned
   * @param imgWidth - The image width
   * @param imgHeight - The image height
   * @param rowHeight - The row height of the row that owns the entry
   */
  displayEntry(
    entry: HTMLElement,
    x: number,
    y: number,
    imgWidth: number,
    imgHeight: number,
    rowHeight: number
  ): void {
    // Set entry dimensions and position
    entry.style.width = `${imgWidth}px`;
    entry.style.height = `${rowHeight}px`;
    entry.style.top = `${y}px`;
    entry.style.left = `${x}px`;

    // Get the image element from the entry
    const image = this.imgFromEntry(entry);
    if (image) {
      image.style.width = `${imgWidth}px`;
      image.style.height = `${imgHeight}px`;
      image.style.marginLeft = `${-imgWidth / 2}px`;
      image.style.marginTop = `${-imgHeight / 2}px`;

      // Image reloading for high quality thumbnails
      const currentImageSrc = image.dataset.jgSrc;
      if (currentImageSrc) {
        const newImageSrc = this.newSrc(
          currentImageSrc,
          imgWidth,
          imgHeight,
          image
        );

        // Error handling for image loading
        const handleError = () => this.resetImgSrc(image);
        image.addEventListener('error', handleError, { once: true });

        const loadNewImage = () => {
          image.setAttribute('src', newImageSrc);
        };

        if (entry.dataset.jgLoaded === 'skipped' && newImageSrc) {
          this.onImageEvent(newImageSrc, () => {
            this.showImg(entry, loadNewImage); // load after fade-in
            entry.dataset.jgLoaded = 'true';
          });
        } else {
          this.showImg(entry, loadNewImage); // load after fade-in
        }
      }
    } else {
      this.showImg(entry);
    }

    this.displayEntryCaption(entry);
  }

  /**
   * Display the entry caption. If the caption element doesn't exist,
   * it creates the caption using the 'alt' or the 'title' attributes.
   *
   * @param entry - The entry element to process
   */
  displayEntryCaption(entry: HTMLElement): void {
    const image = this.imgFromEntry(entry);
    if (image && this.settings.captions) {
      let imgCaption = this.captionFromEntry(entry);

      // Create it if it doesn't exist
      if (imgCaption === null) {
        let caption = image.getAttribute('alt');
        if (!this.isValidCaption(caption))
          caption = entry.getAttribute('title');

        if (this.isValidCaption(caption)) {
          // Create only if we found something
          imgCaption = document.createElement('div');
          imgCaption.className = 'jg-caption';
          imgCaption.textContent = caption!;
          entry.appendChild(imgCaption);
          entry.dataset.jgCreatedCaption = 'true';
        }
      }
    }
  }

  /**
   * Validates the caption
   *
   * @param caption - The caption that should be validated
   * @returns boolean - Validation result
   */
  isValidCaption(caption: string | null | undefined): boolean {
    return (
      caption !== undefined && caption !== null && caption.trim().length > 0
    );
  }

  /**
   * Clear the building row data to be used for a new row
   */
  clearBuildingRow(): void {
    this.buildingRow.entriesBuff = []; // Clear the buffer of entries
    this.buildingRow.aspectRatio = 0; // Reset aspect ratio
    this.buildingRow.width = 0; // Reset width
  }

  /**
   * Justify the building row, preparing it to display
   *
   * @param isLastRow - Indicates if this is uhe last row
   * @param hiddenRow - `undefined` or `false` for normal behavior.
   *                    `true` to hide the row
   * @returns boolean - `true` if the row has been justified, otherwise `false`
   */
  prepareBuildingRow(isLastRow: boolean, hiddenRow?: boolean) {
    let justify = true;
    let minHeight = 0;

    let availableWidth =
      this.galleryWidth -
      2 * this.border -
      (this.buildingRow.entriesBuff.length - 1) * this.settings.margins;
    const rowHeight = availableWidth / this.buildingRow.aspectRatio;
    let defaultRowHeight = this.settings.rowHeight;
    const justifiable =
      this.buildingRow.width / availableWidth > this.settings.justifyThreshold;

    // Handle hidden or unjustifyable last row scenarios
    if (
      hiddenRow ||
      (isLastRow && this.settings.lastRow === 'hide' && !justifiable)
    ) {
      this.buildingRow.entriesBuff.forEach((entry) => {
        entry.classList.remove('jg-entry-visible');
      });
      return -1;
    }

    // Handle last row scenario where justification is not required
    if (
      isLastRow &&
      !justifiable &&
      this.settings.lastRow !== 'justify' &&
      this.settings.lastRow !== 'hide'
    ) {
      justify = false;

      if (this.rows > 0) {
        defaultRowHeight =
          (this.offY - this.border - this.settings.margins * this.rows) /
          this.rows;
        justify =
          (defaultRowHeight * this.buildingRow.aspectRatio) / availableWidth >
          this.settings.justifyThreshold;
      }
    }

    // Process each entry in the building row to set new dimensions
    this.buildingRow.entriesBuff.forEach((entry, i) => {
      const imgAspectRatio =
        parseFloat(entry.dataset.jgWidth ?? '0') /
        parseFloat(entry.dataset.jgHeight ?? '1');

      let newImgW: number;
      let newImgH: number;

      if (justify) {
        newImgW =
          i === this.buildingRow.entriesBuff.length - 1
            ? availableWidth
            : rowHeight * imgAspectRatio;
        newImgH = rowHeight;
      } else {
        newImgW = defaultRowHeight * imgAspectRatio;
        newImgH = defaultRowHeight;
      }

      availableWidth -= Math.round(newImgW);
      entry.dataset.jgJwidth = Math.round(newImgW).toString();
      entry.dataset.jgJheight = Math.ceil(newImgH).toString();

      if (i === 0 || minHeight > newImgH) minHeight = newImgH;
    });

    this.buildingRow.height = minHeight;
    return justify;
  }

  /**
   * Flush a row: justify it, modify the gallery height accordingly to the
   * row height
   *
   * @param isLastRow
   * @param hiddenRow undefined or false for normal behavior. hiddenRow = true
   *                  to hide the row.
   */
  flushRow(isLastRow: boolean, hiddenRow?: boolean): void {
    const settings = this.settings;

    const buildingRowRes = this.prepareBuildingRow(isLastRow, hiddenRow);

    if (
      hiddenRow ||
      (isLastRow && settings.lastRow === 'hide' && buildingRowRes === -1)
    ) {
      this.clearBuildingRow();
      return;
    }

    if (this.maxRowHeight && this.buildingRow.height > this.maxRowHeight) {
      this.buildingRow.height = this.maxRowHeight;
    }

    // Align last (unjustified) row
    let offX = this.border;
    if (
      isLastRow &&
      (settings.lastRow === 'center' || settings.lastRow === 'right')
    ) {
      let availableWidth =
        this.galleryWidth -
        2 * this.border -
        (this.buildingRow.entriesBuff.length - 1) * settings.margins;

      for (const entry of this.buildingRow.entriesBuff) {
        availableWidth -= parseFloat(entry.dataset.jgJwidth ?? '0');
      }

      if (settings.lastRow === 'center') {
        offX += Math.round(availableWidth / 2);
      } else if (settings.lastRow === 'right') {
        offX += availableWidth;
      }
    }

    const lastEntryIdx = this.buildingRow.entriesBuff.length - 1;
    for (let i = 0; i <= lastEntryIdx; i++) {
      const entry =
        this.buildingRow.entriesBuff[settings.rtl ? lastEntryIdx - i : i];
      const imgWidth = parseFloat(entry.dataset.jgJwidth ?? '0');
      const imgHeight = parseFloat(entry.dataset.jgJheight ?? '0');

      this.displayEntry(
        entry,
        offX,
        this.offY,
        imgWidth,
        imgHeight,
        this.buildingRow.height
      );
      offX += imgWidth + settings.margins;
    }

    // Set gallery height
    this.galleryHeightToSet = this.offY + this.buildingRow.height + this.border;
    this.setGalleryTempHeight(
      this.galleryHeightToSet + this.spinner.el.offsetHeight
    );

    if (
      !isLastRow ||
      (this.buildingRow.height <= settings.rowHeight && buildingRowRes)
    ) {
      // Ready for a new row
      this.offY += this.buildingRow.height + settings.margins;
      this.rows += 1;
      this.clearBuildingRow();
      this.settings.triggerEvent.call(this, 'jg.rowflush');
    }
  }

  /**
   * Remembers the current gallery height and sets it as a static height.
   */
  rememberGalleryHeight(): void {
    this.galleryPrevStaticHeight = this.gallery.clientHeight;
    this.gallery.style.height = `${this.galleryPrevStaticHeight}px`;
  }

  /**
   * Sets a temporary height for the gallery that can only grow.
   *
   * @param height - The new height to set.
   */
  setGalleryTempHeight(height: number): void {
    this.galleryPrevStaticHeight = Math.max(
      height,
      this.galleryPrevStaticHeight
    );
    this.gallery.style.height = `${this.galleryPrevStaticHeight}px`;
  }

  /**
   * Sets the final height of the gallery.
   *
   * @param height - The final height to set.
   */
  setGalleryFinalHeight(height: number): void {
    this.galleryPrevStaticHeight = height;
    this.gallery.style.height = `${height}px`;
  }

  /**
   * Checks the width of the gallery container to determine if a new
   * justification is needed.
   */
  checkWidth(): void {
    this.checkWidthIntervalId = window.setInterval(() => {
      // If the gallery is not currently visible, abort.
      if (!this.gallery.offsetParent) return;

      const galleryWidth = this.gallery.clientWidth;
      if (
        Math.abs(galleryWidth - this.galleryWidth) >
        this.settings.refreshSensitivity
      ) {
        this.galleryWidth = galleryWidth;
        this.rewind();

        this.rememberGalleryHeight();

        // Restart the image analysis process
        this.startImgAnalyzer(true);
      }
    }, this.settings.refreshTime);
  }

  /**
   * Stops the spinner animation and modifies the gallery height to exclude
   * the spinner.
   */
  stopLoadingSpinnerAnimation(): void {
    const spinnerContext = this.spinner;
    if (spinnerContext.intervalId) {
      clearInterval(spinnerContext.intervalId);
      spinnerContext.intervalId = undefined;
    }
    this.setGalleryTempHeight(
      this.gallery.clientHeight - this.spinner.el.offsetHeight
    );
    spinnerContext.el.remove();
  }

  /**
   * Starts the spinner animation.
   */
  startLoadingSpinnerAnimation(): void {
    const spinnerContext = this.spinner;
    const spinnerPoints = Array.from(
      spinnerContext.el.querySelectorAll('span')
    );

    // Clear any existing interval
    if (spinnerContext.intervalId) {
      clearInterval(spinnerContext.intervalId);
      this.spinner.intervalId = undefined;
    }

    this.gallery.appendChild(spinnerContext.el);
    this.setGalleryTempHeight(
      this.offY + this.buildingRow.height + this.spinner.el.offsetHeight
    );

    // Set up spinner animation
    spinnerContext.intervalId = window.setInterval(() => {
      if (spinnerContext.phase < spinnerPoints.length) {
        spinnerPoints[spinnerContext.phase].style.opacity = '1';
      } else {
        spinnerPoints[
          spinnerContext.phase - spinnerPoints.length
        ].style.opacity = '0';
      }
      spinnerContext.phase =
        (spinnerContext.phase + 1) % (spinnerPoints.length * 2);
    }, spinnerContext.timeSlot);
  }

  /**
   * Rewinds the image analysis to start from the first entry.
   */
  rewind(): void {
    this.lastFetchedEntry = undefined;
    this.lastAnalyzedIndex = -1;
    this.offY = this.settings.border;
    this.rows = 0;
    this.clearBuildingRow();
  }

  /**
   * @returns The `settings.selector` string rejecting spinner element.
   */
  getSelectorWithoutSpinner(): string {
    return `${this.settings.selector}, div:not(.jg-spinner)`;
  }

  /**
   * @returns An array of all entries matched by `settings.selector`.
   */
  getAllEntries(): HTMLElement[] {
    const selector = this.getSelectorWithoutSpinner();
    return Array.from(this.gallery.querySelectorAll<HTMLElement>(selector));
  }

  /**
   * Updates the entries by searching them from the justified gallery HTML
   * element.
   *
   * @param norewind - If true, only the new entries will be changed
   * (e.g., randomized, sorted, or filtered).
   * @returns True if some entries have been found.
   */
  updateEntries(norewind: boolean): boolean {
    let newEntries: HTMLElement[];

    if (norewind && this.lastFetchedEntry) {
      const selector = this.getSelectorWithoutSpinner();
      newEntries = this.getNextEntries(this.lastFetchedEntry, selector);
    } else {
      this.entries = [];
      newEntries = this.getAllEntries();
    }

    if (newEntries.length > 0) {
      // Sort or randomize
      if (typeof this.settings.sort === 'function') {
        newEntries = newEntries.sort(this.settings.sort);
      } else if (this.settings.randomize) {
        newEntries = shuffleArray(newEntries);
      }
      this.lastFetchedEntry = newEntries[newEntries.length - 1];

      // Filter
      if (this.settings.filter) {
        newEntries = this.filterArray(newEntries);
      } else {
        this.resetFilters(newEntries);
      }
    }

    this.entries = this.entries.concat(newEntries);
    return true;
  }

  /**
   * Helper function to get the next sibling entries
   */
  private getNextEntries(
    lastEntry: HTMLElement,
    selector: string
  ): HTMLElement[] {
    const siblings: HTMLElement[] = [];
    let next = lastEntry.nextElementSibling as HTMLElement | null;

    while (next) {
      if (next.matches(selector)) {
        siblings.push(next);
      }
      next = next.nextElementSibling as HTMLElement | null;
    }
    return siblings;
  }

  /**
   * Apply the entries order to the DOM, iterating the entries and appending
   * the images.
   *
   * @param entries - The entries that have been modified and must be
   * re-ordered in the DOM.
   */
  insertToGallery(entries: HTMLElement[]): void {
    entries.forEach((entry) => {
      this.gallery.appendChild(entry);
    });
  }

  /**
   * Reset the filters by removing the 'jg-filtered' class from all the entries
   *
   * @param entries - The array of entries to reset.
   */
  resetFilters(entries: HTMLElement[]): void {
    entries.forEach((entry) => entry.classList.remove('jg-filtered'));
  }

  /**
   * Filter the entries based on their classes (if a string has been passed)
   * or using a function for filtering.
   *
   * @param entries - The array of entries to filter.
   * @returns The filtered array.
   */
  filterArray(entries: HTMLElement[]): HTMLElement[] {
    const { filter } = this.settings;

    if (typeof filter === 'string') {
      // Filter only keeping the entries that match the selector string
      return entries.filter((entry) => {
        if (entry.matches(filter)) {
          entry.classList.remove('jg-filtered');
          return true;
        } else {
          entry.classList.add('jg-filtered');
          entry.classList.remove('jg-visible');
          return false;
        }
      });
    } else if (typeof filter === 'function') {
      // Filter using the passed function
      const filteredArr = entries.filter(filter);

      entries.forEach((entry) => {
        if (!filteredArr.includes(entry)) {
          entry.classList.add('jg-filtered');
          entry.classList.remove('jg-visible');
        } else {
          entry.classList.remove('jg-filtered');
        }
      });

      return filteredArr;
    }

    return entries;
  }

  /**
   * Revert the image src to the default value.
   *
   * @param img - The image element to reset.
   */
  resetImgSrc(img: HTMLImageElement): void {
    if (img.dataset.jgOriginalSrcLoc === 'src') {
      img.src = img.dataset.jgOriginalSrc || '';
    } else {
      img.src = '';
    }
  }

  /**
   * Destroy the Justified Gallery instance.
   *
   * It clears all the CSS properties added in the style attributes.
   * The original values for these CSS attributes are not backed up because
   * it impacts performance and isn't generally needed for a uniform set of
   * images where classes are used.
   */
  destroy(): void {
    clearInterval(this.checkWidthIntervalId);
    this.stopImgAnalyzerStarter();

    // Get a fresh list of entries as filtered entries are absent
    // in `this.entries`
    this.getAllEntries().forEach((entry) => {
      // Reset entry style
      entry.style.width = '';
      entry.style.height = '';
      entry.style.top = '';
      entry.style.left = '';
      entry.removeAttribute('data-jg-loaded');
      entry.classList.remove('jg-entry', 'jg-filtered', 'jg-entry-visible');

      // Reset image style
      const img = this.imgFromEntry(entry);
      if (img) {
        img.style.width = '';
        img.style.height = '';
        img.style.marginLeft = '';
        img.style.marginTop = '';
        this.resetImgSrc(img);
        img.removeAttribute('data-jg-original-src');
        img.removeAttribute('data-jg-original-srcloc');
        img.removeAttribute('data-jg-src');
      }

      // Remove caption
      const caption = this.captionFromEntry(entry);
      if (caption) {
        if (entry.dataset.jgCreatedCaption) {
          // Remove also the caption element if created by JG
          delete entry.dataset.jgCreatedCaption;
          caption?.remove();
        }
      }
    });

    this.gallery.style.height = '';
    this.gallery.classList.remove('justified-gallery');
    this.gallery.removeAttribute('data-jg-controller');
    this.settings.triggerEvent.call(this, 'jg.destroy');
  }

  /**
   * Analyze the images and builds the rows. It returns if it found an image
   * that is not loaded.
   *
   * @param isForResize - If the image analyzer is called for resizing or not,
   * to call a different callback at the end.
   */
  analyzeImages(isForResize: boolean): void {
    for (let i = this.lastAnalyzedIndex + 1; i < this.entries.length; i++) {
      const entry = this.entries[i] as HTMLElement;
      const entryLoaded = entry.dataset.jgLoaded;

      if (entryLoaded === 'true' || entryLoaded === 'skipped') {
        const availableWidth =
          this.galleryWidth -
          2 * this.border -
          (this.buildingRow.entriesBuff.length - 1) * this.settings.margins;

        const imgAspectRatio =
          parseFloat(entry.dataset.jgWidth || '0') /
          parseFloat(entry.dataset.jgHeight || '1');

        this.buildingRow.entriesBuff.push(entry);
        this.buildingRow.aspectRatio += imgAspectRatio;
        this.buildingRow.width += imgAspectRatio * this.settings.rowHeight;
        this.lastAnalyzedIndex = i;

        if (
          availableWidth / (this.buildingRow.aspectRatio + imgAspectRatio) <
          this.settings.rowHeight
        ) {
          this.flushRow(
            false,
            this.settings.maxRowsCount > 0 &&
              this.rows === this.settings.maxRowsCount
          );

          if (++this.yield.flushed >= this.yield.every) {
            this.startImgAnalyzer(isForResize);
            return;
          }
        }
      } else if (entryLoaded !== 'error') {
        return;
      }
    }

    // Last row flush (the row is not full)
    if (this.buildingRow.entriesBuff.length > 0) {
      this.flushRow(
        true,
        this.settings.maxRowsCount > 0 &&
          this.rows === this.settings.maxRowsCount
      );
    }

    if (this.spinner.intervalId) {
      this.stopLoadingSpinnerAnimation();
    }

    /* Stop, if there is, the timeout to start the analyzeImages.
     This is because an image can be set loaded, and the timeout can be set,
     but this image can be analyzed yet. */
    this.stopImgAnalyzerStarter();

    this.setGalleryFinalHeight(this.galleryHeightToSet);

    // On complete callback
    this.settings.triggerEvent.call(
      this,
      isForResize ? 'jg.resize' : 'jg.complete'
    );
  }

  /**
   * Stops any ImgAnalyzer starter (that has an assigned timeout).
   */
  stopImgAnalyzerStarter(): void {
    this.yield.flushed = 0;
    if (this.imgAnalyzerTimeout) {
      clearTimeout(this.imgAnalyzerTimeout);
      this.imgAnalyzerTimeout = undefined;
    }
  }

  /**
   * Starts the image analyzer. It is not immediately called to let the
   * browser update the view.
   *
   * @param isForResize - Specifies if the image analyzer must be called for
   * resizing or not.
   */
  startImgAnalyzer(isForResize: boolean): void {
    this.stopImgAnalyzerStarter();
    this.imgAnalyzerTimeout = window.setTimeout(() => {
      this.analyzeImages(isForResize);
    }, 1); // we can't start it immediately due to a IE different behaviour
  }

  /**
   * Checks if the image is loaded or not using another image object.
   * We cannot use the 'complete' image property, because some browsers,
   * with a 404 set complete = true.
   *
   * @param imageSrc - The image source URL to load.
   * @param onLoad - Callback that is called when the image has been loaded.
   * @param onError - Callback that is called in case of an error.
   */
  onImageEvent(
    imageSrc: string,
    onLoad?: (img: HTMLImageElement) => void,
    onError?: (img: HTMLImageElement) => void
  ): void {
    if (!onLoad && !onError) return;

    const memImage = new Image();

    // Event listeners for load and error
    const handleLoad = () => {
      memImage.removeEventListener('load', handleLoad);
      memImage.removeEventListener('error', handleError);
      onLoad?.(memImage);
    };

    const handleError = (e: unknown) => {
      console.log('error image', imageSrc, e);
      memImage.removeEventListener('load', handleLoad);
      memImage.removeEventListener('error', handleError);
      onError?.(memImage);
    };

    if (onLoad) {
      memImage.addEventListener('load', handleLoad, { once: true });
    }
    if (onError) {
      memImage.addEventListener('error', handleError, { once: true });
    }

    memImage.src = imageSrc;
  }

  /**
   * Checks the `sizeRangeSuffixes` and, if necessary, converts
   * its keys from string (e.g., 'lt100') to integers.
   */
  checkSizeRangesSuffixes(): void {
    if (
      typeof this.settings.sizeRangeSuffixes !== 'object' ||
      this.settings.sizeRangeSuffixes === null
    ) {
      throw new Error(
        'sizeRangeSuffixes must be defined and must be an object'
      );
    }

    const suffixRanges = Object.keys(this.settings.sizeRangeSuffixes);

    const newSizeRngSuffixes: Record<number, string> = { 0: '' };
    for (let i = 0; i < suffixRanges.length; i++) {
      const key = suffixRanges[i];
      if (typeof key === 'string') {
        try {
          const numIdx = parseInt(key.replace(/^[a-z]+/, ''), 10);
          if (isNaN(numIdx)) {
            throw new Error(`Invalid number in key '${key}'`);
          }
          newSizeRngSuffixes[numIdx] = this.settings.sizeRangeSuffixes[key];
        } catch (e) {
          throw new Error(
            `sizeRangeSuffixes keys must contain correct numbers (${e})`
          );
        }
      } else {
        newSizeRngSuffixes[Number(key)] = this.settings.sizeRangeSuffixes[key];
      }
    }

    this.settings.sizeRangeSuffixes = newSizeRngSuffixes;
  }

  /**
   * It brings all the indexes from the sizeRangeSuffixes and it orders them.
   * They are then sorted and returned.
   * @returns Array of sorted suffix ranges
   */
  retrieveSuffixRanges() {
    const suffixRanges = Object.keys(this.settings.sizeRangeSuffixes)
      .map((rangeIdx) => parseInt(rangeIdx, 10))
      .sort((a, b) => a - b);

    return suffixRanges;
  }

  /**
   * Checks the settings to ensure they are valid and converts values where
   * necessary.
   */
  checkSettings(): void {
    this.checkSizeRangesSuffixes();

    checkOrConvertNumber(this.settings, 'rowHeight');
    checkOrConvertNumber(this.settings, 'margins');
    checkOrConvertNumber(this.settings, 'border');
    checkOrConvertNumber(this.settings, 'maxRowsCount');

    if (!Object.values(LastRowModes).includes(this.settings.lastRow)) {
      throw new Error(
        `lastRow must be one of: ${Object.values(LastRowModes).join(', ')}`
      );
    }

    checkOrConvertNumber(this.settings, 'justifyThreshold');
    if (
      this.settings.justifyThreshold < 0 ||
      this.settings.justifyThreshold > 1
    ) {
      throw new Error('justifyThreshold must be in the interval [0, 1]');
    }

    if (typeof this.settings.captions !== 'boolean') {
      throw new Error('captions must be a boolean');
    }

    checkOrConvertNumber(this.settings, 'refreshTime');
    checkOrConvertNumber(this.settings, 'refreshSensitivity');

    if (typeof this.settings.randomize !== 'boolean') {
      throw new Error('randomize must be a boolean');
    }

    if (typeof this.settings.selector !== 'string') {
      throw new Error('selector must be a string');
    }

    if (
      this.settings.sort !== false &&
      typeof this.settings.sort !== 'function'
    ) {
      throw new Error('sort must be false or a comparison function');
    }

    if (
      this.settings.filter !== false &&
      typeof this.settings.filter !== 'function' &&
      typeof this.settings.filter !== 'string'
    ) {
      throw new Error('filter must be false, a string, or a filter function');
    }
  }

  /**
   * Check and convert the maxRowHeight setting
   * requires rowHeight to be already set
   */
  retrieveMaxRowHeight() {
    const { rowHeight, maxRowHeight } = this.settings;
    let newMaxRowHeight = null;

    if (typeof maxRowHeight === 'string') {
      const percentageMatch = maxRowHeight.match(/^([0-9]+)%$/);

      if (percentageMatch) {
        // Calculate the new max row height as a percentage of the row height
        newMaxRowHeight = (rowHeight * parseFloat(percentageMatch[1])) / 100;
      } else {
        // Direct conversion to a float for other string cases
        newMaxRowHeight = parseFloat(maxRowHeight);
      }
    } else if (typeof maxRowHeight === 'number') {
      // Direct assignment if already a number
      newMaxRowHeight = maxRowHeight;
    } else if (
      maxRowHeight === false ||
      maxRowHeight === null ||
      maxRowHeight === undefined
    ) {
      // Explicit handling for `false`, `null`, or `undefined`
      return undefined;
    } else {
      // Throw an error for unsupported maxRowHeight types
      throw new Error('maxRowHeight must be a number or a percentage');
    }

    // Ensure the result is a valid number
    if (isNaN(newMaxRowHeight)) {
      throw new Error('Invalid number for maxRowHeight');
    }

    // Enforce that the max row height is at least the row height
    if (newMaxRowHeight < rowHeight) {
      newMaxRowHeight = rowHeight;
    }

    return newMaxRowHeight;
  }

  /**
   * Init of Justified Gallery controlled. It analyzes all the entries,
   * starting their loading and calling the image analyzer (that works
   * with loaded images).
   */
  init(): void {
    console.log('INIT', this.gallery);
    let imagesToLoad = false;
    let skippedImages = false;

    this.updateEntries(false);

    this.entries.forEach((entry: HTMLElement) => {
      const image = this.imgFromEntry(entry);

      entry.classList.add('jg-entry');

      if (
        entry.dataset.jgLoaded !== 'true' &&
        entry.dataset.jgLoaded !== 'skipped'
      ) {
        // Link Rel global overwrite
        if (this.settings.rel !== null)
          entry.setAttribute('rel', this.settings.rel);

        // Link Target global overwrite
        if (this.settings.target !== null)
          entry.setAttribute('target', this.settings.target);

        if (image !== null) {
          // Image src
          const imageSrc = this.extractImgSrcFromImage(image);

          /* If we have the height and the width, we don't wait for the image 
          to be loaded, but we start directly with the justification */
          if (!this.settings.waitThumbnailsLoad || !imageSrc) {
            let width = parseFloat(image.getAttribute('width') || 'NaN');
            let height = parseFloat(image.getAttribute('height') || 'NaN');

            if (
              image.tagName === 'svg' &&
              image instanceof SVGGraphicsElement
            ) {
              const svgBox = image.getBBox();
              width = svgBox.width;
              height = svgBox.height;
            }

            if (!isNaN(width) && !isNaN(height)) {
              entry.dataset.jgWidth = width.toString();
              entry.dataset.jgHeight = height.toString();
              entry.dataset.jgLoaded = 'skipped';
              skippedImages = true;
              this.startImgAnalyzer(false);
              return; // continue
            }
          }

          entry.dataset.jgLoaded = 'false';
          imagesToLoad = true;

          // Spinner start
          if (!this.spinner.intervalId) this.startLoadingSpinnerAnimation();

          this.onImageEvent(
            imageSrc,
            (loadImg) => {
              // Image loaded
              entry.dataset.jgWidth = loadImg.width.toString();
              entry.dataset.jgHeight = loadImg.height.toString();
              entry.dataset.jgLoaded = 'true';
              this.startImgAnalyzer(false);
            },
            () => {
              // Image load error
              entry.dataset.jgLoaded = 'error';
              this.startImgAnalyzer(false);
            }
          );
        } else {
          entry.dataset.jgLoaded = 'true';
          entry.dataset.jgWidth = (
            entry.clientWidth ||
            parseFloat(getComputedStyle(entry).width) ||
            1
          ).toString();
          entry.dataset.jgHeight = (
            entry.clientHeight ||
            parseFloat(getComputedStyle(entry).height) ||
            1
          ).toString();
        }
      }
    });

    if (!imagesToLoad && !skippedImages) this.startImgAnalyzer(false);
    this.checkWidth();
  }

  constructor(
    gallery: HTMLElement,
    settings?: Partial<JustifiedGallerySettings>
  ) {
    this.gallery = gallery;
    this.gallery.classList.add('justified-gallery');

    this.settings = { ...JustifiedGallerySettingsDefaults, ...settings };
    this.checkSettings();

    this.imgAnalyzerTimeout = undefined;
    this.entries = [];
    this.buildingRow = {
      entriesBuff: [],
      width: 0,
      height: 0,
      aspectRatio: 0,
    };
    this.lastFetchedEntry = undefined;
    this.lastAnalyzedIndex = -1;
    this.yield = {
      every: 2, // do a flush every n flushes (must be greater than 1)
      flushed: 0, // flushed rows without a yield
    };
    this.border =
      this.settings.border >= 0 ? this.settings.border : this.settings.margins;
    this.maxRowHeight = this.retrieveMaxRowHeight();
    this.suffixRanges = this.retrieveSuffixRanges();
    this.offY = this.border;
    this.rows = 0;
    this.spinner = {
      phase: 0,
      timeSlot: 150,
      el: createSpinner(),
      intervalId: undefined,
    };
    this.scrollBarOn = false;
    this.checkWidthIntervalId = undefined;
    this.galleryWidth = gallery.offsetWidth;
    this.galleryHeightToSet = 0;
    this.galleryPrevStaticHeight = 0;
  }
}
