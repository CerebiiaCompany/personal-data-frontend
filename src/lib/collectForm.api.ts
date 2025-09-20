import { APIResponse, QueryParams } from "@/types/api.types";
import { CreateCollectForm } from "@/types/collectForm.types";
import { customFetch } from "@/utils/customFetch";

export async function fetchPublicCollectForm({
  id,
}: QueryParams): Promise<APIResponse> {
  let res = customFetch(`/public/collectForms/${id}`);
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
