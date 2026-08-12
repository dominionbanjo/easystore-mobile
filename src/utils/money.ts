export function formatNGN(amountKobo: number | string | null | undefined): string {
  const kobo = Number(amountKobo ?? 0);
  if (!Number.isFinite(kobo)) {
    return '₦0';
  }
  const naira = kobo / 100;
  const formatted = naira.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₦${formatted}`;
}

export function formatNGNCompact(amountKobo: number | string | null | undefined): string {
  const kobo = Number(amountKobo ?? 0);
  const naira = kobo / 100;
  if (naira >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (naira >= 1_000) {
    return `₦${(naira / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `₦${Math.round(naira)}`;
}

export function koboToNaira(amountKobo: number): number {
  return amountKobo / 100;
}

export function nairaToKobo(amountNaira: number): number {
  return Math.round(amountNaira * 100);
}

export function formatKoboWithWhole(amountKobo: number): string {
  return `₦${(amountKobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}
