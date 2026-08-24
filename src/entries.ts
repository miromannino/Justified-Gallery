import { JustifiedGallerySettings } from './settings';

/**
 * @param gallery - The gallery element to search children in.
 * @param selector - The `settings.selector` string.
 * @returns An array of all direct children matched by `selector`, excluding `.jg-spinner`.
 */
export const getAllEntries = (
  gallery: HTMLElement,
  selector: string
): HTMLElement[] => {
  const children = Array.from(gallery.children) as HTMLElement[];

  return children.filter((child) => {
    if (child.classList.contains('jg-spinner')) {
      return false;
    }

    return child.matches(selector) || child.matches('div');
  });
};

/**
 * Get the next sibling entries using manual filtering.
 *
 * @param lastEntry - The entry to start searching after.
 * @param selector - The `settings.selector` string.
 */
export const getNextEntries = (
  lastEntry: HTMLElement,
  selector: string
): HTMLElement[] => {
  const siblings: HTMLElement[] = [];
  let next = lastEntry.nextElementSibling as HTMLElement | null;

  while (next) {
    if (!next.classList.contains('jg-spinner') && next.matches(selector)) {
      siblings.push(next);
    }

    next = next.nextElementSibling as HTMLElement | null;
  }

  return siblings;
};

/**
 * Apply the entries order to the DOM, iterating the entries and appending
 * the images.
 *
 * @param gallery - The gallery element to append entries to.
 * @param entries - The entries that have been modified and must be
 * re-ordered in the DOM.
 */
export const insertToGallery = (
  gallery: HTMLElement,
  entries: HTMLElement[]
): void => {
  entries.forEach((entry) => {
    gallery.appendChild(entry);
  });
};

/**
 * Reset the filters by removing the 'jg-filtered' class from all the entries
 *
 * @param entries - The array of entries to reset.
 */
export const resetFilters = (entries: HTMLElement[]): void => {
  entries.forEach((entry) => entry.classList.remove('jg-filtered'));
};

/**
 * Filter the entries based on their classes (if a string has been passed)
 * or using a function for filtering.
 *
 * @param entries - The array of entries to filter.
 * @param filter - The `settings.filter` value.
 * @returns The filtered array.
 */
export const filterArray = (
  entries: HTMLElement[],
  filter: JustifiedGallerySettings['filter']
): HTMLElement[] => {
  if (typeof filter === 'string') {
    return entries.filter((entry) => {
      if (entry.matches(filter)) {
        entry.classList.remove('jg-filtered');
        return true;
      } else {
        entry.classList.add('jg-filtered');
        entry.classList.remove('jg-entry-visible');
        return false;
      }
    });
  } else if (typeof filter === 'function') {
    const filteredArr = entries.filter(filter);

    entries.forEach((entry) => {
      if (!filteredArr.includes(entry)) {
        entry.classList.add('jg-filtered');
        entry.classList.remove('jg-entry-visible');
      } else {
        entry.classList.remove('jg-filtered');
      }
    });

    return filteredArr;
  }

  return entries;
};
