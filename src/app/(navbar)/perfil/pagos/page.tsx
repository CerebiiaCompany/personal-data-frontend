"use client";

import Button from "@/components/base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import { updatePassword } from "@/lib/auth.api";
import { useSessionStore } from "@/store/useSessionStore";
import { parseUserRoleToString } from "@/types/user.types";
import { hideDialog, showDialog } from "@/utils/dialogs.utils";
import { parseApiError } from "@/utils/parseApiError";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import CustomInput from "@/components/forms/CustomInput";
import { useCompanyPayments } from "@/hooks/useCompanyPayments";
import CompanyPaymentsTable from "@/components/profile/payments/CompanyPaymentsTable";

export default function ProfilePaymentsHistoryPage() {
  const user = useSessionStore((store) => store.user);
  const router = useRouter();
  const { data, loading, error, refresh } = useCompanyPayments({
    companyId: user?.companyUserData?.companyId,
  });

  console.log(data);

  return (
    <div className="flex-1 flex h-full flex-col gap-3 max-h-full overflow-y-auto">
      <h6 className="font-bold text-xl text-primary-900 mb-2">
        Historial de pagos
      </h6>

      <CompanyPaymentsTable
        loading={loading}
        error={error}
        items={data}
        refresh={refresh}
      />
    </div>
  );
}
