# Design

Visual system for the Attendance System. Captures the current implemented tokens
([apps/frontend/src/index.css](apps/frontend/src/index.css)) plus the refine-and-elevate
direction (friendly & approachable, Notion-calm, never a Google Forms clone). Source of
truth for tokens remains `index.css`; this file documents intent so variants stay on-brand.

## Theme

Light and dark, toggled via `data-theme` on `<html>`. Light is the default and primary.
Frosted-glass surfaces (subtle `backdrop-filter`) on topbar/sidebar. Calm, low-noise; warmth
comes from soft surfaces and rounded geometry, not bright color.

## Color

Tokens (light → dark):

- **Brand:** `--brand #2f6fed` → `#6f98ff`; `--brand-dark #1f4ecf`; `--brand-soft` 10% tint.
  Single brand blue across admin **and** public/form surfaces. Retire hardcoded Google blue
  `#4285f4` in the form builder — it must use `--brand`.
- **Backgrounds:** `--bg-page #fafafa` → `#1a1b1e`; `--surface-base #fff` → `#23252a`;
  `--surface-soft`, `--surface-muted` for layering.
- **Text:** `--text-main #18181b`, `--text-soft #3f3f46`, `--text-muted #71717a` (+ dark).
- **Lines:** `--line-soft #e4e4e7`, `--line-strong #d4d4d8`.
- **Semantic:** `--ok #138a5b`/`--ok-soft`; `--warn #9a6808`/`--warn-soft`;
  `--danger #c64949`/`--danger-soft`. Always pair semantic color with an icon/label.

Avoid: multi-stop decorative gradients, heavy shadows, more than the one brand hue + the
three semantic colors on a given screen.

## Typography

- **Families:** "Nunito" (Latin) + "Anuphan" (Thai), 400/500/600/700. `--font-ui`.
- **Scale:** `--text-xs 12` · `--text-sm 13` · `--text-base 15` (body) · `--text-md 16` ·
  `--text-lg 20` · `--text-xl 28`. Page titles 28/700.
- Cap body line length ~65–75ch. Layouts must tolerate longer Thai strings.

## Spacing & Radius

- **Spacing:** `--space-1 4` → `--space-8 64` (4-based scale). Favor generous, consistent
  rhythm over cramming ("calm density").
- **Radius:** `--radius-sm 6` · `--radius-md 8` · `--radius-lg 14` · `--radius-pill 999`.
  Rounded, friendly geometry; cards ~14–16px.

## Elevation & Motion

- **Shadow:** `--shadow-card` (1px hairline) for resting cards; `--shadow-lg` for overlays
  only. Keep depth subtle — no big glows.
- **Motion:** short and purposeful — page rise ~0.42s, modal-in ~0.18s, hovers ~0.2s.
  Feedback animations (e.g. status-pill highlight) are brief and respect reduced-motion.

## Components (kit at `components/ui/`)

Button (primary/ghost/danger/text, md/sm, loading), Input/Textarea/Select (label + hint +
error), Card, Modal (focus-trap, sizes sm–xl), ConfirmDialog, PageHead, EmptyState,
Skeleton, Spinner, Toast. Reuse these — don't hand-roll new variants. Status shown via
`.status-pill` (active/draft/inactive) — color + label, never color alone.

## Layout

- **Admin shell:** sticky frosted topbar + collapsible left sidebar (280px / 104px) + content
  (`28px` padding). Mobile (<860px): sidebar → slide-in drawer.
- **Public form:** centered single card `min(100%, 640px)`, mobile-first; fixed theme toggle
  top-right. Should read as its own friendly surface, not a Google Forms page.
- **Tables:** flexible primary columns with ellipsis+tooltip and real breathing room; under
  ~860px use stacked/card rows, not tiny horizontal scroll.
