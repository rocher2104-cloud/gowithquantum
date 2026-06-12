import {
  createLightTheme,
  createDarkTheme,
  type BrandVariants,
  type Theme,
} from "@fluentui/react-components";

/**
 * Go With Quantum brand ramp — electric blue centred on #0076EB (step 80).
 * Generated from HSL(210 °, 100 %, step-specific lightness).
 */
export const gwqBrand: BrandVariants = {
  10:  "#00080F",
  20:  "#001224",
  30:  "#001F3D",
  40:  "#002E5C",
  50:  "#004080",
  60:  "#0054A8",
  70:  "#0066CC",
  80:  "#0076EB", // primary brand
  90:  "#1A8CFF",
  100: "#42A1FF",
  110: "#66B3FF",
  120: "#85C2FF",
  130: "#A3D1FF",
  140: "#BDDEFF",
  150: "#D6EBFF",
  160: "#EBF5FF",
};

const FONT_OVERRIDES = {
  fontFamilyBase: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'DM Mono', 'Fira Code', ui-monospace, monospace",
};

export const gwqLightTheme: Theme = {
  ...createLightTheme(gwqBrand),
  ...FONT_OVERRIDES,
};

export const gwqDarkTheme: Theme = {
  ...createDarkTheme(gwqBrand),
  ...FONT_OVERRIDES,
};

/**
 * Semantic accent tokens used across the app for run/result states.
 */
export const accents = {
  // running / informational
  info: "#3B82F6",
  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  // human-in-the-loop / needs-you
  human: "#EAB308",
  humanBg: "#FEFCE8",
  humanBorder: "#FDE68A",
  humanText: "#92400E",
  // quantum advantage / success
  advantage: "#16A34A",
  advantageBg: "#F0FDF4",
  advantageBorder: "#86EFAC",
  // failure
  error: "#EF4444",
  errorBg: "#FEF2F2",
  // brand blue (for data-viz fills)
  quantum: "#0076EB",
  quantumLight: "#66B3FF",
} as const;
