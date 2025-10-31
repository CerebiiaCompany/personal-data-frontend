import { CustomSelectOption } from "./forms.types";
import { DocType } from "./user.types";

export type UserGender = "MALE" | "FEMALE" | "OTHER";
export const userGendersOptions: CustomSelectOption<UserGender>[] = [
  {
    title: "Masculino",
    value: "MALE",
  },
  {
    title: "Femenino",
    value: "FEMALE",
  },
  {
    title: "Otro",
    value: "OTHER",
  },
];

export const parseUserGenderToString = (role: UserGender): string =>
  userGendersOptions.find((e) => e.value === role)?.title || "Género inválido";

export interface CollectFormResponseUser {
  docType: DocType;
  docNumber: number;
  name: string;
  lastName: string;
  age: number;
  gender: UserGender;
  email: string;
  phone: string;
}

export interface CreateCollectFormResponse {
  user: CollectFormResponseUser;
  data: { [key: string]: any };
  dataProcessing: boolean;
  otpCode: string;
  otpCodeId: string;
}

export interface CollectFormResponse extends CreateCollectFormResponse {
  _id: string;
  collectFormId: string;
  verifiedWithOTP?: boolean;
  createdAt?: string;
  createdBy?: {
    _id?: string;
    userId?: string;
    name?: string;
    lastName?: string;
    email?: string;
    username?: string;
  };
}
