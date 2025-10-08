import { APIResponse, QueryParams } from "@/types/api.types";
import {
  CreateCollectForm,
  CreateCollectFormFromTemplate,
} from "@/types/collectForm.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchPublicCollectForm(
  params: QueryParams
): Promise<APIResponse> {
  let res = await customFetch(`/public/collectForms/${params.id}`, {}, params);
  return res;
}

export async function fetchCollectFormClasifications(
  params: QueryParams
): Promise<APIResponse> {
  const res = await customFetch(
    `/companies/${params.companyId}/collectForms/clasification`,
    {},
    params
  );

  return res;
}

export async function fetchCollectForms(
  params: QueryParams
): Promise<APIResponse> {
  let endpoint = `/companies/${params.companyId}/collectForms`;

  if (params.id) endpoint += `/${params.id}`;

  const res = await customFetch(endpoint, {}, params);

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
