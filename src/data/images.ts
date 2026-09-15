// Demo photo catalog, ported from the old Jekyll _config.yml `images` list.
// Width/height refer to the `_m` (240px) variant, used when demos set
// waitThumbnailsLoad: false.

export interface DemoImage {
  name: string;
  desc: string;
  width: number;
  height: number;
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const images: DemoImage[] = [
  { name: 'southafrica', desc: 'South Africa Table Mountain', width: 240, height: 156 },
  { name: 'abudhabi', desc: 'Abu Dhabi Skyline', width: 191, height: 240 },
  { name: 'audi-mea', desc: 'Audi with Dubai Skyline', width: 240, height: 159 },
  { name: 'vernazza', desc: 'Vernazza', width: 240, height: 205 },
  { name: 'braise-1', desc: 'Lake Braise', width: 191, height: 240 },
  { name: 'corniche', desc: 'Abu Dhabi Corniche', width: 192, height: 240 },
  { name: 'corno-2', desc: 'Corno Alle Scale Sunset', width: 240, height: 166 },
  { name: 'zaanse', desc: 'Zaanse Schans', width: 240, height: 159 },
  { name: 'corno-stars', desc: 'Corno Alle Scale Startrails', width: 240, height: 240 },
  { name: 'corno-winter', desc: 'Corno Alle Scale Winter', width: 191, height: 240 },
  { name: 'intercontinental', desc: 'Dubai view from Intercontinental', width: 240, height: 237 },
  { name: 'corno', desc: 'Corno Alle Scale Valley in Winter', width: 192, height: 240 },
  { name: 'desert', desc: 'Desert during storm', width: 192, height: 240 },
  { name: 'dubai', desc: 'Dubai intersection', width: 191, height: 240 },
  { name: 'fossil-dunes-2', desc: 'Fossil Dunes', width: 192, height: 240 },
  { name: 'gate-towers', desc: 'Gate Towers', width: 240, height: 240 },
  { name: 'milky-way-tree', desc: 'Milky way tree under the stars', width: 192, height: 240 },
  { name: 'milkyway', desc: 'Milky way and reflections', width: 240, height: 189 },
  { name: 'mosque-2', desc: 'Abu Dhabi Mosque view', width: 238, height: 240 },
  { name: 'mosque', desc: 'Abu Dhabi Mosque inside', width: 191, height: 240 },
  { name: 'rome', desc: 'Rome skyline', width: 240, height: 214 },
];

export const photoUrl = (name: string, suffix = '') => `${base}/photos/${name}${suffix}.jpg`;

// Image that only exists as a `_t` thumbnail (used by the errors-handling demo).
export const onlyTheThumbnailUrl = `${base}/photos/onlythethumbnail_t.jpg`;

// Flickr-style suffixes matching the variants shipped in /photos
// (no unsuffixed range: the originals are too large for demos).
export const sizeRangeSuffixes: Record<string, string> = {
  lt100: '_t',
  lt240: '_m',
  lt320: '_n',
  lt640: '_z',
  lt1024: '_b',
};
