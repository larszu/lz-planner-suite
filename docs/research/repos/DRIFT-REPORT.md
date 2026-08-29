# Planner drift report

Divergence between the suite's vendored `apps/*` copies and the standalone upstream repos.
Classification compares line multisets and is triage, not a merge. See the header of
`scripts/planner-drift.mjs`.

`expected-overlay` is the deliberate `@avplan/*` import rewrite and is not drift.

| App | drift | only-upstream | only-suite | two-way | upstream-ahead | suite-ahead | expected-overlay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cable-planner | 40 | 6 | 6 | 26 | 0 | 2 | 5 |
| multicam-planner | 75 | 43 | 11 | 21 | 0 | 0 | 3 |
| light-planner | 27 | 3 | 8 | 16 | 0 | 0 | 3 |

## Files needing manual reconciliation (two-way)

### cable-planner

| File | lines only in suite | lines only upstream |
| --- | --- | --- |
| `renderer/components/Settings/tabs/IntegrationsTab.tsx` | 63 | 151 |
| `renderer/components/Onboarding/OnboardingTour.tsx` | 19 | 93 |
| `renderer/components/Project/WelcomeDialog.tsx` | 35 | 59 |
| `main/services/credentialsService.ts` | 18 | 36 |
| `renderer/components/Properties/sections/OptionalFieldsSection.tsx` | 1 | 53 |
| `renderer/store/slices/cableSlice.ts` | 16 | 26 |
| `renderer/components/Canvas/EquipmentNode.tsx` | 3 | 37 |
| `renderer/store/projectStore.ts` | 9 | 30 |
| `main/preload.cts` | 8 | 23 |
| `renderer/components/Layout/MenuBar.tsx` | 25 | 6 |
| `renderer/components/Onboarding/onboardingState.ts` | 11 | 18 |
| `renderer/App.tsx` | 14 | 10 |
| `renderer/lib/modules.ts` | 2 | 12 |
| `renderer/store/slices/mobileSyncSlice.ts` | 5 | 9 |
| `main/ipc/collabDiscoveryIpc.ts` | 7 | 3 |
| `renderer/components/Sync/CollabPanel.tsx` | 6 | 4 |
| `main/ipc/videohubIpc.ts` | 6 | 3 |
| `main/ipc/atemIpc.ts` | 5 | 2 |
| `renderer/components/Properties/CableProperties.tsx` | 4 | 3 |
| `renderer/components/Rack/RackBuilderDialogExportMenu.tsx` | 3 | 2 |
| `renderer/lib/equipmentLayout.ts` | 1 | 4 |
| `main/index.ts` | 2 | 2 |
| `renderer/components/Canvas/BulkConnectDialog.tsx` | 3 | 1 |
| `renderer/components/Inventory/InventoryDialog.tsx` | 2 | 2 |
| `renderer/lib/storageTree.ts` | 2 | 2 |
| `renderer/store/inventoryStore.ts` | 1 | 1 |

### multicam-planner

| File | lines only in suite | lines only upstream |
| --- | --- | --- |
| `components/Sidebar/Sidebar.tsx` | 358 | 718 |
| `components/Preview/CameraPreview.tsx` | 171 | 494 |
| `components/Layout/Header.tsx` | 135 | 160 |
| `store/useStore.ts` | 35 | 193 |
| `components/Venue3D/Venue3D.tsx` | 69 | 132 |
| `types/index.ts` | 5 | 157 |
| `App.tsx` | 48 | 74 |
| `components/Venue2D/Venue2D.tsx` | 47 | 74 |
| `components/Layout/StartupAssistant.tsx` | 68 | 48 |
| `index.css` | 80 | 18 |
| `components/Export/ExportPanel.tsx` | 46 | 45 |
| `inventory/InventoryDialog.tsx` | 49 | 41 |
| `components/Templates/TemplateSelector.tsx` | 49 | 38 |
| `components/Sidebar/CustomCameraForm.tsx` | 42 | 37 |
| `components/Sidebar/Calculator.tsx` | 24 | 22 |
| `components/Sidebar/AiPlanAnalysis.tsx` | 19 | 17 |
| `main.tsx` | 29 | 3 |
| `__tests__/camera.test.ts` | 1 | 27 |
| `utils/camera.ts` | 6 | 17 |
| `components/Sidebar/CalculationBreakdown.tsx` | 4 | 2 |
| `data/cameras.ts` | 2 | 2 |

### light-planner

| File | lines only in suite | lines only upstream |
| --- | --- | --- |
| `components/PropertyPanel.tsx` | 218 | 215 |
| `components/ScheduleDialog.tsx` | 85 | 72 |
| `App.tsx` | 100 | 53 |
| `components/TopBar.tsx` | 74 | 55 |
| `components/FixtureEditor.tsx` | 56 | 55 |
| `components/PlanCanvas.tsx` | 41 | 24 |
| `App.css` | 45 | 19 |
| `components/Scene3D.tsx` | 53 | 7 |
| `i18n/index.ts` | 13 | 47 |
| `components/Sidebar.tsx` | 25 | 22 |
| `components/ToolRail.tsx` | 19 | 11 |
| `main.tsx` | 26 | 2 |
| `components/StatusBar.tsx` | 12 | 8 |
| `components/VersionDialog.tsx` | 11 | 4 |
| `inventory/InventoryDialog.tsx` | 7 | 3 |
| `components/AboutDialog.tsx` | 2 | 4 |
