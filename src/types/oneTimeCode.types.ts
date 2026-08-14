export type OtpStatus = "PENDING" | "VERIFIED" | "EXPIRED";

/** Los OTP de verificación solo se envían por SMS o correo — WhatsApp no está soportado. */
export type OtpDeliveryChannel = "SMS" | "EMAIL";

export interface CreateOneTimeCode {
  collectFormId: string;
  recipientData: {
    channel: OtpDeliveryChannel;
    address: string; //? email if channel is "EMAIL", phone númber if channel is "SMS"
  };
}

export interface OneTimeCode extends CreateOneTimeCode {
  _id: string;
  code: string;
  expiresAt: Date;
  status: OtpStatus;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
