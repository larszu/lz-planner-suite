/**
 * Englisches Override-Dictionary der Shell, aus Domänen-Teildicts komponiert.
 * Deutsch bleibt Quell-Sprache (Fallback im JSX via t(key, 'Deutsch')).
 */
import { chrome } from './dict/chrome'
import { overview } from './dict/overview'
import { panels } from './dict/panels'
import { board } from './dict/board'
import { config } from './dict/config'

export const en: Record<string, string> = {
  ...chrome,
  ...overview,
  ...panels,
  ...board,
  ...config,
}
