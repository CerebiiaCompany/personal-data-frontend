import { CustomFormData } from "@/types/form.types";

export const FORMS_MOCK_DATA: CustomFormData[] = [
  {
    id: "a1b2c3d4e5f6",
    title: "Suscripción al boletín trimestral",
    createdAt: new Date("2024-05-15T10:00:00Z"),
    updatedAt: new Date("2024-05-15T10:00:00Z"),
    marketingChannels: ["EMAIL", "SMS"],
  },
  {
    id: "f6e5d4c3b2a1",
    title: "Registro para alertas de promociones",
    createdAt: new Date("2024-06-01T14:30:00Z"),
    updatedAt: new Date("2024-06-01T14:30:00Z"),
    marketingChannels: ["SMS", "WHATSAPP"],
  },
  {
    id: "g7h8i9j0k1l2",
    title: "Suscripción para actualizaciones del producto",
    createdAt: new Date("2024-06-10T09:15:00Z"),
    updatedAt: new Date("2024-06-10T09:15:00Z"),
    marketingChannels: ["EMAIL", "SMS", "WHATSAPP"],
  },
  {
    id: "m3n4o5p6q7r8",
    title: "Opt-in para descuentos especiales",
    createdAt: new Date("2024-07-20T11:45:00Z"),
    updatedAt: new Date("2024-07-20T11:45:00Z"),
    marketingChannels: ["EMAIL"],
  },
  {
    id: "s9t0u1v2w3x4",
    title: "Notificaciones de eventos exclusivos",
    createdAt: new Date("2024-08-05T18:00:00Z"),
    updatedAt: new Date("2024-08-05T18:00:00Z"),
    marketingChannels: ["WHATSAPP"],
  },
];
