import { ArcoLookupResult, ArcoOtpChannel } from "@/types/arco.types";
import { PersonasVerification } from "@/utils/personasSession";

export function getMaskedDestinationFromLookup(data: ArcoLookupResult): string {
  if (data.channel === "SMS") {
    return data.maskedPhone ?? "tu celular registrado";
  }
  return data.maskedEmail ?? "tu correo registrado";
}

export function getMaskedDestinationFromSession(
  verification: PersonasVerification
): string {
  const channel = verification.channel ?? "EMAIL";
  if (channel === "SMS") {
    return verification.maskedPhone ?? "tu celular registrado";
  }
  return verification.maskedEmail ?? "tu correo registrado";
}

export function getOtpChannelIcon(channel?: ArcoOtpChannel): string {
  return channel === "SMS" ? "tabler:device-mobile" : "tabler:mail";
}

export function isSmsChannelAvailableForCountry(
  country: "CO" | "CL"
): boolean {
  return country === "CO";
}
