/**
 * Justified Gallery - v4.0.0
 * http://miromannino.github.io/Justified-Gallery/
 *
 * Copyright (c) 2026 Miro Mannino
 * Licensed under the MIT license.
 */

import { JustifiedGallerySettingsDefaults } from './defaults';
import {
  displayEntryCaption,
  imgFromEntry,
  showImg,
} from './dom';
import {
  filterArray,
  getAllEntries,
  getNextEntries,
  resetFilters,
} from './entries';
import { EventType } from './events';
import { GalleryHeight } from './gallery-height';
import { shuffleArray } from './helpers';
import { imgSrcFromImage, newSrc, onImageEvent, resetImgSrc } from './image-src';
import { BuildingRow, clearBuildingRow, prepareBuildingRow } from './row-layout';
import {
  checkSettings,
  JustifiedGallerySettings,
  retrieveMaxRowHeight,
  retrieveSuffixRanges,
} from './settings';
import { LoadingSpinner } from './spinner';
import './style/justified-gallery.scss';
import { WidthWatcher } from './width-watcher';

export class JustifiedGallery {
  gallery: HTMLElement;
  settings: JustifiedGallerySettings;
  imgAnalyzerTimeout: number | undefined = undefined;
  entries: HTMLElement[] = [];
  lastFetchedEntry: HTMLElement | undefined = undefined;
  buildingRow: BuildingRow = { entriesBuff: [], aspectRatio: 0, width: 0, height: 0 };
  lastAnalyzedIndex = -1;
  yield = {
    every: 2, // do a flush every n flushes (must be greater than 1)
    flushed: 0, // flushed rows without a yield
  };
  border: number;
  maxRowHeight: number | undefined;
  suffixRanges: number[];
  offY: number;
  rows = 0;
  scrollBarOn = false;
  galleryWidth: number;
  galleryHeightToSet = 0;
  height: GalleryHeight;
  spinner = new LoadingSpinner();
  widthWatcher: WidthWatcher;

  /**
   * Gets the image in the given entry
   * @param entry - The entry element to search in
   */
  imgFromEntry(entry: HTMLElement) {
    return imgFromEntry(entry, this.settings.imgSelector);
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
    entry.style.width = `${imgWidth}px`;
    entry.style.height = `${rowHeight}px`;
    entry.style.top = `${y}px`;
    entry.style.left = `${x}px`;

    const image = this.imgFromEntry(entry);
    if (image) {
      image.style.width = `${imgWidth}px`;
      image.style.height = `${imgHeight}px`;
      image.style.marginLeft = `${-imgWidth / 2}px`;
      image.style.marginTop = `${-imgHeight / 2}px`;

      // Image reloading for high quality thumbnails
      const currentImageSrc = image.dataset.jgSrc;
      if (currentImageSrc) {
        const newImageSrc = newSrc(
          currentImageSrc,
          imgWidth,
          imgHeight,
          image,
          this.settings,
          this.suffixRanges
        );

        // Error handling for image loading
        const handleError = () => resetImgSrc(image);
        image.addEventListener('error', handleError, { once: true });

        const loadNewImage = () => {
          image.setAttribute('src', newImageSrc);
        };

        if (entry.dataset.jgLoaded === 'skipped' && newImageSrc) {
          onImageEvent(newImageSrc, () => {
            showImg(entry, loadNewImage);
            entry.dataset.jgLoaded = 'true';
          });
        } else {
          showImg(entry, loadNewImage);
        }
      }
    } else {
      showImg(entry);
    }

    displayEntryCaption(entry, this.settings.imgSelector, this.settings.captions);
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

    const buildingRowRes = prepareBuildingRow(
      this.buildingRow,
      {
        galleryWidth: this.galleryWidth,
        border: this.border,
        margins: settings.margins,
        justifyThreshold: settings.justifyThreshold,
        rowHeight: settings.rowHeight,
        lastRow: settings.lastRow,
        rows: this.rows,
        offY: this.offY,
      },
      isLastRow,
      hiddenRow
    );

    if (
      hiddenRow ||
      (isLastRow && settings.lastRow === 'hide' && buildingRowRes === -1)
    ) {
      clearBuildingRow(this.buildingRow);
      return;
    }

    if (this.maxRowHeight && this.buildingRow.height > this.maxRowHeight) {
      this.buildingRow.height = this.maxRowHeight;
    }

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
    this.height.setTemp(this.galleryHeightToSet + this.spinner.element.offsetHeight);

    if (
      !isLastRow ||
      (this.buildingRow.height <= settings.rowHeight && buildingRowRes)
    ) {
      this.offY += this.buildingRow.height + settings.margins;
      this.rows += 1;
      clearBuildingRow(this.buildingRow);
      this.settings.triggerEvent.call(this, EventType.RowFlush);
    }
  }

  /**
   * Stops the spinner animation and modifies the gallery height to exclude
   * the spinner.
   */
  stopLoadingSpinnerAnimation(): void {
    this.spinner.stop((spinnerHeight) => {
      this.height.setTemp(this.gallery.clientHeight - spinnerHeight);
    });
  }

  /**
   * Starts the spinner animation.
   */
  startLoadingSpinnerAnimation(): void {
    this.spinner.start(this.gallery, (spinnerHeight) => {
      this.height.setTemp(this.offY + this.buildingRow.height + spinnerHeight);
    });
  }

  /**
   * Rewinds the image analysis to start from the first entry.
   */
  rewind(): void {
    this.lastFetchedEntry = undefined;
    this.lastAnalyzedIndex = -1;
    this.offY = this.settings.border;
    this.rows = 0;
    clearBuildingRow(this.buildingRow);
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
      newEntries = getNextEntries(this.lastFetchedEntry, this.settings.selector);
    } else {
      this.entries = [];
      newEntries = getAllEntries(this.gallery, this.settings.selector);
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
        newEntries = filterArray(newEntries, this.settings.filter);
      } else {
        resetFilters(newEntries);
      }
    }

    this.entries = this.entries.concat(newEntries);
    return true;
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
    this.widthWatcher.stop();
    this.stopImgAnalyzerStarter();

    // Get a fresh list of entries as filtered entries are absent
    // in `this.entries`
    getAllEntries(this.gallery, this.settings.selector).forEach((entry) => {
      entry.style.width = '';
      entry.style.height = '';
      entry.style.top = '';
      entry.style.left = '';
      entry.removeAttribute('data-jg-loaded');
      entry.classList.remove('jg-entry', 'jg-filtered', 'jg-entry-visible');

      const img = this.imgFromEntry(entry);
      if (img) {
        img.style.width = '';
        img.style.height = '';
        img.style.marginLeft = '';
        img.style.marginTop = '';
        resetImgSrc(img);
        img.removeAttribute('data-jg-original-src');
        img.removeAttribute('data-jg-original-srcloc');
        img.removeAttribute('data-jg-src');
      }

      const caption = entry.querySelector<HTMLElement>('.jg-caption');
      if (caption && entry.dataset.jgCreatedCaption) {
        delete entry.dataset.jgCreatedCaption;
        caption.remove();
      }
    });

    this.gallery.style.height = '';
    this.gallery.classList.remove('justified-gallery');
    this.gallery.removeAttribute('data-jg-controller');
    this.settings.triggerEvent.call(this, EventType.Destroy);
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

    if (this.spinner.isRunning) {
      this.stopLoadingSpinnerAnimation();
    }

    /* Stop, if there is, the timeout to start the analyzeImages.
     This is because an image can be set loaded, and the timeout can be set,
     but this image can be analyzed yet. */
    this.stopImgAnalyzerStarter();

    this.height.setFinal(this.galleryHeightToSet);

    // On complete callback
    this.settings.triggerEvent.call(
      this,
      isForResize ? EventType.Resize : EventType.Complete
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
   * Init of Justified Gallery controlled. It analyzes all the entries,
   * starting their loading and calling the image analyzer (that works
   * with loaded images).
   */
  init(): void {
    this.gallery.classList.add('justified-gallery');

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
        if (this.settings.rel !== null)
          entry.setAttribute('rel', this.settings.rel);

        if (this.settings.target !== null)
          entry.setAttribute('target', this.settings.target);

        if (image !== null) {
          const imageSrc = imgSrcFromImage(image);

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

          if (!this.spinner.isRunning) this.startLoadingSpinnerAnimation();

          onImageEvent(
            imageSrc,
            (loadImg) => {
              entry.dataset.jgWidth = loadImg.width.toString();
              entry.dataset.jgHeight = loadImg.height.toString();
              entry.dataset.jgLoaded = 'true';
              this.startImgAnalyzer(false);
            },
            () => {
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
    this.widthWatcher.start();
  }

  constructor(
    gallery: HTMLElement,
    settings?: Partial<JustifiedGallerySettings>
  ) {
    this.gallery = gallery;

    this.settings = { ...JustifiedGallerySettingsDefaults, ...settings };
    checkSettings(this.settings);

    this.border =
      this.settings.border >= 0 ? this.settings.border : this.settings.margins;
    this.maxRowHeight = retrieveMaxRowHeight(this.settings);
    this.suffixRanges = retrieveSuffixRanges(this.settings);
    this.offY = this.border;
    this.galleryWidth = gallery.offsetWidth;
    this.height = new GalleryHeight(gallery);
    this.widthWatcher = new WidthWatcher(
      gallery,
      this.settings.refreshTime,
      this.settings.refreshSensitivity,
      (newWidth) => {
        this.galleryWidth = newWidth;
        this.rewind();
        this.height.remember();
        this.startImgAnalyzer(true);
      }
    );
  }
}
