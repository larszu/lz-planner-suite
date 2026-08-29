# Planner drift report

Divergence between the suite's vendored `apps/*` copies and the standalone upstream repos.
Classification compares line multisets and is triage, not a merge. See the header of
`scripts/planner-drift.mjs`.

`expected-overlay` is the deliberate `@avplan/*` import rewrite and is not drift.

| App | drift | only-upstream | only-suite | two-way | upstream-ahead | suite-ahead | expected-overlay |
| --- | --- | --- | --- | --- | --- | --- | --- |
| cable-planner | 40 | 6 | 6 | 26 | 0 | 2 | 5 |
| multicam-planner | 31 | 0 | 11 | 19 | 0 | 1 | 3 |
| light-planner | 27 | 3 | 8 | 16 | 0 | 0 | 3 |

## Files needing manual reconciliation (two-way)

### cable-planner

| File | lines only in suite | lines only upstream |
| --- | --- | --- |
| `renderer/components/Settings/tabs/IntegrationsTab.tsx` | 60 | 148 |
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
| `components/Sidebar/Sidebar.tsx` | 112 | 87 |
| `components/Layout/StartupAssistant.tsx` | 63 | 43 |
| `index.css` | 82 | 6 |
| `inventory/InventoryDialog.tsx` | 43 | 35 |
| `components/Export/ExportPanel.tsx` | 38 | 37 |
| `components/Preview/CameraPreview.tsx` | 40 | 33 |
| `components/Layout/Header.tsx` | 43 | 25 |
| `components/Templates/TemplateSelector.tsx` | 37 | 26 |
| `App.tsx` | 31 | 27 |
| `components/Sidebar/CustomCameraForm.tsx` | 25 | 20 |
| `components/Venue3D/Venue3D.tsx` | 29 | 13 |
| `components/Venue2D/Venue2D.tsx` | 22 | 13 |
| `store/useStore.ts` | 27 | 1 |
| `components/Sidebar/AiPlanAnalysis.tsx` | 12 | 10 |
| `components/Sidebar/Calculator.tsx` | 5 | 3 |
| `types/index.ts` | 3 | 3 |
| `__tests__/inventoryContract.test.ts` | 2 | 2 |
| `components/Sidebar/CalculationBreakdown.tsx` | 3 | 1 |
| `data/cameras.ts` | 2 | 2 |

### light-planner

| File | lines only in suite | lines only upstream |
| --- | --- | --- |
| `App.tsx` | 81 | 34 |
| `components/PropertyPanel.tsx` | 37 | 34 |
| `components/PlanCanvas.tsx` | 41 | 24 |
| `App.css` | 45 | 19 |
| `components/ScheduleDialog.tsx` | 38 | 25 |
| `components/Scene3D.tsx` | 53 | 7 |
| `i18n/index.ts` | 13 | 47 |
| `components/TopBar.tsx` | 34 | 15 |
| `components/ToolRail.tsx` | 19 | 11 |
| `main.tsx` | 26 | 2 |
| `components/FixtureEditor.tsx` | 11 | 10 |
| `components/VersionDialog.tsx` | 11 | 4 |
| `inventory/InventoryDialog.tsx` | 7 | 3 |
| `components/Sidebar.tsx` | 6 | 3 |
| `components/StatusBar.tsx` | 5 | 1 |
| `components/AboutDialog.tsx` | 1 | 3 |
