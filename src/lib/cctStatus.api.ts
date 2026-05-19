import { APIResponse } from "@/types/api.types";
import { CctStatusData, CctStatusRequest } from "@/types/cctStatus.types";
import { customFetch } from "@/utils/customFetch";

export async function checkCollectFormCctStatus(
  collectFormId: string,
  body: CctStatusRequest
): Promise<APIResponse<CctStatusData>> {
  return customFetch<CctStatusData>(
    `/public/collectForms/${collectFormId}/cct-status`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}
