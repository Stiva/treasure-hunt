// Rise of the Guardians / Le 5 Leggende Theme
// Inspired by Jack Frost, Sandman, Tooth Fairy, and the magical night

export const guardiansTheme = {
  colors: {
    // Jack Frost - Cool blues for primary actions
    frost: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    // Sandman - Warm golden for highlights and success
    sand: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    // Tooth Fairy - Teal accents
    tooth: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
    },
    // Night/Mystery - Deep purples for backgrounds
    night: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
      950: "#2e1065",
    },
    // Pitch Black - For dark mode and shadows
    pitch: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
  },
  gradients: {
    aurora:
      "linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #14b8a6 100%)",
    dreamsand:
      "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
    nightSky:
      "linear-gradient(180deg, #1e1b4b 0%, #4c1d95 50%, #0f172a 100%)",
    frostGlow:
      "linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #dbeafe 100%)",
    magicPortal:
      "radial-gradient(circle, #7c3aed 0%, #4c1d95 50%, #1e1b4b 100%)",
  },
  shadows: {
    frost: "0 0 20px rgba(96, 165, 250, 0.5)",
    sand: "0 0 20px rgba(251, 191, 36, 0.5)",
    night: "0 0 30px rgba(124, 58, 237, 0.3)",
    glow: "0 0 40px rgba(139, 92, 246, 0.4)",
  },
  animations: {
    sparkle: "sparkle 2s ease-in-out infinite",
    float: "float 3s ease-in-out infinite",
    shimmer: "shimmer 2s linear infinite",
    frostBreath: "frostBreath 4s ease-in-out infinite",
  },
} as const;

// CSS Custom Properties for easy usage
export const cssVariables = `
  :root {
    /* Frost Blues */
    --frost-50: #eff6ff;
    --frost-100: #dbeafe;
    --frost-200: #bfdbfe;
    --frost-300: #93c5fd;
    --frost-400: #60a5fa;
    --frost-500: #3b82f6;
    --frost-600: #2563eb;
    --frost-700: #1d4ed8;

    /* Sand Golds */
    --sand-50: #fffbeb;
    --sand-100: #fef3c7;
    --sand-200: #fde68a;
    --sand-300: #fcd34d;
    --sand-400: #fbbf24;
    --sand-500: #f59e0b;
    --sand-600: #d97706;

    /* Tooth Teals */
    --tooth-400: #2dd4bf;
    --tooth-500: #14b8a6;
    --tooth-600: #0d9488;

    /* Night Purples */
    --night-800: #5b21b6;
    --night-900: #4c1d95;
    --night-950: #2e1065;

    /* Pitch Darks */
    --pitch-800: #1e293b;
    --pitch-900: #0f172a;
    --pitch-950: #020617;

    /* Gradients */
    --gradient-aurora: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #14b8a6 100%);
    --gradient-dreamsand: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
    --gradient-night-sky: linear-gradient(180deg, #1e1b4b 0%, #4c1d95 50%, #0f172a 100%);

    /* Shadows */
    --shadow-frost: 0 0 20px rgba(96, 165, 250, 0.5);
    --shadow-sand: 0 0 20px rgba(251, 191, 36, 0.5);
    --shadow-night: 0 0 30px rgba(124, 58, 237, 0.3);
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.1); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes frostBreath {
    0%, 100% { filter: blur(0px); opacity: 1; }
    50% { filter: blur(2px); opacity: 0.8; }
  }
`;
