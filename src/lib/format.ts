/**
 * Currency is Bangladeshi taka throughout the design (every finance frame
 * shows ৳). Resolves docs/prd.md §6.3.
 */
export const BDT = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
})

/** `48500` -> `৳48,500.00` */
export const money = (amount: number) => BDT.format(amount)
