export enum LastRowModes {
  JUSTIFY = 'justify',
  NO_JUSTIFY = 'nojustify',
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  HIDE = 'hide',
}

export enum EventType {
  RowFlush = 'jg.rowflush',
  Resize = 'jg.resize',
  Complete = 'jg.complete',
  Destroy = 'jg.destroy',
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
