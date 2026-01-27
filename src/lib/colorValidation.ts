/**
 * Color validation and sanitization utilities
 * Prevents CSS/XSS injection through color values
 */

// Strict pattern for valid CSS color formats
// Supports: #RGB, #RRGGBB, rgb(), rgba(), hsl(), hsla(), and named colors
const CSS_COLOR_PATTERNS = [
  /^#[0-9A-Fa-f]{3}$/, // #RGB
  /^#[0-9A-Fa-f]{6}$/, // #RRGGBB
  /^#[0-9A-Fa-f]{8}$/, // #RRGGBBAA
  /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/, // rgb(r, g, b)
  /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/, // rgba(r, g, b, a)
  /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/, // hsl(h, s%, l%)
  /^hsla\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(?:0|1|0?\.\d+)\s*\)$/, // hsla(h, s%, l%, a)
];

// Safe named colors (subset of CSS named colors)
const SAFE_NAMED_COLORS = new Set([
  'transparent', 'currentcolor',
  'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
  'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'olive',
  'navy', 'teal', 'aqua', 'maroon', 'silver', 'gold', 'coral', 'crimson',
  'indigo', 'violet', 'turquoise', 'salmon', 'khaki', 'beige', 'ivory',
]);

/**
 * Validate if a string is a safe CSS color value
 */
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  
  const trimmed = color.trim().toLowerCase();
  
  // Check named colors
  if (SAFE_NAMED_COLORS.has(trimmed)) return true;
  
  // Check patterns
  return CSS_COLOR_PATTERNS.some(pattern => pattern.test(color.trim()));
}

/**
 * Sanitize a color value, returning a fallback if invalid
 */
export function sanitizeColor(color: string | undefined, fallback = 'hsl(0, 0%, 50%)'): string {
  if (!color) return fallback;
  return isValidColor(color) ? color : fallback;
}

/**
 * Escape special characters that could break CSS context
 * This is a defense-in-depth measure
 */
export function escapeForCSS(value: string): string {
  // Remove any characters that could break out of CSS context
  return value.replace(/[<>"'`;{}()\\]/g, '');
}
