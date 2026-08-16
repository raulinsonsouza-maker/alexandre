/** Preços Cakto (+7%) e SKUs JEWM para módulos avulsos. Wave (C13) não entra. */

export type ModuleCaktoCategory = "bonus" | "base" | "pro" | "flagship";

export type ModuleCaktoPrice = {
  code: string;
  skuName: string;
  category: ModuleCaktoCategory;
  /** Preço Cakto em centavos */
  priceCents: number;
};

const BASE = 31779;
const PRO = 42479;
const FLAGSHIP = 79929;

/** Tabela do cliente — Preço Cakto */
export const MODULE_CAKTO_PRICES: Record<string, ModuleCaktoPrice> = {
  M00: { code: "M00", skuName: "JEWM.M00.01 - Boas-vindas a Jornada", category: "bonus", priceCents: 0 },
  M01: { code: "M01", skuName: "JEWM.M01.01 - ERP x EWM Basis Linkage", category: "base", priceCents: BASE },
  M02: { code: "M02", skuName: "JEWM.M02.01 - Migration LE-WM to EWM", category: "pro", priceCents: PRO },
  M03: { code: "M03", skuName: "JEWM.M03.01 - Warehouse Structure", category: "base", priceCents: BASE },
  M04: { code: "M04", skuName: "JEWM.M04.01 - Master Data", category: "base", priceCents: BASE },
  M05: { code: "M05", skuName: "JEWM.M05.01 - Warehouse Monitoring", category: "base", priceCents: BASE },
  M06: { code: "M06", skuName: "JEWM.M06.01 - Delivery Processing", category: "base", priceCents: BASE },
  M07: { code: "M07", skuName: "JEWM.M07.01 - Goods Receipt", category: "base", priceCents: BASE },
  M08: { code: "M08", skuName: "JEWM.M08.01 - Goods Issue", category: "base", priceCents: BASE },
  M09: { code: "M09", skuName: "JEWM.M09.01 - Physical Inventory", category: "base", priceCents: BASE },
  M10: { code: "M10", skuName: "JEWM.M10.01 - Cross-Docking", category: "pro", priceCents: PRO },
  M11: { code: "M11", skuName: "JEWM.M11.01 - Serial Number", category: "pro", priceCents: PRO },
  M12: { code: "M12", skuName: "JEWM.M12.01 - Shipping & Receiving", category: "base", priceCents: BASE },
  M13: { code: "M13", skuName: "JEWM.M13.01 - Advanced Shipping & Receiving", category: "pro", priceCents: PRO },
  M14: { code: "M14", skuName: "JEWM.M14.01 - Quality Management", category: "pro", priceCents: PRO },
  M15: { code: "M15", skuName: "JEWM.M15.01 - API Integration", category: "flagship", priceCents: FLAGSHIP },
  M16: { code: "M16", skuName: "JEWM.M16.01 - Production Integration", category: "pro", priceCents: PRO },
  M17: { code: "M17", skuName: "JEWM.M17.01 - Repetitive Manufacturing", category: "pro", priceCents: PRO },
  M18: { code: "M18", skuName: "JEWM.M18.01 - MES Integration", category: "flagship", priceCents: FLAGSHIP },
  M19: { code: "M19", skuName: "JEWM.M19.01 - Value Added Services", category: "pro", priceCents: PRO },
  M20: { code: "M20", skuName: "JEWM.M20.01 - PM Supply", category: "pro", priceCents: PRO },
  M21: { code: "M21", skuName: "JEWM.M21.01 - WIP Management", category: "pro", priceCents: PRO },
  M22: { code: "M22", skuName: "JEWM.M22.01 - Resource Management", category: "pro", priceCents: PRO },
  M23: { code: "M23", skuName: "JEWM.M23.01 - Warehouse Task", category: "base", priceCents: BASE },
  M24: { code: "M24", skuName: "JEWM.M24.01 - Warehouse Order Creation", category: "pro", priceCents: PRO },
  M25: { code: "M25", skuName: "JEWM.M25.01 - Travel Distance", category: "pro", priceCents: PRO },
  M26: { code: "M26", skuName: "JEWM.M26.01 - Putaway & Removal", category: "base", priceCents: BASE },
  M27: { code: "M27", skuName: "JEWM.M27.01 - Handling Unit", category: "pro", priceCents: PRO },
  M28: { code: "M28", skuName: "JEWM.M28.01 - Batch Management", category: "pro", priceCents: PRO },
  M29: { code: "M29", skuName: "JEWM.M29.01 - Stock Identification", category: "pro", priceCents: PRO },
  M30: { code: "M30", skuName: "JEWM.M30.01 - Storage UoM", category: "pro", priceCents: PRO },
  M31: { code: "M31", skuName: "JEWM.M31.01 - RF Framework", category: "pro", priceCents: PRO },
  M32: { code: "M32", skuName: "JEWM.M32.01 - RFID", category: "flagship", priceCents: FLAGSHIP },
  M33: { code: "M33", skuName: "JEWM.M33.01 - Catch Weight", category: "pro", priceCents: PRO },
  M34: { code: "M34", skuName: "JEWM.M34.01 - JIT", category: "flagship", priceCents: FLAGSHIP },
  M35: { code: "M35", skuName: "JEWM.M35.01 - Goods Distribution Equipment", category: "pro", priceCents: PRO },
  M36: { code: "M36", skuName: "JEWM.M36.01 - Transit Warehouse", category: "flagship", priceCents: FLAGSHIP },
  M37: { code: "M37", skuName: "JEWM.M37.01 - Labor Management", category: "flagship", priceCents: FLAGSHIP },
  M38: { code: "M38", skuName: "JEWM.M38.01 - Warehouse Analytics", category: "pro", priceCents: PRO },
  M39: { code: "M39", skuName: "JEWM.M39.01 - Warehouse Billing", category: "flagship", priceCents: FLAGSHIP },
  M40: { code: "M40", skuName: "JEWM.M40.01 - Dock Appointment Scheduling", category: "pro", priceCents: PRO },
  M41: { code: "M41", skuName: "JEWM.M41.01 - TM-EWM Basic Integration", category: "pro", priceCents: PRO },
  M42: { code: "M42", skuName: "JEWM.M42.01 - TM-EWM General Integration", category: "flagship", priceCents: FLAGSHIP },
  M43: { code: "M43", skuName: "JEWM.M43.01 - Material Flow System", category: "flagship", priceCents: FLAGSHIP },
};

export function moduleCaktoPrice(code: string): ModuleCaktoPrice | null {
  return MODULE_CAKTO_PRICES[code] ?? null;
}

/** Preço em reais (para catalog/seed). */
export function moduleCaktoPriceReais(code: string): number | null {
  const row = moduleCaktoPrice(code);
  if (!row) return null;
  return row.priceCents / 100;
}

export function formatCaktoPriceString(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

/** Códigos vendáveis na Cakto (preço > 0). */
export function sellableModuleCodes(): string[] {
  return Object.values(MODULE_CAKTO_PRICES)
    .filter((r) => r.priceCents > 0)
    .map((r) => r.code);
}
