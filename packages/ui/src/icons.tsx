import type { SVGProps } from 'react'

export type IconName =
  | 'raum'
  | 'camera'
  | 'light'
  | 'signal'
  | 'layers'
  | 'library'
  | 'search'
  | 'command'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'undo'
  | 'redo'
  | 'plus'
  | 'close'
  | 'check'
  | 'warning'
  | 'grid'
  | 'cursor'
  | 'hand'
  | 'eye'
  | 'chevron-down'
  | 'wand'
  | 'external'
  | 'nodes'
  | 'ruler'
  | 'rack'
  | 'modules'
  | 'board'

const PATHS: Record<IconName, string> = {
  raum: 'M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5',
  camera: 'M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z M12 17a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z',
  light: 'M12 3a5 5 0 0 1 3 9v2H9v-2a5 5 0 0 1 3-9ZM9 17h6M10 21h4',
  signal: 'M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v5',
  layers: 'm12 3 9 5-9 5-9-5Z M3 13l9 5 9-5M3 8v5M21 8v5',
  library: 'M4 5h4v14H4Zm6 0h4v14h-4Zm7 .6 3 .8-3.4 13.2-3-.8Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.5-3.5',
  command: 'M9 9V7.5a2.5 2.5 0 1 0-2.5 2.5H9Zm0 0h6m-6 0v6m6-6V7.5A2.5 2.5 0 1 1 17.5 10H15Zm0 0v6m0 0h-6m6 0v1.5a2.5 2.5 0 1 0 2.5-2.5H15Zm-6 0v1.5A2.5 2.5 0 1 1 6.5 14H9Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  monitor: 'M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM9 20h6M12 16v4',
  undo: 'M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2',
  redo: 'm15 7 5 5-5 5M20 12H9a5 5 0 0 0 0 10h2',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5 9 17.5 20 6.5',
  warning: 'M12 4 2.5 20h19L12 4Zm0 5v6m0 3v.5',
  grid: 'M4 4h16v16H4ZM4 10h16M4 15h16M10 4v16M15 4v16',
  cursor: 'M5 3l6.5 16 2.2-6.3 6.3-2.2Z',
  hand: 'M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a5 5 0 0 1-5 5h-1.5a4 4 0 0 1-3-1.4L6 16a1.6 1.6 0 0 1 2.4-2L9 15',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'chevron-down': 'm6 9 6 6 6-6',
  wand: 'M15 4V2M15 10V8M19 6h2M11 6h2M6 20l9-9M16.5 8.5 15 7',
  external: 'M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  nodes: 'M6 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.4 6.5 15.6 10.5M8.2 17.6 15.7 13.4',
  ruler: 'M4 14 14 4l6 6L10 20Z M8 8l1.5 1.5M11 5l1.5 1.5M5 11l1.5 1.5',
  rack: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM4 8.5h16M4 14h16M7.5 5.7v.5M7.5 11.2v.5M7.5 16.7v.5',
  modules: 'M4 4h7v7H4ZM13 4h7v7h-7ZM4 13h7v7H4ZM13 13h7v7h-7Z',
  board: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1ZM7 8.5h4.5v4H7ZM14 9h3.5M14 11.5h3.5M7 15.5h10',
}

/** Zwei Pfad-Icons, die aus mehreren Subpaths bestehen und `fill` brauchen. */
const FILLED = new Set<IconName>(['cursor'])

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, ...rest }: IconProps) {
  const filled = FILLED.has(name)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
