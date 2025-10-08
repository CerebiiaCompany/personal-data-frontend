export interface CreateCustomFile {
  key: string; // e.g. "policy-templates/abc123.pdf"
  contentType: string;
  size: number; // bytes
  originalName: string;
}

export interface CustomFile extends CreateCustomFile {
  _id: string;
  companyId: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
