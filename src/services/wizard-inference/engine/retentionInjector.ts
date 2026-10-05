import { RetentionAssignment } from "../types";

export function resolveRetention(
  treatmentId: string,
  retentionByTreatment: Map<string, RetentionAssignment>,
  defaultRetention: RetentionAssignment
): RetentionAssignment {
  return retentionByTreatment.get(treatmentId) ?? defaultRetention;
}

export function formatRetentionPeriod(retention: RetentionAssignment): string {
  return `${retention.durationLabel}. Evento que inicia el conteo: ${retention.startEvent}.`;
}
