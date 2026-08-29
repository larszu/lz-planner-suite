import { createOnboardingState } from '@avplan/onboarding-core'
import { STORAGE_KEYS } from '../../lib/storageKeys'

/**
 * Persistence helpers for the onboarding tour. Ein Seen-Flag wird geschrieben,
 * sobald der Nutzer die Tour abschliesst (oder wegklickt); `hasSeenTour` gated
 * damit das automatische Oeffnen beim ersten Start.
 *
 * Seit dem Monorepo-Zusammenzug laeuft das ueber den geteilten Seen-State aus
 * `@avplan/onboarding-core`. Der alte Einzel-Key (`cable-planner.tour.seen.v1`
 * = '1') wird per `migrateFrom` uebernommen, damit Bestandsnutzer die Tour
 * nicht erneut sehen.
 */
const state = createOnboardingState({
  appId: 'cable-planner',
  migrateFrom: [{ key: STORAGE_KEYS.tourSeenV1, flag: 'tour' }],
})

export const hasSeenTour = (): boolean => state.hasSeen('tour')

export const markTourSeen = (): void => state.markSeen('tour')
