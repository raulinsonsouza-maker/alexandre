export type MaskType = "phone" | "cpfCnpj" | "cep" | "cardNumber" | "expMonth" | "expYear" | "cvv";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function maskPhone(value: string) {
  const d = digitsOnly(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCpfCnpj(value: string) {
  const d = digitsOnly(value).slice(0, 14);
  if (!d) return "";
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskCep(value: string) {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskCardNumber(value: string) {
  const d = digitsOnly(value).slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function maskExpMonth(value: string) {
  return digitsOnly(value).slice(0, 2);
}

export function maskExpYear(value: string) {
  return digitsOnly(value).slice(0, 2);
}

export function maskCvv(value: string) {
  return digitsOnly(value).slice(0, 4);
}

export function applyMask(mask: MaskType, value: string) {
  switch (mask) {
    case "phone":
      return maskPhone(value);
    case "cpfCnpj":
      return maskCpfCnpj(value);
    case "cep":
      return maskCep(value);
    case "cardNumber":
      return maskCardNumber(value);
    case "expMonth":
      return maskExpMonth(value);
    case "expYear":
      return maskExpYear(value);
    case "cvv":
      return maskCvv(value);
    default:
      return value;
  }
}

export const MASK_PLACEHOLDERS: Record<MaskType, string> = {
  phone: "(11) 99999-9999",
  cpfCnpj: "000.000.000-00",
  cep: "00000-000",
  cardNumber: "0000 0000 0000 0000",
  expMonth: "MM",
  expYear: "AA",
  cvv: "CVV",
};
