export { cn, type ClassValue } from './cn'
export { useTheme, resolveTheme, type ThemePreference, type ResolvedTheme } from './theme'
export { Icon, type IconName, type IconProps } from './icons'
export {
  Button,
  IconButton,
  Panel,
  Badge,
  Kbd,
  Tabs,
  type ButtonProps,
  type IconButtonProps,
  type PanelProps,
  type BadgeProps,
  type TabItem,
  type TabsProps,
} from './primitives'
export { ModuleRail, type RailModule, type ModuleRailProps } from './ModuleRail'
export { Modal, type ModalProps } from './Modal'
export {
  choiceDialog,
  confirmDialog,
  alertDialog,
  promptDialog,
  type ConfirmDialogOptions,
  type DialogChoice,
  type AlertDialogOptions,
  type PromptDialogOptions,
} from './dialog'
export {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  type MenuProps,
  type MenuItemProps,
} from './Menu'
export { ErrorBoundary, type ErrorBoundaryProps } from './ErrorBoundary'
export {
  CommandPalette,
  useCommandPaletteHotkey,
  type CommandPaletteProps,
} from './CommandPalette'
export {
  rankCommands,
  flattenGroups,
  scoreCommand,
  fuzzyScore,
  type Command,
  type CommandContext,
  type RankedGroup,
} from './commands'
export {
  connectShellTheme,
  connectShellSettings,
  connectShellHistory,
  connectShellLexware,
  declareNoHistory,
  postThemeToFrame,
  postSettingsToFrame,
  postCommandToFrame,
  publishShellSetting,
  requestLexware,
  onShellMessage,
  type ShellMessage,
  type ThemeMessage,
  type NavigateMessage,
  type ReadyMessage,
  type SettingsMessage,
  type CommandMessage,
  type HistoryMessage,
  type HistoryHandlers,
  type SettingChangedMessage,
  type LexwareRequestMessage,
  type LexwareResultMessage,
  type LexwareRequestResult,
} from './embed'

export {
  RUNDOWN_KIND,
  RUNDOWN_VERSION,
  RUNDOWN_REF_KINDS,
  RUNDOWN_FIELDS,
  suggestMapping,
  parseClock,
  parseDuration,
  parseDelimited,
  previewRundown,
  rundownFromPreview,
  isRundown,
  rundownFindings,
  rundownCoverage,
  type RundownRefKind,
  type RundownRef,
  type RundownItem,
  type RundownSource,
  type Rundown,
  type RundownField,
  type ColumnMapping,
  type RowSkipReason,
  type SkippedRow,
  type UnresolvedMention,
  type RundownPreview,
  type RundownFindingKind,
  type RundownFinding,
  type RundownCoverage,
} from './rundown'

export {
  RUNDOWN_AUDIENCES,
  NO_TIME_ON_SHEET,
  NO_GEAR_ON_SHEET,
  GEAR_GONE,
  rundownView,
  rundownViewCsv,
  type RundownAudience,
  type RundownView,
} from './rundownViews'

// Die verbindlichen Oberflaechen-Werte (ADR-007). Apps, die keine CSS-
// Variablen lesen koennen — Canvas, Print, SVG-Export, Konva —, holen sie
// hier, statt einen zweiten Satz Hexwerte zu fuehren.
export {
  BRAND_COLORS,
  BRAND_STATUS,
  BRAND_LINES,
  DERIVED_SURFACES,
  TYPE_SCALE,
  KICKER_TRACKING_EM,
  SPACE,
  MOTION,
  FOCUS,
  RADIUS_PX,
  GRID,
  FONT_SANS,
  FONT_MONO,
} from './brand'
