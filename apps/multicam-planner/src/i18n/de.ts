/**
 * Deutsches Override-Dictionary für MultiCam, aus Domänen-Teildicts komponiert.
 * Englisch bleibt Quell-Sprache (Fallback im JSX via t(key, 'English')).
 */
import { sidebar } from './de/sidebar';
import { header } from './de/header';
import { preview } from './de/preview';
import { venue } from './de/venue';

export const de: Record<string, string> = {
  ...sidebar,
  ...header,
  ...preview,
  ...venue,
};
