import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Button from "../base/Button";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import {
  AnswerType,
  CreateCollectForm,
  DataType,
} from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { FieldError, useForm } from "react-hook-form";
import SelectTemplateDialog from "../dialogs/SelectTemplateDialog";
import CustomCheckbox from "../forms/CustomCheckbox";
import CustomInput from "../forms/CustomInput";
import CustomSelect from "../forms/CustomSelect";
import CustomTextarea from "../forms/CustomTextarea";
import { useSessionStore } from "@/store/useSessionStore";
import { createCollectForm, updateCollectForm } from "@/lib/collectForm.api";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCollectFormValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
} from "@/validations/main.validations";
import { CreateUser, docTypesOptions, UpdateUser, userRoleOptions } from "@/types/user.types";
import { createCompanyUser, updateCompanyUser } from "@/lib/user.api";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";
import { usePermissionCheck } from "@/hooks/usePermissionCheck";
import { useActiveCompanyId } from "@/hooks/useActiveCompanyId";

interface Props {
  initialValues?: CreateUser | UpdateUser;
  userId?: string;
  callbackUrl?: string;
}

const CreateCompanyUserForm = ({
  initialValues,
  userId,
  callbackUrl,
}: Props) => {
  const { user, setUser } = useSessionStore();
  const { isCompanyAdmin, isSuperAdmin } = usePermissionCheck();
  const companyId = useActiveCompanyId();
  const areas = useCompanyAreas({
    companyId: companyId,
  });
  const roles = useCompanyRoles({
    companyId: companyId,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(
      initialValues ? updateUserValidationSchema : createUserValidationSchema
    ),
    defaultValues: initialValues || {
      role: "USER", // Por defecto crear usuarios regulares
      companyUserData: {
        docType: "CC",
      },
    },
  });
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const isCreating = !initialValues;
  const systemRole = watch("role");
  const hasNoAreas =
    isCreating &&
    !areas.loading &&
    Array.isArray(areas.data) &&
    areas.data.length === 0;
  const hasNoCustomRoles =
    isCreating &&
    systemRole === "USER" &&
    !roles.loading &&
    Array.isArray(roles.data) &&
    roles.data.length === 0;
  const cannotCreateUser = hasNoAreas || hasNoCustomRoles;
  const areaOptions = useMemo(
    () =>
      (areas.data ?? []).map((area) => ({
        value: area._id,
        title: area.name,
      })),
    [areas.data]
  );
  const customRoleOptions = useMemo(
    () =>
      (roles.data ?? []).map((role) => ({
        value: role._id,
        title: role.position,
      })),
    [roles.data]
  );

  useEffect(() => {
    const scrollContainer = document.getElementById("scrollContainer");
    if (!scrollContainer || !formRef.current) return;
    const firstFormContainer = formRef.current!.querySelector(
      "&>div"
    ) as HTMLElement;

    const handleScroll = (e: Event) => {
      if (!floatingActionNavbarRef.current) return;
      const target = e.target as HTMLElement;
      if (
        target.scrollTop >
        firstFormContainer.offsetTop + 20
      ) {
        setFloatingNavbarToggle(true);
      } else {
        setFloatingNavbarToggle(false);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    // Cleanup: remover el event listener cuando el componente se desmonte
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  async function onSubmit(data: CreateUser | UpdateUser) {
    if (!companyId) return;

    if (isCreating && hasNoAreas) {
      toast.error(
        "Es necesario crear al menos un área antes de asignarla a un nuevo usuario."
      );
      return;
    }

    if (isCreating && hasNoCustomRoles) {
      toast.error(
        "Es necesario crear al menos un rol personalizado antes de asignarlo a un nuevo usuario."
      );
      return;
    }

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      // Remover campos vacíos de username y password si no fueron modificados
      const updateData = { ...data };
      if (!updateData.username || updateData.username.trim() === '') {
        delete updateData.username;
      }
      if (!updateData.password || updateData.password.trim() === '') {
        delete updateData.password;
      }
      
      res = await updateCompanyUser(
        companyId,
        userId || (params.userId as string),
        updateData
      );
    } else {
      //? handle creating
      res = await createCompanyUser(
        companyId,
        data as CreateUser
      );
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }
    if (res.data.id && res.data._id === user?._id) {
      // user updated its own document
      setUser(res.data);
    }

    toast.success(initialValues ? "Usuario actualizado" : "Usuario creado");

    router.refresh();
    router.push(callbackUrl || "/admin/administracion/usuarios");
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-6"
    >
      <nav
        ref={floatingActionNavbarRef}
        className={clsx([
          "pointer-events-none absolute left-0 top-0 z-10 h-full w-full transition-all",
          {
            "-translate-y-10 opacity-0": !floatingNavbarToggle,
          },
        ])}
      >
        <div
          className={clsx(
            "pointer-events-auto sticky top-0 flex w-full items-center justify-between gap-3 rounded-b-2xl border border-[#E8EDF7] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,35,70,0.08)] sm:px-5 sm:py-3.5",
            { "pointer-events-none": !floatingNavbarToggle }
          )}
        >
          <h4 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#1A2B5B] sm:text-lg">
            <Button
              onClick={() => router.back()}
              hierarchy="tertiary"
              isIconOnly
            >
              <Icon icon="tabler:arrow-narrow-left" className="text-2xl" />
            </Button>
            <span className="truncate">
              {initialValues ? "Actualizar usuario" : "Nuevo usuario"}
            </span>
          </h4>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="submit"
              loading={loading}
              disabled={cannotCreateUser}
              className="rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white!"
            >
              {initialValues ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </div>
        </div>
      </nav>

      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <h2 className="mb-4 text-[15px] font-bold tracking-tight text-[#1A2B5B]">
          Datos personales y laborales
        </h2>
        <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CustomInput
            label="Nombres"
            {...register("name")}
            placeholder="Ej. Jhon"
            error={errors.name}
          />
          <CustomInput
            label="Apellidos"
            {...register("lastName")}
            placeholder="Ej. Doe"
            error={errors.lastName}
          />
        </div>
        <CustomInput
          label="Cargo"
          {...register("companyUserData.position")}
          placeholder="Ej. Vicepresidente Ejecutivo"
          error={errors.companyUserData?.position}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CustomInput
            label="Correo Personal"
            type="email"
            {...register("companyUserData.personalEmail")}
            placeholder="Ej. alguien@example.com"
            error={errors.companyUserData?.personalEmail}
          />
          <CustomInput
            label="Teléfono"
            {...register("companyUserData.phone")}
            placeholder="Ej. 1112223333"
            error={errors.companyUserData?.phone}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <CustomSelect
              label="Tipo de documento"
              options={docTypesOptions}
              value={watch("companyUserData.docType")}
              onChange={(value) => setValue("companyUserData.docType", value)}
            />
          </div>
          <CustomInput
            label="Número de documento"
            {...register("companyUserData.docNumber")}
            error={errors.companyUserData?.docNumber as FieldError}
          />
        </div>

        {/* Memoizar las opciones para evitar recrearlas en cada render */}
        {/* Selector de Rol del Sistema (USER o COMPANY_ADMIN) */}
        <div className="flex flex-col gap-1">
          <CustomSelect
            label="Rol del Sistema"
            options={userRoleOptions.filter(opt => opt.value !== "SUPERADMIN")}
            value={watch("role")}
            onChange={(value) =>
              setValue("role", value, { shouldValidate: true })
            }
          />
          {errors.role && (
            <span className="text-red-400 text-sm font-semibold">
              {errors.role.message}
            </span>
          )}
        </div>

        {areas.loading && (
          <p className="text-sm text-[#64748B]">Cargando áreas disponibles...</p>
        )}

        {hasNoAreas && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Icon
              icon="tabler:alert-triangle"
              className="mt-0.5 shrink-0 text-xl text-amber-600"
            />
            <div className="space-y-2 text-sm text-amber-900">
              <p>
                No hay áreas registradas en tu compañía. Es necesario crear un
                área para poder asignársela a este usuario.
              </p>
              <Link
                href="/admin/administracion/areas/crear"
                className="inline-flex items-center gap-1 font-semibold text-[#1A2B5B] underline hover:no-underline"
              >
                Crear área
                <Icon icon="tabler:arrow-right" className="text-base" />
              </Link>
            </div>
          </div>
        )}

        {!areas.loading && areaOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <CustomSelect
              onChange={(value) =>
                setValue("companyUserData.companyAreaId", value, {
                  shouldValidate: true,
                })
              }
              options={areaOptions}
              label="Asignar Área"
              unselectedText="Seleccionar área"
              value={watch("companyUserData.companyAreaId")}
            />
            {errors.companyUserData?.companyAreaId && (
              <span className="text-sm font-semibold text-red-400">
                {errors.companyUserData.companyAreaId.message}
              </span>
            )}
          </div>
        )}

        {systemRole === "USER" && roles.loading && (
          <p className="text-sm text-[#64748B]">
            Cargando roles personalizados...
          </p>
        )}

        {hasNoCustomRoles && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Icon
              icon="tabler:alert-triangle"
              className="mt-0.5 shrink-0 text-xl text-amber-600"
            />
            <div className="space-y-2 text-sm text-amber-900">
              <p>
                No hay roles personalizados registrados en tu compañía. Es
                necesario crear un rol personalizado para poder asignárselo a
                este usuario.
              </p>
              <Link
                href="/admin/administracion/roles/crear"
                className="inline-flex items-center gap-1 font-semibold text-[#1A2B5B] underline hover:no-underline"
              >
                Crear rol personalizado
                <Icon icon="tabler:arrow-right" className="text-base" />
              </Link>
            </div>
          </div>
        )}

        {systemRole === "USER" &&
          !roles.loading &&
          customRoleOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <CustomSelect
                onChange={(value) =>
                  setValue("companyUserData.companyRoleId", value, {
                    shouldValidate: true,
                  })
                }
                options={customRoleOptions}
                label="Asignar Rol Personalizado"
                unselectedText="Seleccionar rol"
                value={watch("companyUserData.companyRoleId")}
              />
              {errors.companyUserData?.companyRoleId && (
                <span className="text-sm font-semibold text-red-400">
                  {errors.companyUserData.companyRoleId.message}
                </span>
              )}
            </div>
          )}

        <CustomTextarea
          {...register("companyUserData.note")}
          rows={3}
          placeholder="Añadir nota..."
          className="resize-y"
          error={errors.companyUserData?.note}
        />
        </div>
      </section>

      {(!initialValues || isCompanyAdmin || isSuperAdmin) && (
        <>
          <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
            <h2 className="mb-4 text-[15px] font-bold tracking-tight text-[#1A2B5B]">
              Acceso a la plataforma
            </h2>
          <div className="flex flex-col gap-5">
            {initialValues && isCompanyAdmin && !isSuperAdmin && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon icon="tabler:info-circle" className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Como <strong>Administrador de Compañía</strong>, puedes actualizar las credenciales de acceso de este usuario. Los campos son opcionales.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <CustomInput
                label={initialValues ? "Nuevo Usuario (opcional)" : "Usuario"}
                {...register("username")}
                placeholder={initialValues ? "Dejar vacío para mantener el actual" : "j_doe1"}
                error={errors.username}
              />
              <div className="flex flex-col items-start gap-1 text-left flex-1">
                <label
                  htmlFor="passwordField"
                  className="font-medium w-full pl-2 text-stone-500 text-sm"
                >
                  {initialValues ? "Nueva Clave (opcional)" : "Clave"}
                </label>
                <div className="w-full relative">
                  <input
                    id="passwordField"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder={initialValues ? "Dejar vacío para mantener la actual" : "••••••••"}
                    {...(register("password" as any) as any)}
                    className="relative w-full flex-1 gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 pr-12 text-sm text-[#0F172A] outline-none transition focus:border-[#1A2B5B] focus:bg-white focus:ring-2 focus:ring-[#1A2B5B]/12"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
                    aria-label={
                      isPasswordVisible
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    title={
                      isPasswordVisible
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    <Icon
                      icon={
                        isPasswordVisible
                          ? "tabler:eye-off"
                          : "tabler:eye"
                      }
                      className="text-lg"
                    />
                  </button>
                </div>

                {(errors as any).password && (
                  <span className="text-red-400 text-sm font-semibold">
                    {(errors as any).password.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          </section>
        </>
      )}
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          loading={loading}
          disabled={cannotCreateUser}
          className="w-full rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-6! py-3! text-[13px]! font-semibold! text-white! sm:w-auto sm:min-w-[200px]"
        >
          {initialValues ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyUserForm;
