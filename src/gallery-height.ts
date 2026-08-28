/**
 * Manages the gallery container's height, growing/shrinking it as rows and
 * the loading spinner are added, and freezing it while a resize is
 * in-progress so the page doesn't jump around.
 *
 * Scroll position not restoring: https://github.com/miromannino/Justified-Gallery/issues/221
 */
export class GalleryHeight {
  private prevStaticHeight = 0;

  constructor(private gallery: HTMLElement) {}

  /**
   * Remembers the current gallery height and sets it as a static height.
   */
  remember(): void {
    this.prevStaticHeight = this.gallery.clientHeight;
    this.gallery.style.height = `${this.prevStaticHeight}px`;
  }

  /**
   * Sets a temporary height for the gallery that can only grow.
   */
  setTemp(height: number): void {
    this.prevStaticHeight = Math.max(height, this.prevStaticHeight);
    this.gallery.style.height = `${this.prevStaticHeight}px`;
  }

  /**
   * Sets the final height of the gallery.
   */
  setFinal(height: number): void {
    this.prevStaticHeight = height;
    this.gallery.style.height = `${height}px`;
  }
}
