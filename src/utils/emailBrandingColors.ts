/**
 * Mismas reglas de color que el backend (personal-data-backend
 * src/utils/emailBranding.ts) para que la vista previa del correo coincida
 * con el correo real.
 */

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function expand(hex: string): string {
  const h = hex.trim();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

export function isHexColor(value: string | null | undefined): value is string {
  return Boolean(value && HEX.test(value.trim()));
}

export function relativeLuminance(hex: string): number {
  const n = expand(hex);
  if (!HEX.test(n)) return 0;
  const lin = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
}

export function darkenHex(hex: string, amount: number): string {
  const n = expand(hex);
  if (!HEX.test(n)) return hex;
  const f = 1 - Math.min(Math.max(amount, 0), 1);
  const ch = (i: number) =>
    Math.round(parseInt(n.slice(i, i + 2), 16) * f)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(1)}${ch(3)}${ch(5)}`;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Texto legible sobre el color de marca (botón / encabezado de bloque). */
export function readableTextColorOn(hex: string): string {
  return relativeLuminance(hex) > 0.55 ? "#1a2332" : "#ffffff";
}

/** Color de marca usado como texto sobre blanco: se oscurece si es muy claro. */
export function brandColorForTextOnWhite(hex: string, minContrast = 3.2): string {
  let color = hex;
  for (let i = 0; i < 10 && contrastRatio(color, "#ffffff") < minContrast; i++) {
    color = darkenHex(color, 0.12);
  }
  return color;
}
