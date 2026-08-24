import { createSpinner } from './helpers';

export class LoadingSpinner {
  readonly element: HTMLDivElement;
  private phase = 0;
  private readonly timeSlot = 150;
  private intervalId: number | undefined;

  constructor() {
    this.element = createSpinner();
  }

  get isRunning(): boolean {
    return this.intervalId !== undefined;
  }

  /**
   * Mounts the spinner in the gallery and starts its phase animation.
   * @param onMounted - Called with the spinner's height once it's in the DOM,
   * so the caller can grow the gallery height to fit it.
   */
  start(gallery: HTMLElement, onMounted: (spinnerHeight: number) => void): void {
    const spinnerPoints = Array.from(this.element.querySelectorAll('span'));

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    gallery.appendChild(this.element);
    onMounted(this.element.offsetHeight);

    this.intervalId = window.setInterval(() => {
      if (this.phase < spinnerPoints.length) {
        spinnerPoints[this.phase].style.opacity = '1';
      } else {
        spinnerPoints[this.phase - spinnerPoints.length].style.opacity = '0';
      }
      this.phase = (this.phase + 1) % (spinnerPoints.length * 2);
    }, this.timeSlot);
  }

  /**
   * Stops the phase animation and removes the spinner from the DOM.
   * @param onUnmounting - Called with the spinner's height before it's
   * removed, so the caller can shrink the gallery height accordingly.
   */
  stop(onUnmounting: (spinnerHeight: number) => void): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    onUnmounting(this.element.offsetHeight);
    this.element.remove();
  }
}
