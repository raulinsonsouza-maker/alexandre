/**
 * Inventário de módulos por plano (cumulativo).
 * Base 6 → Pro 28 (6+22) → Expert/Corporate 45 (28+17).
 * Códigos = Module.code no banco (M00–M43 + C13 Wave).
 */
export const BASE_MODULE_CODES = [
  "M00", // Fundamentos / boas-vindas
  "M01", // Arquitetura ERP x EWM
  "M03", // Estrutura do armazém
  "M04", // Dados mestres
  "M05", // Warehouse Monitor
  "M06", // Visão geral de processos (delivery)
] as const;

/** 22 módulos operacionais além do Base */
export const PRO_EXTRA_CODES = [
  "M07", // Goods Receipt
  "M08", // Goods Issue
  "M09", // Physical Inventory
  "M10", // Cross-Docking
  "M11", // Serial Number
  "M12", // Shipping and Receiving
  "M13", // Advanced Shipping and Receiving
  "C13", // Wave Management (vitrine sem código M no JSON)
  "M19", // VAS / packing
  "M21", // WIP (processo interno)
  "M22", // Resource Management
  "M23", // Warehouse Task
  "M24", // Warehouse Order
  "M25", // Travel Distance
  "M26", // Putaway & Stock Removal
  "M27", // Handling Unit
  "M28", // Batch Management
  "M29", // Stock Identification
  "M30", // Stock-Specific UoM
  "M31", // RF Framework
  "M33", // Catch Weight
  "M35", // Goods Distribution
] as const;

export const PRO_MODULE_CODES = [...BASE_MODULE_CODES, ...PRO_EXTRA_CODES] as const;

export const PLAN_PRICES_CENTS = {
  base: 39700,
  pro: 69700,
  expert: 149700,
  corporate: 0,
} as const;

export function moduleInPlan(planSlug: string, code: string) {
  if (planSlug === "base") return (BASE_MODULE_CODES as readonly string[]).includes(code);
  if (planSlug === "pro") return (PRO_MODULE_CODES as readonly string[]).includes(code);
  if (planSlug === "expert" || planSlug === "corporate") return true;
  return false;
}

export type MinimumPlanSlug = "base" | "pro" | "expert";

export const MINIMUM_PLAN_LABEL: Record<MinimumPlanSlug, string> = {
  base: "Plano Base",
  pro: "Plano Pro",
  expert: "Plano Expert",
};

/** Menor plano cumulativo que inclui o módulo (Base → Pro → Expert). */
export function minimumPlanSlugForModule(code: string): MinimumPlanSlug {
  if ((BASE_MODULE_CODES as readonly string[]).includes(code)) return "base";
  if ((PRO_MODULE_CODES as readonly string[]).includes(code)) return "pro";
  return "expert";
}

export function minimumPlanLabelForModule(code: string): string {
  return MINIMUM_PLAN_LABEL[minimumPlanSlugForModule(code)];
}
