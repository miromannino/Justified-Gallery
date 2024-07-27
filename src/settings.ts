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
  triggerEvent: (name: string) => void;
};

export const JustifiedGallerySettingsDefaults: JustifiedGallerySettings = {
  // Mapping of size ranges to suffixes for image sizes (e.g., Flickr configuration)
  sizeRangeSuffixes: {
    100: '_t', // used when longest is less than 100px
    240: '_m', // used when longest is between 101px and 240px
    320: '_n', // ...
    500: '',
    640: '_z',
    1024: '_b', // used as else case because it is the last
  },
  // Optional function to generate the thumbnail path
  // (overrides sizeRangeSuffixes)
  thumbnailPath: undefined /* If defined, sizeRangeSuffixes is not used.
  This function should accept three arguments: current path, width, and height */,

  // Required height for each row, must be greater than 0
  rowHeight: 120,

  // Maximum row height, can be a positive number, string (e.g., '300%'),
  // or false to deactivate
  maxRowHeight: false /* String '[0-9]+%' to express in percentage 
    (e.g. 300% means that the row height can't exceed 3 * rowHeight) */,

  // Maximum number of rows to display (0 disables this setting)
  maxRowsCount: 0,

  // Margin between images
  margins: 1,

  // Border width for each image; negative means it equals the margin,
  // 0 disables the border
  border: -1,

  // Mode for handling the last row
  lastRow: LastRowModes.NO_JUSTIFY, // Same as 'left'

  // Threshold for image justification, a number between 0 and 1
  justifyThreshold: 0.9 /* If row width / available space > 0.90, 
    it will always be justified, ignoring the lastRow setting */,

  // If true, waits until all thumbnails are loaded
  waitThumbnailsLoad: true,

  // Enable/disable captions for images
  captions: true,

  // Relation attribute for links (e.g., 'noopener', null for none)
  rel: null, // Rewrites the rel attribute for each analyzed link

  // Target attribute for links (e.g., '_blank', null for none)
  target: null, // Rewrites the target attribute for all links

  // Regular expression to match the image file extension
  extension: /\.[^.\\/]+$/,

  // Time interval in milliseconds to check for page width changes
  refreshTime: 200,

  // Pixel threshold for width changes before the gallery rebuilds
  refreshSensitivity: 0,

  // If true, randomizes the order of images
  randomize: false,

  // Enables right-to-left layout mode if true
  rtl: false,

  // Sorting function or false to disable sorting
  sort: false /* Options:
    - false: no sorting
    - function: uses the function as a comparator (see Array.prototype.sort())
  */,

  // Filtering function, string, or false to disable filtering
  filter: false /* Options:
    - false, null, or undefined: disables filter
    - function: invoked with arguments (entry, index, array). Returns true 
                to keep the entry, false otherwise.
                Follows Array.prototype.filter() specifications
  */,

  // Selector for gallery entries
  selector: 'a',

  // Selector for images within each entry
  imgSelector: 'img, a > img, svg, a > svg',

  // Function to trigger custom events (e.g., callbacks)
  triggerEvent: () => {},
};
