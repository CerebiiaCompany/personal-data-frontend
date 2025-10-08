"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { getSession } from "@/lib/auth.api";
import { useOwnCompanyStore } from "@/store/useOwnCompanyStore";
import { fetchOwnCompany } from "@/lib/company.api";

const CheckActiveSession = () => {
  const pathname = usePathname();
  const { user, setUser, loading, setError, setLoading, error } =
    useSessionStore();
  const ownCompany = useOwnCompanyStore();

  const router = useRouter();

  async function checkSession() {
    console.log("Recovering session...");

    try {
      setLoading(true);

      const session = await getSession();

      if (session.error) {
        let parsedError = parseApiError(session.error);
        setError(parsedError);
        return;
      }

      if (session.data?.companyUserData) {
        console.log("Setting company data...");
        const companyData = await fetchOwnCompany();

        if (companyData.error) {
          console.log("Error fetching company");
          ownCompany.setError(parseApiError(companyData.error));
        }

        ownCompany.setCompany(companyData.data);
      } else {
        ownCompany.setError("No company data for this user");
        console.log("No company data in this user...");
      }

      setUser(session.data);
    } catch (error) {
      console.log(error);
      return setError((error as Error).message || "Unknown error");
    }
  }

  useEffect(() => {
    if ((!user && !error) || (!ownCompany.company && !ownCompany.error)) {
      //try to recover session only once
      checkSession();
    }
  }, [pathname]);

  return <></>;
};

export default CheckActiveSession;
