import { describe, expect, it } from "vitest";
import { acceptedBiometricConsentTreatments, isBiometricConsentWizardTreatment } from "./wizardBiometricConsent";

describe("isBiometricConsentWizardTreatment", () => {
  it("detecta tratamientos biométricos inferidos", () => {
    expect(
      isBiometricConsentWizardTreatment({
        id: "control_biometrico",
        name: "Control Biométrico",
        sourceKeys: ["B2-P8"],
      })
    ).toBe(true);
    expect(
      isBiometricConsentWizardTreatment({
        id: "videovigilancia",
        name: "Videovigilancia",
        sourceKeys: ["B2-P7"],
      })
    ).toBe(false);
  });
});

describe("acceptedBiometricConsentTreatments", () => {
  it("solo incluye tratamientos aceptados y biométricos", () => {
    const rows = acceptedBiometricConsentTreatments([
      {
        id: "control_biometrico",
        name: "Control Biométrico",
        sourceKeys: ["B2-P8"],
        accepted: true,
      } as never,
      {
        id: "videovigilancia",
        name: "Videovigilancia",
        sourceKeys: ["B2-P7"],
        accepted: true,
      } as never,
      {
        id: "control_biometrico_clientes",
        name: "Biometría clientes",
        sourceKeys: ["B2-P8"],
        accepted: false,
      } as never,
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("control_biometrico");
  });
});
