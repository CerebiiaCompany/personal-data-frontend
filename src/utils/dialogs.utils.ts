import { HTML_IDS_DATA } from "@/constants/htmlIdsData";

export function showDialog(
  id: (typeof HTML_IDS_DATA)[keyof typeof HTML_IDS_DATA]
) {
  document.getElementById(id)?.classList.add("dialog-visible");
}
export function hideDialog(
  id: (typeof HTML_IDS_DATA)[keyof typeof HTML_IDS_DATA]
) {
  document.getElementById(id)?.classList.remove("dialog-visible");
}
