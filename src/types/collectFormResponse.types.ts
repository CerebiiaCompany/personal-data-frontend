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
}

export interface CollectFormResponse extends CreateCollectFormResponse {
  _id: string;
  collectFormId: string;
}
