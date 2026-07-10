import {
  LAYER_COLOR,
  PROJECT,
  type Cable,
  type Camera,
  type Fixture,
  type SignalNode,
} from '../data/project'

/* ── Signal-Flow-Vorschau ──────────────────────────────────────────────────
 * Node-Karten an relativen Positionen + Bezier-Kabel, eingefärbt nach Layer.
 * Rein darstellend: die echte Bearbeitung passiert im eingebetteten Planer. */

const VB_W = 1000
const VB_H = 640
const NODE_W = 224
const NODE_H = 52

interface Rect {
  x: number
  y: number
}

const nodeRect = (n: SignalNode): Rect => ({ x: n.nx * VB_W, y: n.ny * VB_H })

export function SignalPreview({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const rects = new Map<string, Rect>(PROJECT.nodes.map((n) => [n.id, nodeRect(n)]))

  const link = (c: Cable): { d: string; mx: number; my: number } | null => {
    const a = rects.get(c.from)
    const b = rects.get(c.to)
    if (!a || !b) return null
    const x1 = a.x + NODE_W
    const y1 = a.y + NODE_H / 2
    const x2 = b.x
    const y2 = b.y + NODE_H / 2
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.5)
    return {
      d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`,
      mx: (x1 + x2) / 2,
      my: (y1 + y2) / 2,
    }
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <text x={PROJECT.nodes[0].nx * VB_W} y={PROJECT.nodes[0].ny * VB_H - 14} className="fill-[var(--av-text-faint)]" fontSize={13} fontWeight={600} letterSpacing="0.08em">BÜHNE / FLOOR</text>
      <text x={PROJECT.nodes[3].nx * VB_W} y={PROJECT.nodes[3].ny * VB_H - 14} className="fill-[var(--av-text-faint)]" fontSize={13} fontWeight={600} letterSpacing="0.08em">REGIE / OB</text>

      {PROJECT.cables.map((c) => {
        const l = link(c)
        if (!l) return null
        const active = selectedId === c.id
        return (
          <g key={c.id} onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
            <path d={l.d} fill="none" stroke={LAYER_COLOR[c.layer]} strokeWidth={active ? 3.5 : 2} opacity={active ? 1 : 0.7} />
            <g transform={`translate(${l.mx}, ${l.my})`}>
              <rect x={-46} y={-11} width={92} height={22} rx={11} className="fill-[var(--av-surface-2)] stroke-[var(--av-border)]" strokeWidth={1} />
              <text x={0} y={4} textAnchor="middle" className="fill-[var(--av-text-secondary)]" fontSize={11} fontFamily="var(--av-font-mono)">{c.type} · {c.lengthM}m</text>
            </g>
          </g>
        )
      })}

      {PROJECT.nodes.map((n) => {
        const r = rects.get(n.id)!
        return (
          <g key={n.id} transform={`translate(${r.x}, ${r.y})`}>
            <rect width={NODE_W} height={NODE_H} rx={9} className="fill-[var(--av-surface-1)] stroke-[var(--av-border)]" strokeWidth={1.2} />
            <circle cx={16} cy={18} r={4} fill={n.group === 'floor' ? 'var(--mod-cameras)' : 'var(--mod-signal)'} />
            <text x={30} y={21} className="fill-[var(--av-text)]" fontSize={12} fontWeight={600}>{n.name}</text>
            <text x={30} y={38} className="fill-[var(--av-text-muted)]" fontSize={11}>{n.sub}</text>
            {n.venue && (
              <g transform={`translate(${NODE_W - 50}, 7)`}>
                <rect width={44} height={16} rx={8} className="fill-[var(--av-surface-3)] stroke-[var(--av-border-muted)]" strokeWidth={1} />
                <text x={22} y={12} textAnchor="middle" className="fill-[var(--av-text-faint)]" fontSize={9} letterSpacing="0.06em">VENUE</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ── Plan-Vorschau (Kameras / Licht) ───────────────────────────────────────*/

const PLAN_PAD = 40

export function PlanPreview({
  mode,
  selectedId,
  onSelect,
}: {
  mode: 'cameras' | 'licht'
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { hall, stage } = PROJECT
  const innerW = 1000 - PLAN_PAD * 2
  const scale = innerW / hall.w
  const innerH = hall.h * scale
  const vbH = innerH + PLAN_PAD * 2
  const mx = (x: number) => PLAN_PAD + x * scale
  const my = (y: number) => PLAN_PAD + y * scale

  const gridX: number[] = []
  for (let x = 0; x <= hall.w; x += 2) gridX.push(x)
  const gridY: number[] = []
  for (let y = 0; y <= hall.h; y += 2) gridY.push(y)

  const stageCx = stage.x + stage.w / 2
  const stageCy = stage.y + stage.h / 2

  return (
    <svg viewBox={`0 0 1000 ${vbH}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {gridX.map((x) => (
        <line key={`gx${x}`} x1={mx(x)} y1={PLAN_PAD} x2={mx(x)} y2={PLAN_PAD + innerH} className="stroke-[var(--av-border-muted)]" strokeWidth={0.75} />
      ))}
      {gridY.map((y) => (
        <line key={`gy${y}`} x1={PLAN_PAD} y1={my(y)} x2={PLAN_PAD + innerW} y2={my(y)} className="stroke-[var(--av-border-muted)]" strokeWidth={0.75} />
      ))}
      <rect x={PLAN_PAD} y={PLAN_PAD} width={innerW} height={innerH} rx={6} className="fill-none stroke-[var(--av-border)]" strokeWidth={1.4} />

      {/* Bühne */}
      <rect x={mx(stage.x)} y={my(stage.y)} width={stage.w * scale} height={stage.h * scale} rx={4} fill="var(--av-warn-dim)" className="stroke-[var(--mod-licht)]" strokeWidth={1.2} />
      <text x={mx(stage.x) + 8} y={my(stage.y) + 18} className="fill-[var(--mod-licht)]" fontSize={12} fontWeight={600}>Bühne {stage.w}×{stage.h} m</text>

      {mode === 'cameras'
        ? PROJECT.cameras.map((cam) => <CameraMark key={cam.id} cam={cam} mx={mx} my={my} scale={scale} stageCx={stageCx} stageCy={stageCy} active={cam.id === selectedId} onSelect={onSelect} />)
        : PROJECT.fixtures.map((fx) => <FixtureMark key={fx.id} fx={fx} mx={mx} my={my} stageCx={stageCx} stageCy={stageCy} active={fx.id === selectedId} onSelect={onSelect} />)}
    </svg>
  )
}

function CameraMark({
  cam, mx, my, scale, stageCx, stageCy, active, onSelect,
}: {
  cam: Camera
  mx: (x: number) => number
  my: (y: number) => number
  scale: number
  stageCx: number
  stageCy: number
  active: boolean
  onSelect: (id: string) => void
}) {
  const cx = mx(cam.x)
  const cy = my(cam.y)
  const ang = Math.atan2(my(stageCy) - cy, mx(stageCx) - cx)
  const half = (cam.hfovDeg * Math.PI) / 180 / 2
  const len = 3.4 * scale
  const p1 = [cx + Math.cos(ang - half) * len, cy + Math.sin(ang - half) * len]
  const p2 = [cx + Math.cos(ang + half) * len, cy + Math.sin(ang + half) * len]
  const color = 'var(--mod-cameras)'
  return (
    <g onClick={() => onSelect(cam.id)} style={{ cursor: 'pointer' }}>
      <path d={`M ${cx} ${cy} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} Z`} fill={color} opacity={active ? 0.24 : 0.12} />
      <circle cx={cx} cy={cy} r={active ? 8 : 6} fill={color} opacity={active ? 1 : 0.85} />
      <text x={cx} y={cy + 22} textAnchor="middle" className="fill-[var(--av-text-muted)]" fontSize={11} fontFamily="var(--av-font-mono)">{cam.name} · {cam.focalMm}mm</text>
    </g>
  )
}

function FixtureMark({
  fx, mx, my, stageCx, stageCy, active, onSelect,
}: {
  fx: Fixture
  mx: (x: number) => number
  my: (y: number) => number
  stageCx: number
  stageCy: number
  active: boolean
  onSelect: (id: string) => void
}) {
  const cx = mx(fx.x)
  const cy = my(fx.y)
  const tx = mx(stageCx)
  const ty = my(stageCy)
  const color = 'var(--mod-licht)'
  return (
    <g onClick={() => onSelect(fx.id)} style={{ cursor: 'pointer' }}>
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={color} strokeWidth={1} strokeDasharray="3 4" opacity={active ? 0.6 : 0.25} />
      <rect x={cx - 6} y={cy - 6} width={12} height={12} rx={2} transform={`rotate(45 ${cx} ${cy})`} fill={color} opacity={active ? 1 : 0.85} stroke={active ? 'var(--av-text)' : 'none'} strokeWidth={1} />
      <text x={cx} y={cy - 12} textAnchor="middle" className="fill-[var(--av-text-muted)]" fontSize={10} fontFamily="var(--av-font-mono)">{fx.name}</text>
    </g>
  )
}
