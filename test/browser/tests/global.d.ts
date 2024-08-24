import { JustifiedGallery } from '@/main';
import { EventType } from '@/types';

declare global {
  interface Window {
    jg: JustifiedGallery;
    jgTriggerEvent: (name: EventType) => void;
  }
}
