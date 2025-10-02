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
    ],
  }),
  definePermissionGroup({
    title: "Plantillas",
    groupName: "templates",
    permissions: [
      { title: "Cargar Plantillas", name: "create" },
      { title: "Visualizar Plantillas", name: "view" },
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
      { title: "Enviar Campaña", name: "send" },
    ],
  }),
];

const defaultPermissions: CompanyRolePermissions =
  generatePermissionsInitialValues(permissionsGroup) as CompanyRolePermissions;

console.log(defaultPermissions);

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
  } = useForm({
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
      className="flex flex-col gap-3 max-w-3xl items-stretch w-full"
    >
      {/* Floating action navbar */}
      <nav
        ref={floatingActionNavbarRef}
        className={clsx([
          "absolute h-full top-0 left-0 transition-all w-full z-10 pointer-events-none",
          {
            "-translate-y-10 opacity-0": !floatingNavbarToggle,
          },
        ])}
      >
        <div
          className={clsx(
            [
              "pointer-events-auto sticky top-0 w-full shadow-md bg-white border border-stone-100 rounded-b-xl flex items-center justify-between px-5 py-4",
            ],
            { "pointer-events-none": !floatingNavbarToggle }
          )}
        >
          <h4 className="font-bold text-lg text-primary-900 flex items-center gap-2">
            <Button
              onClick={() => router.back()}
              hierarchy="tertiary"
              isIconOnly
            >
              <Icon icon={"tabler:arrow-narrow-left"} className="text-2xl" />
            </Button>
            {initialValues ? "Actualizar rol" : "Crear nueva rol"}
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              {initialValues ? "Guardar cambios" : "Crear rol"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-4 flex flex-col gap-5">
        <CustomInput
          label="Cargo"
          {...register("position")}
          placeholder="Ej. Digitador"
          error={errors.position}
        />
        <CustomTextarea
          label="Descripción"
          {...register("description")}
          placeholder="Rol encargado de la creación de formularios"
          error={errors.description}
        />
      </div>
      {/* Separator */}
      <div role="separator" className="w-full h-[1px] bg-disabled"></div>

      <div className="p-4 flex flex-col gap-5">
        <h6 className="font-bold text-xl text-primary-900 text-start">
          Asignación de Permisos
        </h6>

        {permissionsGroup.map((group) => {
          const permissionsState: boolean[] = Object.values(
            watch(`permissions.${group.groupName}`)
          );

          return (
            <div
              key={group.groupName}
              className="rounded-md border border-disabled px-4 py-2 flex flex-col gap-2"
            >
              <div className="flex gap-1 justify-between">
                <p className="font-normal text-stone-700">{group.title}</p>
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
              <div
                role="separator"
                className="w-full h-[1px] bg-disabled"
              ></div>
              <div className="flex flex-wrap gap-5 justify-start mt-3 px-3 pb-3">
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
      </div>

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear rol"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyRoleForm;
