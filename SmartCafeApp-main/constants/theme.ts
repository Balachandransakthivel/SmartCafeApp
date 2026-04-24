// Smart Café — 3D Dark Glass Design System
// Metaphor: Dark Glass + Warm Ember  |  Depth: layered shadows + glow + translucency

export const Colors = {
  // === Brand Core ===
  primary: '#FF7A00',          // Ember Orange – CTAs & accents
  primaryDeep: '#CC5F00',      // Pressed / deep orange
  primaryGlow: 'rgba(255,122,0,0.35)',   // Glow halo
  coffeeBrown: '#6F4E37',      // Warm café brown
  coffeeDark: '#3E2A1E',       // Deep espresso
  coffeeLight: '#C4956A',      // Caramel

  // === Dark Glass Palette ===
  bgDeep: '#0F0A06',           // Deepest background
  bgBase: '#1A1208',           // Base dark background
  bgCard: '#231910',           // Card surface
  bgGlass: 'rgba(35,25,16,0.75)',       // Frosted glass panel
  bgGlassLight: 'rgba(60,40,22,0.60)', // Lighter glass

  // === Text ===
  textPrimary: '#F5EDD5',      // Warm cream – main text
  textSecondary: '#B8A88A',    // Muted warm – secondary
  textDim: '#7A6A55',          // Dimmed – hints
  textOnPrimary: '#FFFFFF',    // On orange buttons

  // === Semantic ===
  success: '#22C55E',
  successGlow: 'rgba(34,197,94,0.25)',
  error: '#EF4444',
  errorGlow: 'rgba(239,68,68,0.25)',
  warning: '#F59E0B',
  warningGlow: 'rgba(245,158,11,0.25)',
  info: '#38BDF8',
  infoGlow: 'rgba(56,189,248,0.25)',

  // === Borders & Dividers ===
  border: 'rgba(196,149,106,0.20)',
  borderBright: 'rgba(255,122,0,0.45)',
  borderGlass: 'rgba(255,255,255,0.08)',

  // === Overlays ===
  overlay: 'rgba(0,0,0,0.65)',
  overlayLight: 'rgba(0,0,0,0.35)',

  // === Status colors (legacy compat) ===
  background: '#1A1208',
  surface: '#231910',
  surfaceAlt: '#2C1F12',
  lightGray: '#2E2016',
  mediumGray: '#7A6A55',
  darkText: '#F5EDD5',

  // === Order Status ===
  pending: '#F59E0B',
  preparing: '#FF7A00',
  ready: '#22C55E',
  delivered: '#6F4E37',
  cancelled: '#EF4444',

  // === Kitchen Status ===
  queued: '#22C55E',
  cooking: '#F59E0B',
  readyToServe: '#FF7A00',
  urgent: '#EF4444',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 22,
    xxxl: 26,
    huge: 34,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
  },
};

// === 3D Glow Shadow Presets ===
export const GlowShadows = {
  orange: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  orangeSm: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.40,
    shadowRadius: 8,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 8,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.30,
    shadowRadius: 5,
    elevation: 4,
  },
};

// Legacy alias
export const Shadows = GlowShadows;

export const HitSlop = {
  default: { top: 8, bottom: 8, left: 8, right: 8 },
  large: { top: 12, bottom: 12, left: 12, right: 12 },
};
