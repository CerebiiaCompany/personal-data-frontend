import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CreateCollectForm,
  CreateCollectFormFromTemplate,
} from "@/types/collectForm.types";
import { CreateCollectFormResponse } from "@/types/collectFormResponse.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchPublicCollectForm({
  id,
}: QueryParams): Promise<APIResponse> {
  let res = await customFetch(`/public/collectForms/${id}`);
  return res;
}

export async function fetchCollectFormClasifications({
  companyId,
}: QueryParams): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/clasification`
  );

  return res;
}

export async function fetchCollectForms({
  companyId,
  id,
}: QueryParams): Promise<APIResponse> {
  let endpoint = `/companies/${companyId}/collectForms`;

  if (id) endpoint += `/${id}`;

  const res = await customFetch(endpoint);

  return res;
}

export async function createCollectForm(
  companyId: string,
  data: CreateCollectForm
) {
  const res = await customFetch(`/companies/${companyId}/collectForms`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
}

export async function createCollectFormFromTemplate(
  companyId: string,
  data: CreateCollectFormFromTemplate
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/import-template`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function updateCollectForm(
  companyId: string,
  formId: string,
  data: CreateCollectForm
) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  return res;
}

export async function deleteCollectForm(companyId: string, formId: string) {
  const res = await customFetch(
    `/companies/${companyId}/collectForms/${formId}`,
    {
      method: "DELETE",
    }
  );

  return res;
}
