import { JustifiedGallery } from '@/justified-gallery';
import { EventType } from '@/events';

declare global {
  interface Window {
    jg: JustifiedGallery;
    jgTriggerEvent: (name: EventType) => void;
    jgCompletedCount: number;
  }
}
