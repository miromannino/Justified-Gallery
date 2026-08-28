/**
 * Gets the image in the given entry
 * @param entry - The entry element to search in
 * @param imgSelector - The selector used to find images within an entry
 */
export const imgFromEntry = (
  entry: HTMLElement,
  imgSelector: string
): HTMLImageElement | null => {
  return entry.querySelector<HTMLImageElement>(imgSelector);
};

/**
 * Gets the caption in the given entry
 * @param entry - The entry element to search in
 * @returns The found caption element or null
 */
export const captionFromEntry = (entry: HTMLElement): HTMLElement | null => {
  return entry.querySelector<HTMLElement>('.jg-caption');
};

/**
 * Validates the caption
 *
 * @param caption - The caption that should be validated
 * @returns boolean - Validation result
 */
export const isValidCaption = (caption: string | null | undefined): boolean => {
  return (
    caption !== undefined && caption !== null && caption.trim().length > 0
  );
};

/**
 * Shows the images that are in the given entry
 *
 * @param entry - The entry element containing images
 * @param callback - The callback that is called when the show animation is
 * finished
 */
export const showImg = (entry: HTMLElement, callback?: () => void): void => {
  entry.classList.add('jg-entry-visible');
  if (callback) callback();
};

/**
 * Display the entry caption. If the caption element doesn't exist,
 * it creates the caption using the 'alt' or the 'title' attributes.
 *
 * @param entry - The entry element to process
 * @param imgSelector - The selector used to find images within an entry
 * @param captionsEnabled - Whether captions are enabled in the settings
 */
export const displayEntryCaption = (
  entry: HTMLElement,
  imgSelector: string,
  captionsEnabled: boolean
): void => {
  const image = imgFromEntry(entry, imgSelector);
  if (image && captionsEnabled) {
    let imgCaption = captionFromEntry(entry);

    // Create it if it doesn't exist
    if (imgCaption === null) {
      let caption = image.getAttribute('alt');
      if (!isValidCaption(caption)) caption = entry.getAttribute('title');

      if (isValidCaption(caption)) {
        // Create only if we found something
        imgCaption = document.createElement('div');
        imgCaption.className = 'jg-caption';
        imgCaption.textContent = caption!;
        entry.appendChild(imgCaption);
        entry.dataset.jgCreatedCaption = 'true';
      }
    }
  }
};
