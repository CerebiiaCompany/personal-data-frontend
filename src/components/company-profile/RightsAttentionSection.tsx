"use client";

import ProfileSectionCard from "./ProfileSectionCard";
import ArcoOfficersManager from "@/components/arco/ArcoOfficersManager";
import { useSessionStore } from "@/store/useSessionStore";

interface Props {
  companyId: string;
}

const RightsAttentionSection = ({ companyId }: Props) => {
  const user = useSessionStore((s) => s.user);
  const canEdit =
    user?.role === "COMPANY_ADMIN" || user?.role === "SUPERADMIN";

  return (
    <ProfileSectionCard
      icon="tabler:help-circle"
      title="Atención de derechos ARCO"
      description="Encargados de recibir y atender solicitudes ARCO."
      onSubmit={(e) => e.preventDefault()}
      loading={false}
      hideSubmit
    >
      <ArcoOfficersManager companyId={companyId} canEdit={canEdit} />
    </ProfileSectionCard>
  );
};

export default RightsAttentionSection;
