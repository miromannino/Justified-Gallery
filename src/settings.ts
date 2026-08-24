import { EventType } from './events';
import { checkOrConvertNumber } from './helpers';

export enum LastRowModes {
  JUSTIFY = 'justify',
  NO_JUSTIFY = 'nojustify',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  HIDE = 'hide',
}

export type JustifiedGallerySettings = {
  // Mapping of size ranges to suffixes for image sizes
  sizeRangeSuffixes: Record<number | string, string>;

  // Optional function to generate the thumbnail path
  thumbnailPath?: (
    currentPath: string,
    width: number,
    height: number,
    image?: HTMLImageElement
  ) => string;

  // Required height for each row, must be greater than 0
  rowHeight: number;

  // Maximum row height, can be a positive number, string (e.g., '300%'), or false
  maxRowHeight: number | string | false;

  // Maximum number of rows to be displayed (0 disables this setting)
  maxRowsCount: number;

  // Margin between images
  margins: number;

  // Border width for each image; negative means it equals the margin, 0 disables the border
  border: number;

  // Mode for handling the last row (options defined in LastRowModes)
  lastRow: LastRowModes;

  // Threshold for image justification, a number between 0 and 1
  justifyThreshold: number;

  // If true, waits until all thumbnails are loaded
  waitThumbnailsLoad: boolean;

  // Enable/disable captions for images
  captions: boolean;

  // Relation attribute for links (e.g., 'noopener', null for none)
  rel: string | null;

  // Target attribute for links (e.g., '_blank', null for none)
  target: string | null;

  // Regular expression to match the image file extension
  extension: RegExp;

  // Time interval in milliseconds to check for gallery width changes
  refreshTime: number;

  // Pixel threshold for width changes before the gallery rebuilds
  refreshSensitivity: number;

  // If true, randomizes the order of images
  randomize: boolean;

  // Enables right-to-left layout mode if true
  rtl: boolean;

  // Sorting function or false to disable sorting
  sort: false | ((a: HTMLElement, b: HTMLElement) => number);

  // Filtering function, string, or false to disable filtering
  filter:
    | false
    | string
    | ((entry: HTMLElement, index: number, array: HTMLElement[]) => boolean);

  // Selector for gallery entries
  selector: string;

  // Selector for images within each entry
  imgSelector: string;

  // Function to trigger custom events (e.g., callbacks)
  triggerEvent: (name: EventType) => void;
};

/**
 * Checks the `sizeRangeSuffixes` and, if necessary, converts
 * its keys from string (e.g., 'lt100') to integers.
 *
 * @param settings - The settings object to check and mutate.
 */
export const checkSizeRangesSuffixes = (
  settings: JustifiedGallerySettings
): void => {
  if (
    typeof settings.sizeRangeSuffixes !== 'object' ||
    settings.sizeRangeSuffixes === null
  ) {
    throw new Error(
      'sizeRangeSuffixes must be defined and must be an object'
    );
  }

  const suffixRanges = Object.keys(settings.sizeRangeSuffixes);

  const newSizeRngSuffixes: Record<number, string> = {};
  for (const key of suffixRanges) {
    const numIdx = parseInt(key.replace(/^[a-z]+/, ''), 10);
    if (isNaN(numIdx)) {
      throw new Error(`sizeRangeSuffixes keys must contain correct numbers (invalid key '${key}')`);
    }
    newSizeRngSuffixes[numIdx] = settings.sizeRangeSuffixes[key];
  }

  settings.sizeRangeSuffixes = newSizeRngSuffixes;
};

/**
 * It brings all the indexes from the sizeRangeSuffixes and it orders them.
 * They are then sorted and returned.
 *
 * @param settings - The settings object to read `sizeRangeSuffixes` from.
 * @returns Array of sorted suffix ranges
 */
export const retrieveSuffixRanges = (
  settings: JustifiedGallerySettings
): number[] => {
  const suffixRanges = Object.keys(settings.sizeRangeSuffixes)
    .map((rangeIdx) => parseInt(rangeIdx, 10))
    .sort((a, b) => a - b);

  return suffixRanges;
};

/**
 * Checks the settings to ensure they are valid and converts values where
 * necessary.
 *
 * @param settings - The settings object to check and mutate.
 */
export const checkSettings = (settings: JustifiedGallerySettings): void => {
  checkSizeRangesSuffixes(settings);

  checkOrConvertNumber(settings, 'rowHeight');
  checkOrConvertNumber(settings, 'margins');
  checkOrConvertNumber(settings, 'border');
  checkOrConvertNumber(settings, 'maxRowsCount');

  if (!Object.values(LastRowModes).includes(settings.lastRow)) {
    throw new Error(
      `lastRow must be one of: ${Object.values(LastRowModes).join(', ')}`
    );
  }

  checkOrConvertNumber(settings, 'justifyThreshold');
  if (settings.justifyThreshold < 0 || settings.justifyThreshold > 1) {
    throw new Error('justifyThreshold must be in the interval [0, 1]');
  }

  if (typeof settings.captions !== 'boolean') {
    throw new Error('captions must be a boolean');
  }

  checkOrConvertNumber(settings, 'refreshTime');
  checkOrConvertNumber(settings, 'refreshSensitivity');

  if (typeof settings.randomize !== 'boolean') {
    throw new Error('randomize must be a boolean');
  }

  if (typeof settings.selector !== 'string') {
    throw new Error('selector must be a string');
  }

  if (settings.sort !== false && typeof settings.sort !== 'function') {
    throw new Error('sort must be false or a comparison function');
  }

  if (
    settings.filter !== false &&
    typeof settings.filter !== 'function' &&
    typeof settings.filter !== 'string'
  ) {
    throw new Error('filter must be false, a string, or a filter function');
  }
};

/**
 * Resolves `settings.maxRowHeight` (a number, a percentage string like
 * '150%', or `false`) against `settings.rowHeight` into an absolute pixel
 * value, clamped to be at least `rowHeight`. Returns `undefined` when
 * `maxRowHeight` is disabled.
 *
 * @param settings - The settings object to read `rowHeight`/`maxRowHeight` from.
 */
export const retrieveMaxRowHeight = (
  settings: JustifiedGallerySettings
): number | undefined => {
  const { rowHeight, maxRowHeight } = settings;
  let newMaxRowHeight: number;

  if (typeof maxRowHeight === 'string') {
    const percentageMatch = maxRowHeight.match(/^([0-9]+)%$/);
    newMaxRowHeight = percentageMatch
      ? (rowHeight * parseFloat(percentageMatch[1])) / 100
      : parseFloat(maxRowHeight);
  } else if (typeof maxRowHeight === 'number') {
    newMaxRowHeight = maxRowHeight;
  } else if (
    maxRowHeight === false ||
    maxRowHeight === null ||
    maxRowHeight === undefined
  ) {
    return undefined;
  } else {
    throw new Error('maxRowHeight must be a number or a percentage');
  }

  if (isNaN(newMaxRowHeight)) {
    throw new Error('Invalid number for maxRowHeight');
  }

  return Math.max(newMaxRowHeight, rowHeight);
};
