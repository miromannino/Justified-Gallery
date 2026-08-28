import { JustifiedGallerySettings } from './settings';

/**
 * Returns the best suffix given the width and the height.
 * @param width - The width of the image.
 * @param height - The height of the image.
 * @param settings - The gallery settings (uses `sizeRangeSuffixes`).
 * @param suffixRanges - The sorted suffix range keys (see `retrieveSuffixRanges`).
 * @returns The best suffix.
 */
export const getSuffix = (
  width: number,
  height: number,
  settings: JustifiedGallerySettings,
  suffixRanges: number[]
): string => {
  const longestSide = Math.max(width, height);

  // Find the first suffix range where the longest side fits
  for (const range of suffixRanges) {
    if (longestSide <= range) {
      return settings.sizeRangeSuffixes[range];
    }
  }

  // If no range was found, return the suffix for the largest range
  const lastRange = suffixRanges[suffixRanges.length - 1];
  return settings.sizeRangeSuffixes[lastRange];
};

/**
 * Remove the suffix from the string, if present.
 *
 * @param str - The original string.
 * @param suffix - The suffix to remove.
 * @returns A new string without the suffix.
 */
export const removeSuffix = (str: string, suffix: string): string => {
  return suffix.length > 0 && str.endsWith(suffix)
    ? str.slice(0, -suffix.length)
    : str;
};

/**
 * Get the used suffix of a particular URL
 * @param str - The URL string to check
 * @param settings - The gallery settings (uses `sizeRangeSuffixes`).
 * @returns string - The used suffix or an empty string if not found
 */
export const getUsedSuffix = (
  str: string,
  settings: JustifiedGallerySettings
): string => {
  for (const si of Object.keys(settings.sizeRangeSuffixes)) {
    const suffix = settings.sizeRangeSuffixes[parseInt(si)];
    if (suffix.length === 0) continue;
    if (str.endsWith(suffix)) return suffix;
  }
  return '';
};

/**
 * Given an image src, with the width and the height, returns the new
 * image src with the best suffix to show the best quality thumbnail.
 *
 * @param imageSrc - The source URL of the image
 * @param imgWidth - The width of the image
 * @param imgHeight - The height of the image
 * @param image - The image element
 * @param settings - The gallery settings
 * @returns string - The new image source URL with the best suffix
 */
export const newSrc = (
  imageSrc: string,
  imgWidth: number,
  imgHeight: number,
  image: HTMLImageElement,
  settings: JustifiedGallerySettings,
  suffixRanges: number[]
): string => {
  let newImageSrc: string;

  if (settings.thumbnailPath) {
    newImageSrc = settings.thumbnailPath(imageSrc, imgWidth, imgHeight, image);
  } else {
    const matchRes = imageSrc.match(settings.extension);
    const ext = matchRes ? matchRes[0] : '';
    newImageSrc = imageSrc.replace(settings.extension, '');
    newImageSrc = removeSuffix(
      newImageSrc,
      getUsedSuffix(newImageSrc, settings)
    );
    newImageSrc += getSuffix(imgWidth, imgHeight, settings, suffixRanges) + ext;
  }

  return newImageSrc;
};

/**
 * Extract the image src from the image, looking from the 'data-safe-src',
 * and if it can't be found, from the 'src' attribute. It saves in the
 * image data the 'jg.originalSrc' field, with the extracted src.
 *
 * @param image - The image element to analyze
 * @returns string - The extracted src
 */
export const imgSrcFromImage = (image: HTMLImageElement): string => {
  const imageSrc = image.dataset.safeSrc ?? image.getAttribute('src') ?? '';
  const imageSrcLoc = image.dataset.safeSrc ? 'data-safe-src' : 'src';

  // Store the extracted source in custom data attributes
  image.dataset.jgOriginalSrc = imageSrc;
  image.dataset.jgSrc = imageSrc;
  image.dataset.jgOriginalSrcLoc = imageSrcLoc;

  return imageSrc;
};

/**
 * Revert the image src to the default value.
 *
 * @param img - The image element to reset.
 */
export const resetImgSrc = (img: HTMLImageElement): void => {
  if (img.dataset.jgOriginalSrcLoc === 'src') {
    img.src = img.dataset.jgOriginalSrc || '';
  } else {
    img.src = '';
  }
};

/**
 * Checks if the image is loaded or not using another image object.
 * We cannot use the 'complete' image property, because some browsers,
 * with a 404 set complete = true.
 *
 * @param imageSrc - The image source URL to load.
 * @param onLoad - Callback that is called when the image has been loaded.
 * @param onError - Callback that is called in case of an error.
 */
export const onImageEvent = (
  imageSrc: string,
  onLoad?: (img: HTMLImageElement) => void,
  onError?: (img: HTMLImageElement) => void
): void => {
  if (!onLoad && !onError) return;

  const memImage = new Image();

  // Event listeners for load and error
  const handleLoad = () => {
    memImage.removeEventListener('load', handleLoad);
    memImage.removeEventListener('error', handleError);
    onLoad?.(memImage);
  };

  const handleError = () => {
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
};
