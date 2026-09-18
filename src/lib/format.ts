/** Hungarian number formatting: space as thousands separator, "Ft" suffix. */
const nf = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0 });

export const huf = (n: number) => `${nf.format(n)} Ft`;
export const num = (n: number) => nf.format(n);
