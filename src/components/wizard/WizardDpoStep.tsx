"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import CompanyUserMultiSelect from "@/components/company-profile/CompanyUserMultiSelect";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import { createCompanyUser } from "@/lib/user.api";
import { useSessionStore } from "@/store/useSessionStore";
import { CompanyUserSummary } from "@/types/company.types";
import { DocType } from "@/types/user.types";
import { findDpoCompanyRoleId, isEligibleDpoCandidate } from "@/utils/dpoEligibility";
import { parseApiError } from "@/utils/parseApiError";

interface Props {
  companyId: string;
  dataOfficerUserId?: string | null;
  authorizedPersonnelUserIds?: string[];
  onChange: (patch: {
    dataOfficerUserId?: string;
    authorizedPersonnelUserIds?: string[];
  }) => void;
}

export default function WizardDpoStep({
  companyId,
  dataOfficerUserId,
  authorizedPersonnelUserIds = [],
  onChange,
}: Props) {
  const sessionUser = useSessionStore((s) => s.user);
  const isCompanyAdmin = sessionUser?.role === "COMPANY_ADMIN";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<CompanyUserSummary[]>([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickLastName, setQuickLastName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: pageData, loading, meta, refresh } = useCompanyUsers({
    companyId,
    page,
    pageSize: 50,
    search: debouncedSearch,
  });

  const { data: companyRoles } = useCompanyRoles({ companyId, page: 1, pageSize: 50 });

  useEffect(() => {
    if (!pageData) return;
    setAllUsers((prev) => (page === 1 ? pageData : [...prev, ...pageData]));
  }, [pageData, page]);

  const eligibleUsers = useMemo(() => {
    const fromList = allUsers.filter((u) => isEligibleDpoCandidate(u));
    if (!sessionUser?._id || !isCompanyAdmin) return fromList;
    if (fromList.some((u) => u._id === sessionUser._id)) return fromList;
    const adminAsUser: CompanyUserSummary = {
      _id: sessionUser._id,
      name: sessionUser.name,
      lastName: sessionUser.lastName,
      username: sessionUser.username,
      companyUserData: sessionUser.companyUserData,
    };
    return [adminAsUser, ...fromList];
  }, [allUsers, isCompanyAdmin, sessionUser]);

  const dpoRoleId = useMemo(() => findDpoCompanyRoleId(companyRoles ?? []), [companyRoles]);

  const selectedIsSelf = dataOfficerUserId === sessionUser?._id;

  function assignSelf() {
    if (!sessionUser?._id) return;
    onChange({ dataOfficerUserId: sessionUser._id });
    toast.success("Te designaste como Oficial de Protección de Datos");
  }

  async function handleQuickCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!quickName.trim() || !quickLastName.trim() || !quickEmail.trim()) {
      toast.error("Completa nombre, apellido y correo");
      return;
    }
    if (!dpoRoleId) {
      toast.error(
        "No hay un rol DPO en la empresa. Crea el rol desde Administración → Roles o contacta soporte."
      );
      return;
    }

    setCreating(true);
    const res = await createCompanyUser(companyId, {
      name: quickName.trim(),
      lastName: quickLastName.trim(),
      username: quickEmail.trim(),
      role: "USER",
      companyUserData: {
        position: "Oficial de Protección de Datos",
        phone: "",
        personalEmail: quickEmail.trim(),
        companyRoleId: dpoRoleId,
        docNumber: "",
        docType: "OTHER" as DocType,
      },
    });
    setCreating(false);

    if (res.error) {
      toast.error(parseApiError(res.error));
      return;
    }

    const newUserId = (res.data as { id?: string; _id?: string })?.id ?? (res.data as { _id?: string })?._id;
    const tempPassword = (res.data as { tempPassword?: string })?.tempPassword;

    if (tempPassword) {
      toast.success(
        `Usuario DPO creado. Contraseña temporal (cópiala ahora): ${tempPassword}`,
        { duration: 15000 }
      );
    } else {
      toast.success("Usuario DPO creado y seleccionado");
    }

    setQuickName("");
    setQuickLastName("");
    setQuickEmail("");
    setShowQuickCreate(false);
    setPage(1);
    setAllUsers([]);
    await refresh();

    if (newUserId) {
      onChange({ dataOfficerUserId: newUserId });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        Designa al Oficial de Protección de Datos. Puede ser tú (administrador) o un usuario con rol
        DPO.
      </p>

      {isCompanyAdmin && sessionUser && (
        <div className="rounded-xl border border-[#C7D7F5] bg-[#F0F5FF] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A2B5B]">¿Eres tú el responsable?</p>
              <p className="mt-0.5 text-sm text-[#64748B]">
                {sessionUser.name} {sessionUser.lastName} — administrador de la empresa
              </p>
            </div>
            <Button
              type="button"
              hierarchy={selectedIsSelf ? "primary" : "secondary"}
              className="shrink-0"
              startContent={<Icon icon="tabler:user-check" className="text-lg" />}
              onClick={assignSelf}
            >
              {selectedIsSelf ? "Seleccionado como DPO" : "Designarme como DPO"}
            </Button>
          </div>
        </div>
      )}

      <CustomSelect
        label="Oficial de Protección de Datos (DPO)"
        options={eligibleUsers.map((u) => ({
          value: u._id,
          title:
            `${u.name} ${u.lastName}`.trim() +
            (u._id === sessionUser?._id && isCompanyAdmin ? " (Admin)" : ""),
        }))}
        value={dataOfficerUserId ?? ""}
        unselectedText={
          eligibleUsers.length ? "Seleccionar usuario" : "No hay usuarios elegibles todavía"
        }
        onChange={(val) => onChange({ dataOfficerUserId: val })}
      />

      {!showQuickCreate ? (
        <button
          type="button"
          onClick={() => setShowQuickCreate(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#3357A5] hover:underline"
        >
          <Icon icon="tabler:user-plus" className="text-base" />
          Crear usuario DPO rápido
        </button>
      ) : (
        <form
          onSubmit={handleQuickCreate}
          className="rounded-xl border border-dashed border-[#C7D7F5] bg-[#FAFCFF] p-4"
        >
          <p className="mb-3 text-sm font-semibold text-[#1A2B5B]">Nuevo Oficial de Protección de Datos</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CustomInput
              label="Nombre"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
            />
            <CustomInput
              label="Apellido"
              value={quickLastName}
              onChange={(e) => setQuickLastName(e.target.value)}
            />
            <CustomInput
              label="Correo (usuario de acceso)"
              type="email"
              value={quickEmail}
              onChange={(e) => setQuickEmail(e.target.value)}
              className="sm:col-span-2"
            />
          </div>
          <p className="mt-2 text-xs text-[#64748B]">
            Se creará con el rol DPO y una contraseña temporal que verás al guardar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" loading={creating}>
              Crear y seleccionar
            </Button>
            <Button
              type="button"
              hierarchy="secondary"
              disabled={creating}
              onClick={() => setShowQuickCreate(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-[#1A2B5B]">Personal autorizado (opcional)</p>
        <CompanyUserMultiSelect
          users={allUsers}
          loading={loading && allUsers.length === 0}
          loadingMore={loading && allUsers.length > 0}
          selectedIds={authorizedPersonnelUserIds}
          onChange={(ids) => onChange({ authorizedPersonnelUserIds: ids })}
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
            setAllUsers([]);
          }}
          totalCount={meta?.totalCount}
          hasMore={!!meta && (meta.page ?? 1) < (meta.totalPages ?? 1)}
          onLoadMore={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
