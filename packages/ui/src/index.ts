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
  confirmDialog,
  alertDialog,
  promptDialog,
  type ConfirmDialogOptions,
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
