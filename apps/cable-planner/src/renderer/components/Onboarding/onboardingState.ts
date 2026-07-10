import { createOnboardingState } from '@avplan/onboarding-core'
import { STORAGE_KEYS } from '../../lib/storageKeys'

/**
 * Persistence helpers for the onboarding tour — seit dem Monorepo-Zusammenzug
 * ueber den geteilten Seen-State aus `@avplan/onboarding-core`. Der alte
 * Einzel-Key (`cable-planner.tour.seen.v1` = '1') wird per `migrateFrom`
 * uebernommen, damit Bestandsnutzer die Tour nicht erneut sehen.
 */
const state = createOnboardingState({
  appId: 'cable-planner',
  migrateFrom: [{ key: STORAGE_KEYS.tourSeenV1, flag: 'tour' }],
})

export const hasSeenTour = (): boolean => state.hasSeen('tour')

export const markTourSeen = (): void => state.markSeen('tour')
