"use client";

import DataOfficerCard from "@/components/administration/DataOfficerCard";
import { useHashSectionFocus } from "@/hooks/useHashSectionFocus";

export const DATA_PROTECTION_OFFICER_SECTION_ID = "oficial-proteccion-datos";

const DataProtectionOfficerSection = () => {
  useHashSectionFocus(DATA_PROTECTION_OFFICER_SECTION_ID);

  return (
    <div id={DATA_PROTECTION_OFFICER_SECTION_ID} className="scroll-mt-6">
      <DataOfficerCard compact={false} hideWhenAssigned={false} />
    </div>
  );
};

export default DataProtectionOfficerSection;
