// Customization types and utilities
export interface CustomizationColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
}

export interface CustomizationBranding {
  logoUrl: string | null;
  logoLoginUrl: string | null;
  faviconUrl: string | null;
  bannerUrl: string | null;
}

export interface CustomizationTexts {
  siteTitle: string;
  welcomeMessage: string;
  loginTitle: string;
  loginSubtitle: string;
  footerText: string;
}

export interface CustomizationFont {
  family: string;
  size: 'small' | 'medium' | 'large';
}

export interface Customization {
  colors: CustomizationColors;
  branding: CustomizationBranding;
  texts: CustomizationTexts;
  courseCovers: Record<string, string>;
  theme: 'dark' | 'light' | 'custom';
  font: CustomizationFont;
}

export const CUSTOMIZATION_STORAGE_KEY = 'members-customization';

export const defaultCustomization: Customization = {
  colors: {
    primary: '#e5e5e5',
    secondary: '#4ade80',
    accent: '#60a5fa',
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#a3a3a3',
  },
  branding: {
    logoUrl: null,
    logoLoginUrl: null,
    faviconUrl: null,
    bannerUrl: null,
  },
  texts: {
    siteTitle: 'Área de Membros',
    welcomeMessage: 'Bem-vindo!',
    loginTitle: 'Faça seu login',
    loginSubtitle: 'Acesse sua conta para continuar',
    footerText: '© 2026 Todos os direitos reservados',
  },
  courseCovers: {},
  theme: 'dark',
  font: {
    family: 'Inter',
    size: 'medium',
  },
};

// Color palettes
export const colorPalettes: Record<string, CustomizationColors> = {
  'escuro-elegante': {
    primary: '#e5e5e5',
    secondary: '#4ade80',
    accent: '#60a5fa',
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#a3a3a3',
  },
  'minimalista-claro': {
    primary: '#1a1a1a',
    secondary: '#22c55e',
    accent: '#3b82f6',
    background: '#ffffff',
    cardBackground: '#f5f5f5',
    textPrimary: '#0a0a0a',
    textSecondary: '#737373',
  },
  'azul-corporativo': {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    background: '#0f172a',
    cardBackground: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
  },
  'verde-moderno': {
    primary: '#22c55e',
    secondary: '#4ade80',
    accent: '#a3e635',
    background: '#052e16',
    cardBackground: '#14532d',
    textPrimary: '#f0fdf4',
    textSecondary: '#86efac',
  },
  'roxo-criativo': {
    primary: '#a855f7',
    secondary: '#c084fc',
    accent: '#e879f9',
    background: '#1e1b4b',
    cardBackground: '#312e81',
    textPrimary: '#faf5ff',
    textSecondary: '#c4b5fd',
  },
  'laranja-vibrante': {
    primary: '#f97316',
    secondary: '#fb923c',
    accent: '#fbbf24',
    background: '#1c1917',
    cardBackground: '#292524',
    textPrimary: '#fef3c7',
    textSecondary: '#fdba74',
  },
};

// Available fonts
export const availableFonts = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Open Sans',
  'Lato',
];

// Get customization from storage
export function getCustomization(): Customization {
  try {
    const stored = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);
    if (stored) {
      return { ...defaultCustomization, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading customization:', error);
  }
  return defaultCustomization;
}

// Save customization to storage
export function saveCustomization(customization: Customization): void {
  try {
    localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(customization));
  } catch (error) {
    console.error('Error saving customization:', error);
  }
}

// Get font size in pixels
export function getFontSize(size: 'small' | 'medium' | 'large'): string {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
  };
  return sizes[size] || '16px';
}

// Convert hex to HSL for CSS variables
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove #
  hex = hex.replace(/^#/, '');
  
  // Parse hex
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Apply customization to DOM
export function applyCustomization(customization: Customization): void {
  const root = document.documentElement;
  
  // Apply colors as CSS variables
  Object.entries(customization.colors).forEach(([key, value]) => {
    const hsl = hexToHSL(value);
    // Create kebab-case key
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--custom-${cssKey}`, `${hsl.h} ${hsl.s}% ${hsl.l}%`);
  });
  
  // Apply font
  if (customization.font.family) {
    root.style.setProperty('--font-sans', `"${customization.font.family}", sans-serif`);
  }
  
  root.style.setProperty('--font-size-base', getFontSize(customization.font.size));
  
  // Apply theme class
  document.body.dataset.theme = customization.theme;
  
  // Update favicon if set
  if (customization.branding.faviconUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = customization.branding.faviconUrl;
    }
  }
  
  // Update page title
  if (customization.texts.siteTitle) {
    document.title = customization.texts.siteTitle;
  }
}

// Load and apply customization on app start
export function initializeCustomization(): void {
  const customization = getCustomization();
  applyCustomization(customization);
}
