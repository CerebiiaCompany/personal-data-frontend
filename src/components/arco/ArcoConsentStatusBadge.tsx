import { ArcoAccessConsentInfo } from "@/types/arco.admin.types";
import {
  getArcoConsentBadgeClass,
  getArcoConsentStatusCode,
  getArcoConsentStatusLabel,
  isArcoConsentLegacyRecord,
} from "@/utils/arcoAdmin.utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";

interface Props {
  consent: ArcoAccessConsentInfo;
  className?: string;
}

const ArcoConsentStatusBadge = ({ consent, className }: Props) => {
  const code = getArcoConsentStatusCode(consent);
  const label = getArcoConsentStatusLabel(consent);
  const legacy = isArcoConsentLegacyRecord(consent);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getArcoConsentBadgeClass(code),
        className
      )}
    >
      {legacy && <Icon icon="tabler:alert-triangle" className="text-sm" />}
      {label}
    </span>
  );
};

export default ArcoConsentStatusBadge;
