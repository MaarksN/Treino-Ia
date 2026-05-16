const luminanceMap = (value: number) => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

export function getContrastRatio(hexA: string, hexB: string): number {
  const parse = (hex: string) => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map(char => char + char).join('')
      : normalized;
    const int = Number.parseInt(value, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  };

  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const l1 = 0.2126 * luminanceMap(r1) + 0.7152 * luminanceMap(g1) + 0.0722 * luminanceMap(b1);
  const l2 = 0.2126 * luminanceMap(r2) + 0.7152 * luminanceMap(g2) + 0.0722 * luminanceMap(b2);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return Number(((light + 0.05) / (dark + 0.05)).toFixed(2));
}

export function isAccessibleContrast(hexA: string, hexB: string, largeText = false): boolean {
  return getContrastRatio(hexA, hexB) >= (largeText ? 3 : 4.5);
}
