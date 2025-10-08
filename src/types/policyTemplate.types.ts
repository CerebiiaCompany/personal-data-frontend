import { CustomFile } from "./file.types";

export interface CreatePolicyTemplate {
  name: string;
  fileId: string;
}

export interface PolicyTemplate extends Omit<CreatePolicyTemplate, "fileId"> {
  _id: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  file: CustomFile;
}
