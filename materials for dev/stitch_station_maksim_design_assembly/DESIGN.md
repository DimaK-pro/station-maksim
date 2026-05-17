---
name: Galactic Command System
colors:
  surface: '#0f131f'
  surface-dim: '#0f131f'
  surface-bright: '#353946'
  surface-container-lowest: '#0a0e1a'
  surface-container-low: '#171b28'
  surface-container: '#1b1f2c'
  surface-container-high: '#262a37'
  surface-container-highest: '#313442'
  on-surface: '#dfe2f3'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#dfe2f3'
  inverse-on-surface: '#2c303d'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#ffd2ce'
  on-tertiary: '#68000a'
  tertiary-container: '#ffaba5'
  on-tertiary-container: '#a20016'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0f131f'
  on-background: '#dfe2f3'
  surface-variant: '#313442'
  space-bg: '#0a0e1a'
  surface-panel: '#111827'
  surface-elevated: '#1a2236'
  energy-emerald: '#34d399'
  warning-orange: '#f97316'
  critical-maroon: '#7f1d1d'
  admin-mama: '#a855f7'
  admin-grandma: '#22c55e'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 42px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  stats-num:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  touch-target: 44px
  margin-page: 20px
  gutter-card: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The brand personality is high-energy, immersive, and rewarding, designed to transform behavioral discipline into a high-stakes sci-fi adventure. It targets a family audience, using the "Commander" and "Station" metaphors to bridge the gap between parental guidance and child engagement.

The design style is **Modern 3D Game / Sci-Fi**. It draws heavy inspiration from high-fidelity mobile battle games, utilizing:
- **Volumetric Depth:** Elements are treated as physical objects with thickness, beveled edges, and realistic specular highlights.
- **Atmospheric Layering:** A multi-layered parallax approach with a deep stellar background, middle-ground mechanical structures, and a foreground HUD-inspired interface.
- **Neon-Functionalism:** Glowing borders and light-bleed effects are not just decorative; they serve as primary status indicators (Cyan for health, Red for danger, Gold for achievement).
- **Tactile Interaction:** Large, "clickable" buttons with physical state changes (depressed states, inner glows) to provide satisfying haptic-visual feedback.

## Colors

The palette is optimized for a high-contrast dark mode, representing the void of space punctuated by functional neon light.

- **Primary (Cyan/Emerald):** Represents "Stable Flight" and positive energy. Used for growth bars, success states, and primary navigation.
- **Secondary (Amber/Gold):** Represents "Rewards" and high-value achievements. Reserved for the "Drum of Rewards" and elite-level task points.
- **Tertiary (Red/Orange):** Represents "Emergency Mode" and system failure. Triggers a global UI shift when the station energy drops below critical thresholds.
- **Neutral (Deep Navy/Black):** Used for the background and base container layers, providing the necessary contrast for neon glows to pop.

**Color Logic:** When the "Emergency State" is active, the primary cyan accents should be swapped for red across the entire interface to reinforce the narrative urgency.

## Typography

The typography system balances technical "readout" aesthetics with modern legibility.

- **Headlines (Space Grotesk):** Chosen for its geometric, futuristic character. Titles should often utilize **text-shadow glows** (matching their functional color) and occasionally a metallic gradient overlay (Silver to White) for display-level prominence.
- **Body & UI (Inter):** High-legibility sans-serif used for mission descriptions, parent comments, and settings.
- **Stat Numbers:** Use bold weights of Space Grotesk to mimic digital instrumentation panels. 

**Visual Treatment:** Display headers in the Reward or Consequence drums should use a 3D extrusion effect (thick bottom border in a darker shade) to simulate physical 3D lettering.

## Layout & Spacing

This design system follows a **Fixed Grid** approach tailored for mobile-first engagement.

- **The HUD Container:** The main layout is treated as a viewport. Content is housed in "floating" cards that sit 24px-48px above the background starfield.
- **Safe Areas:** Strict adherence to mobile safe areas is mandatory to ensure the "Mission Log" and bottom navigation are accessible on notched devices.
- **Touch Targets:** A minimum 44px height is enforced for all interactive elements, prioritizing thumb-friendly interaction during high-energy moments (like spinning the reward drum).
- **Two-Column Grid:** On tablet devices, the "Mission Log" and "Station Stats" reflow into a side-by-side dashboard layout, whereas mobile maintains a vertical scroll.

## Elevation & Depth

Hierarchy is established through "Z-axis" layering rather than simple tonal shifts.

- **Level 0 (Background):** Deep space texture with moving starfield particles and nebula blurs.
- **Level 1 (Glass HUD):** Semi-transparent dark panels (`surface-panel` at 80% opacity) with a `20px` backdrop blur. Used for background list containers.
- **Level 2 (Physical Modules):** Cards with a 1px inner light border (rim lighting) and a heavy drop shadow (20% opacity black).
- **Level 3 (Interactive Components):** Buttons and active status cards use a **Volumetric Glow**. The glow color matches the functional state (e.g., a green outer glow for positive missions).
- **Specular Highlights:** All 3D-styled containers must feature a subtle diagonal linear gradient (white to transparent) at the top-left corner to simulate overhead lighting.

## Shapes

The shape language is "Industrial-Futuristic." 

- **Primary Radius:** 16px (`rounded-lg`) is the standard for cards and main buttons to maintain a friendly, "Brawl Stars" game-like feel.
- **Secondary Radius:** 8px (`soft`) for internal elements like input fields and mini-tags.
- **Functional Clipping:** The energy bars and progress indicators use a "capsule" or pill-shape to suggest fluid/energy containment.
- **Beveled Edges:** Buttons use a "thick-bottom" technique (4px solid darker border on the bottom) to create a 3D depressible effect.

## Components

- **Action Buttons:** Must have a 3D "lift." Primary buttons (`#34d399`) feature a dark green bottom border. When pressed, the button shifts down by 2px and the shadow disappears.
- **Mission Cards:** Feature a color-coded left-accent bar (Green/Grey/Red). They include a high-gloss "glass" overlay effect to look like physical display chips.
- **The Drum (Roulette):** A central 3D cylinder component with vertical clipping. It uses a "curved" perspective distortion on the text items to simulate a rotating physical drum.
- **Status Spheres:** Categorical icons (Study, Respect, etc.) are encased in circular glowing glass containers with a subtle pulse animation.
- **Input Fields:** Dark, recessed wells (`inset` shadows) with a glowing border that activates on focus, mimicking a computer terminal prompt.
- **The Energy Bar:** A segmented horizontal or vertical container. Segments should "flicker" or glow more intensely as they fill up. Broken segments (for negative states) should use a cracked-glass texture overlay.