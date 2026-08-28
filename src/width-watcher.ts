/**
 * Polls the gallery container's width and reports changes, so the gallery
 * can be re-justified when it's resized.
 */
export class WidthWatcher {
  private intervalId: number | undefined;
  private width: number;

  constructor(
    private gallery: HTMLElement,
    private refreshTime: number,
    private refreshSensitivity: number,
    private onWidthChanged: (newWidth: number) => void
  ) {
    this.width = gallery.offsetWidth;
  }

  start(): void {
    this.intervalId = window.setInterval(() => {
      // If the gallery is not currently visible, abort.
      if (!this.gallery.offsetParent) return;

      const galleryWidth = this.gallery.clientWidth;
      if (Math.abs(galleryWidth - this.width) > this.refreshSensitivity) {
        this.width = galleryWidth;
        this.onWidthChanged(galleryWidth);
      }
    }, this.refreshTime);
  }

  stop(): void {
    clearInterval(this.intervalId);
    this.intervalId = undefined;
  }
}
