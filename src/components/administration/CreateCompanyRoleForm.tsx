import React, { useEffect, useRef, useState } from "react";
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
import { useForm } from "react-hook-form";
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
import {
  createCollectFormValidationSchema,
  createCompanyAreaValidationSchema,
  createCompanyRoleValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
} from "@/validations/main.validations";
import { CreateUser, docTypesOptions, UpdateUser } from "@/types/user.types";
import { createCompanyUser, updateCompanyUser } from "@/lib/user.api";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { countriesOptions, CreateCompanyArea } from "@/types/companyArea.types";
import { createCompanyArea, updateCompanyArea } from "@/lib/companyArea.api";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import {
  CompanyRolePermissions,
  CreateCompanyRole,
} from "@/types/companyRole.types";
import { createCompanyRole, updateCompanyRole } from "@/lib/companyRole.api";
import { generatePermissionsInitialValues } from "@/utils/companyRole.utils";

interface Props {
  initialValues?: CreateCompanyRole;
}

type PermissionGroupName = keyof CompanyRolePermissions;
type PermissionName<K extends PermissionGroupName> =
  keyof CompanyRolePermissions[K];

type PermissionGroup<K extends PermissionGroupName = PermissionGroupName> = {
  title: string;
  groupName: K;
  permissions: { title: string; name: PermissionName<K> }[];
};

const definePermissionGroup = <K extends PermissionGroupName>(
  g: PermissionGroup<K>
) => g;

const permissionsGroup = [
  definePermissionGroup({
    title: "Inicio o Dashboard",
    groupName: "dashboard",
    permissions: [{ title: "Ver Dashboard", name: "view" }],
  }),
  definePermissionGroup({
    title: "Recolección",
    groupName: "collect",
    permissions: [
      { title: "Crear Formularios", name: "create" },
      { title: "Ver Formularios", name: "view" },
      { title: "Editar Formularios", name: "edit" },
      { title: "Eliminar Formularios", name: "delete" },
    ],
  }),
  definePermissionGroup({
    title: "Plantillas",
    groupName: "templates",
    permissions: [
      { title: "Cargar Plantillas", name: "create" },
      { title: "Visualizar Plantillas", name: "view" },
      { title: "Eliminar Plantillas", name: "delete" },
    ],
  }),
  definePermissionGroup({
    title: "Clasificación",
    groupName: "classification",
    permissions: [
      { title: "Cargar Datos", name: "create" },
      { title: "Ver Datos", name: "view" },
      { title: "Editar Datos", name: "edit" },
    ],
  }),
  definePermissionGroup({
    title: "Campañas",
    groupName: "campaigns",
    permissions: [
      { title: "Crear Campañas", name: "create" },
      { title: "Ver Campañas", name: "view" },
      { title: "Editar Campañas", name: "edit" },
      { title: "Eliminar Campañas", name: "delete" },
      { title: "Enviar Campaña", name: "send" },
    ],
  }),
  definePermissionGroup({
    title: "Auditoría",
    groupName: "audit",
    permissions: [{ title: "Ver auditoría", name: "view" }],
  }),
];

const defaultPermissions: CompanyRolePermissions =
  generatePermissionsInitialValues(permissionsGroup) as CompanyRolePermissions;

const CreateCompanyRoleForm = ({ initialValues }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCompanyRole>({
    resolver: zodResolver(createCompanyRoleValidationSchema),
    defaultValues: initialValues || {
      position: "",
      description: "",
      permissions: defaultPermissions,
    },
  });
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("scrollContainer");
    if (!scrollContainer || !formRef.current) return;
    const firstFormContainer = formRef.current!.querySelector(
      "&>div"
    ) as HTMLElement;

    scrollContainer.addEventListener("scroll", (e) => {
      if (!floatingActionNavbarRef.current) return;
      if (
        (e.target as HTMLElement).scrollTop >
        firstFormContainer.offsetTop + 20
      ) {
        setFloatingNavbarToggle(true);
      } else {
        setFloatingNavbarToggle(false);
      }
    });
  }, []);

  async function onSubmit(data: CreateCompanyRole) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      res = await updateCompanyRole(
        user?.companyUserData?.companyId,
        params.roleId as string,
        data
      );
    } else {
      //? handle creating
      res = await createCompanyRole(user?.companyUserData?.companyId, data);
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(initialValues ? "Rol actualizado" : "Rol creado");

    router.push("/admin/administracion/roles");
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
            "pointer-events-auto sticky top-0 flex w-full flex-col items-stretch justify-between gap-3 rounded-b-2xl border border-[#E8EDF7] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,35,70,0.08)] sm:flex-row sm:items-center sm:px-5 sm:py-3.5",
            { "pointer-events-none": !floatingNavbarToggle }
          )}
        >
          <h4 className="flex min-w-0 items-center gap-2 text-base font-bold text-[#1A2B5B] sm:text-lg">
            <Button
              onClick={() => router.back()}
              hierarchy="tertiary"
              isIconOnly
              className="shrink-0"
            >
              <Icon icon="tabler:arrow-narrow-left" className="text-xl sm:text-2xl" />
            </Button>
            <span className="truncate">
              {initialValues ? "Actualizar rol" : "Nuevo rol"}
            </span>
          </h4>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              type="submit"
              loading={loading}
              className="w-full rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-5! py-2.5! text-[13px]! font-semibold! text-white! sm:w-auto"
            >
              {initialValues ? "Guardar cambios" : "Crear rol"}
            </Button>
          </div>
        </div>
      </nav>

      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <h2 className="mb-4 text-[15px] font-bold tracking-tight text-[#1A2B5B]">
          Datos del rol
        </h2>
        <div className="flex flex-col gap-4 sm:gap-5">
          <CustomInput
            label="Cargo"
            {...register("position")}
            placeholder="Ej. Digitador"
            error={errors.position}
          />
          <CustomTextarea
            label="Descripción"
            {...register("description")}
            placeholder="Describe las responsabilidades de este rol"
            error={errors.description}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#E8EDF7] bg-white p-5 shadow-[0_2px_12px_rgba(15,35,70,0.04)] sm:p-6">
        <h2 className="mb-1 text-[15px] font-bold tracking-tight text-[#1A2B5B]">
          Asignación de permisos
        </h2>
        <p className="mb-5 text-[13px] leading-relaxed text-[#64748B]">
          Marca los permisos que tendrán los usuarios asignados a este rol.
        </p>

        {permissionsGroup.map((group) => {
          const permissionsState: boolean[] = Object.values(
            watch(`permissions.${group.groupName}`)
          );

          return (
            <div
              key={group.groupName}
              className="mb-4 flex flex-col gap-3 rounded-xl border border-[#E8EDF7] bg-[#FAFCFF] p-4 last:mb-0 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#EEF2F8] pb-3">
                <p className="text-sm font-semibold text-[#0B1737] sm:text-[15px]">
                  {group.title}
                </p>
                <CustomCheckbox
                  checked={permissionsState.every(Boolean)}
                  onChange={(_) => {
                    const groupState = {
                      ...watch(`permissions.${group.groupName}`),
                    };
                    let newValue = true;

                    if (Object.values(groupState).every(Boolean)) {
                      newValue = false;
                    }

                    for (let permission of group.permissions) {
                      groupState[permission.name as keyof typeof groupState] =
                        newValue;
                    }

                    setValue(`permissions.${group.groupName}`, groupState);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {group.permissions.map((permission) => (
                  <CustomCheckbox
                    key={`${group.groupName}-${permission.name}`}
                    label={permission.title}
                    {...register(
                      `permissions.${group.groupName}.${permission.name}` as `permissions.${PermissionGroupName}`
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl! border-[#1A2B5B]! bg-[#1A2B5B]! px-6! py-3! text-[13px]! font-semibold! text-white! sm:w-auto sm:min-w-[200px]"
        >
          {initialValues ? "Guardar cambios" : "Crear rol"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyRoleForm;
