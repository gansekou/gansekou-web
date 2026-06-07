export const designTokens = {
  colors: {
    academicBlue: "#071d3a",
    academicBlueSoft: "#0b2d59",
    premiumGold: "#f6c445",
    premiumGoldSoft: "#fff4c7",
    ink: "#0f172a",
    muted: "#64748b",
    line: "#dbe3ee",
    surface: "#ffffff",
    canvas: "#f6f8fb",
    success: "#0f7a4f",
    danger: "#c62828",
  },
  radius: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  shadow: {
    card: "0 18px 50px rgba(7, 29, 58, 0.08)",
    premium: "0 28px 90px rgba(7, 29, 58, 0.18)",
    lift: "0 16px 40px rgba(7, 29, 58, 0.14)",
  },
  transition: {
    fast: "160ms ease",
    base: "220ms ease",
    slow: "360ms ease",
  },
} as const;
