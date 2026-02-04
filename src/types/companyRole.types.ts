export type CompanyRolePermissions = {
  dashboard: {
    view: boolean;
  };
  collect: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  templates: {
    create: boolean;
    view: boolean;
    delete: boolean;
  };
  classification: {
    create: boolean;
    view: boolean;
    edit: boolean;
  };
  campaigns: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
    send: boolean;
  };
};

export interface CreateCompanyRole {
  position: string;
  description: string;
  permissions: CompanyRolePermissions;
}

export interface CompanyRole extends CreateCompanyRole {
  _id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}
