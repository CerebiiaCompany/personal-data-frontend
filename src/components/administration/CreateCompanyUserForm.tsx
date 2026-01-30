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
import {
  createCollectFormValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
} from "@/validations/main.validations";
import { CreateUser, docTypesOptions, UpdateUser } from "@/types/user.types";
import { createCompanyUser, updateCompanyUser } from "@/lib/user.api";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { useCompanyRoles } from "@/hooks/useCompanyRoles";

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
  const areas = useCompanyAreas({
    companyId: user?.companyUserData?.companyId,
  });
  const roles = useCompanyRoles({
    companyId: user?.companyUserData?.companyId,
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
      role: "COMPANY_ADMIN",
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
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      res = await updateCompanyUser(
        user?.companyUserData?.companyId,
        userId || (params.userId as string),
        data
      );
    } else {
      //? handle creating
      res = await createCompanyUser(
        user?.companyUserData?.companyId,
        data as CreateUser
      );
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }
    if (res.data.id && res.data._id === user._id) {
      // user updated its own document
      setUser(res.data);
    }

    toast.success(initialValues ? "Usuario actualizado" : "Usuario creado");

    router.push(callbackUrl || "/admin/administracion/usuarios");
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
            {initialValues ? "Actualizar usuario" : "Crear nuevo usuario"}
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              {initialValues ? "Guardar cambios" : "Crear usuario "}
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-4 flex flex-col items-stretch gap-5">
        <div className="flex gap-5">
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
        <div className="flex gap-5">
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
        <div className="flex gap-5">
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
        {useMemo(() => {
          if (!areas.data) return null;
          
          const areaOptions = areas.data.map((area) => ({
            value: area._id,
            title: area.name,
          }));

          return (
            <CustomSelect
              onChange={(value) =>
                setValue("companyUserData.companyAreaId", value)
              }
              options={areaOptions}
              label="Asignar Área"
              unselectedText="Seleccionar área"
              value={watch("companyUserData.companyAreaId")}
            />
          );
        }, [areas.data, setValue, watch])}

        {useMemo(() => {
          if (!roles.data) return null;
          
          const roleOptions = roles.data.map((role) => ({
            value: role._id,
            title: role.position,
          }));

          return (
            <CustomSelect
              onChange={(value) =>
                setValue("companyUserData.companyRoleId", value)
              }
              options={roleOptions}
              label="Asignar Rol"
              unselectedText="Seleccionar rol"
              value={watch("companyUserData.companyRoleId")}
            />
          );
        }, [roles.data, setValue, watch])}

        <CustomTextarea
          {...register("companyUserData.note")}
          rows={3}
          placeholder="Añadir nota..."
          className="resize-y"
          error={errors.companyUserData?.note}
        />
      </div>

      {!initialValues && (
        <>
          {/* Separator */}
          <div role="separator" className="w-full h-[1px] bg-disabled"></div>

          <div className="p-4 flex flex-col items-stretch gap-5">
            <div className="flex gap-5">
              <CustomInput
                label="Usuario"
                {...register("username")}
                placeholder="j_doe1"
                error={errors.username}
              />
              <div className="flex flex-col items-start gap-1 text-left flex-1">
                <label
                  htmlFor="passwordField"
                  className="font-medium w-full pl-2 text-stone-500 text-sm"
                >
                  Clave
                </label>
                <div className="w-full relative">
                  <input
                    id="passwordField"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    {...(register("password" as any) as any)}
                    className="gap-2 w-full text-primary-900 flex-1 relative px-3 py-2 pr-12 border border-disabled rounded-lg"
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
        </>
      )}
      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyUserForm;
