export interface CouponResult {
  ok: boolean;
  code: string;
  discountPercent: number;
  message: string;
}

const COUPONS: Record<string, { discountPercent: number; label: string }> = {
  BRUTAL40: { discountPercent: 40, label: 'Bundle anual com 40% OFF' },
  FOUNDER50: { discountPercent: 50, label: 'Fundador 50% OFF por tempo limitado' },
  PRO30: { discountPercent: 30, label: 'Upgrade Pro com 30% OFF' },
};

export function validateCoupon(input: string): CouponResult {
  const code = input.trim().toUpperCase();
  const coupon = COUPONS[code];

  if (!coupon) {
    return { ok: false, code, discountPercent: 0, message: 'Cupom nao encontrado.' };
  }

  return {
    ok: true,
    code,
    discountPercent: coupon.discountPercent,
    message: `${coupon.label} aplicado.`,
  };
}

export function applyDiscount(price: number, discountPercent: number) {
  return Number((price * (1 - discountPercent / 100)).toFixed(2));
}
