import { InternationalTransferRule, WizardInferenceFlags } from "../types";

const FLAG_REASONS: Partial<Record<keyof WizardInferenceFlags, string>> = {
  hasForeignCloud: "Almacenamiento o procesamiento en cloud extranjero (B2-P11 / Bloque 4)",
  hasForeignCrm: "CRM, ERP o SaaS con servidor en el extranjero (B2-P11)",
  hasForeignMarketingSaas: "Herramienta de marketing o analytics extranjera (B2-P11)",
  hasForeignPayment: "Pasarela o billetera con posible servidor en el extranjero (B3-P28)",
};

export function resolveInternationalTransfer(
  rule: InternationalTransferRule,
  flags: WizardInferenceFlags
): { value: boolean; reason?: string } {
  if (rule.mode === "never") return { value: false };
  if (rule.mode === "always") return { value: true, reason: "Transferencia internacional declarada o servicio extranjero" };
  const value = Boolean(flags[rule.flag]);
  return { value, reason: value ? FLAG_REASONS[rule.flag] : undefined };
}
