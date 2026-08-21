import React, { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  getAdminDocTypeOptionsByCountry,
  getJuridicaDocType,
} from "@/types/user.types";
import { formatRutDisplay, normalizeRut } from "@/utils/rutValidator";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { COMPANY_COUNTRY_CODE_OPTIONS, CreateCompany } from "@/types/company.types";
import { createCompanyValidationSchema } from "@/validations/superadmin.validations";
import { usePlans } from "@/hooks/usePlans";
import { createCompany } from "@/lib/company.api";
import { CustomSelectOption } from "@/types/forms.types";

function formatPhoneDisplay(value: string, indicator: string): string {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (indicator === "56") {
    const truncated = digits.slice(0, 9);
    if (truncated.length > 5) {
      return `${truncated.slice(0, 1)} ${truncated.slice(1, 5)} ${truncated.slice(5)}`;
    }
    if (truncated.length > 1) {
      return `${truncated.slice(0, 1)} ${truncated.slice(1)}`;
    }
    return truncated;
  }
  const truncated = digits.slice(0, 10);
  if (truncated.length > 6) {
    return `${truncated.slice(0, 3)} ${truncated.slice(3, 6)} ${truncated.slice(6)}`;
  }
  if (truncated.length > 3) {
    return `${truncated.slice(0, 3)} ${truncated.slice(3)}`;
  }
  return truncated;
}
interface Props {
  initialValues?: CreateCompany;
}

const CreateCompanyForm = ({ initialValues }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(createCompanyValidationSchema),
    mode: "onChange",
    defaultValues: initialValues || {
      manager: {
        docType: "CC",
      },
      countryCode: "CO",
    },
  });
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);
  const plans = usePlans({});
  const [plansOptions, setPlansOptions] = useState<
    CustomSelectOption<string>[] | null
  >(null);
  const countryCode = watch("countryCode");
  const managerDocType = watch("manager.docType");
  const nitValue = watch("nit") ?? "";
  const managerDocNumber = watch("manager.docNumber") ?? "";
  const { options: managerDocTypeOptions, defaultValue: managerDocTypeDefault } =
    getAdminDocTypeOptionsByCountry(countryCode);
  const juridicaDocLabel = getJuridicaDocType(countryCode);
  const isChile = countryCode === "CL";
  const managerUsesRut =
    managerDocType === "RUT" || managerDocType === "CI";

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

  useEffect(() => {
    if (plans.data && !plansOptions) {
      setPlansOptions(
        plans.data.map((plan) => ({
          title: plan.name,
          value: plan._id,
        }))
      );
    }
  }, [plans.data]);

  useEffect(() => {
    const isValid = managerDocTypeOptions.some(
      (option) => option.value === managerDocType
    );
    if (!isValid) {
      setValue("manager.docType", managerDocTypeDefault, { shouldValidate: true });
    }
  }, [managerDocType, managerDocTypeDefault, managerDocTypeOptions, setValue]);

  useEffect(() => {
    if (isChile && nitValue) {
      const formatted = formatRutDisplay(nitValue);
      if (formatted !== nitValue) {
        setValue("nit", formatted, { shouldValidate: true });
      } else {
        void trigger("nit");
      }
    }
    if ((isChile || managerUsesRut) && managerDocNumber) {
      const formatted = formatRutDisplay(managerDocNumber);
      if (formatted !== managerDocNumber) {
        setValue("manager.docNumber", formatted, { shouldValidate: true });
      } else {
        void trigger("manager.docNumber");
      }
    }
    // Revalida al cambiar país o tipo de documento (no en cada tecleo).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo país/tipo
  }, [countryCode, managerDocType]);

  async function onSubmit(data: CreateCompany) {
    if (user?.role != "SUPERADMIN")
      return toast.error("No tienes permisos para realizar esta acción");

    setLoading(true);

    let res;

    if (initialValues) {
      return toast.error(
        "No puede actualizar los datos de una empresa ya creada"
      );
    } else {
      const isChile = data.countryCode === "CL";
      const managerUsesRut = data.manager.docType === "RUT" || data.manager.docType === "CI";
      
      const ind = isChile ? "56" : "57";
      const phoneDigits = (data.phone || "").replace(/\D/g, "");
      const formattedFullPhone = phoneDigits
        ? `+${ind} ${formatPhoneDisplay(phoneDigits, ind)}`
        : "";

      const payload = {
        ...data,
        phone: formattedFullPhone,
        nit: isChile ? normalizeRut(data.nit) : data.nit,
        manager: {
          ...data.manager,
          docNumber: managerUsesRut ? normalizeRut(data.manager.docNumber) : data.manager.docNumber,
        }
      };

      res = await createCompany(payload);
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(initialValues ? "Empresa actualizada" : "Empresa creada");

    router.push("/superadmin/empresas");
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
            {initialValues ? "Actualizar área" : "Crear nueva área"}
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              {initialValues ? "Guardar cambios" : "Crear área"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-4 flex flex-col items-stretch gap-5">
        <CustomInput
          label="Nombre de la empresa"
          {...register("name")}
          error={errors.name}
        />

        <CustomSelect
          label="País"
          options={COMPANY_COUNTRY_CODE_OPTIONS}
          value={countryCode}
          onChange={(value) => {
            setValue("countryCode", value, { shouldValidate: true });
            const defaultDoc = getAdminDocTypeOptionsByCountry(value).defaultValue;
            setValue("manager.docType", defaultDoc, { shouldValidate: true });
            void trigger(["nit", "manager.docNumber"]);
          }}
        />
        {errors.countryCode && (
          <p className="text-xs text-red-600 -mt-3">{errors.countryCode.message}</p>
        )}

        <div className="flex flex-col gap-1">
          <CustomInput
            label={juridicaDocLabel}
            {...register("nit", {
              onChange: (e) => {
                const next = isChile
                  ? formatRutDisplay(e.target.value)
                  : e.target.value;
                setValue("nit", next, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
                void trigger("nit");
              }
            })}
            value={nitValue}
            placeholder={isChile ? "Ej. 76.123.456-7" : "Ej. 900123456-7"}
            autoComplete="off"
            spellCheck={false}
            error={errors.nit}
          />
          {isChile && !errors.nit && (
            <p className="pl-2 text-xs text-stone-400">
              Formato chileno: números + guion + dígito verificador (0-9 o K).
              Ejemplo válido: 12.345.678-5
            </p>
          )}
        </div>

        {/*//? Manager Section */}
        <div className="flex flex-col border border-stone-200 p-4 rounded-lg gap-4">
          <p className="text-sm text-stone-500 font-medium">Administrador</p>
          <CustomInput
            placeholder="Nombre del administrador"
            {...register("manager.name")}
            error={errors.manager?.name}
          />

          <div className="flex flex-col gap-1">
            <div className="flex gap-5">
              <CustomSelect
                className="w-fit flex-none"
                options={managerDocTypeOptions}
                value={managerDocType}
                onChange={(value) => {
                  setValue("manager.docType", value, { shouldValidate: true, shouldDirty: true });
                  void trigger("manager.docNumber");
                }}
              />
              <CustomInput
                {...register("manager.docNumber", {
                  onChange: (e) => {
                    const isRutMode = isChile || managerUsesRut;
                    const next = isRutMode
                      ? formatRutDisplay(e.target.value)
                      : e.target.value;
                    setValue("manager.docNumber", next, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    void trigger("manager.docNumber");
                  }
                })}
                placeholder={
                  isChile || managerUsesRut ? "Ej. 12.345.678-5" : "Número de documento"
                }
                value={managerDocNumber}
                autoComplete="off"
                spellCheck={false}
                error={errors.manager?.docNumber}
              />
            </div>
            {(isChile || managerUsesRut) && !errors.manager?.docNumber && (
              <p className="pl-2 text-xs text-stone-400">
                RUT/CI: cuerpo numérico + guion + dígito verificador (módulo 11).
                La letra K es válida cuando el cálculo da 10.
              </p>
            )}
          </div>
        </div>

        <CustomInput
          label="Correo"
          {...register("email")}
          error={errors.email}
        />


        <div className="flex flex-col gap-1">
          <label
            htmlFor="phoneField"
            className="font-medium w-full pl-2 text-stone-500 text-sm"
          >
            Teléfono
          </label>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-none px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 font-medium h-[42px] flex items-center justify-center">
              +{isChile ? "56" : "57"}
            </div>
            <CustomInput
              {...register("phone", {
                onChange: (e) => {
                  const ind = isChile ? "56" : "57";
                  const formatted = formatPhoneDisplay(e.target.value, ind);
                  setValue("phone", formatted, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  });
                }
              })}
              placeholder={isChile ? "Ej. 9 1234 5678" : "Ej. 311 222 3333"}
              error={errors.phone}
            />
          </div>
        </div>

        {/*//? Cuenta de administrador de la empresa */}
        <div className="flex flex-col border border-stone-200 p-4 rounded-lg gap-4">
          <div>
            <p className="text-sm text-stone-500 font-medium">
              Cuenta de administrador de la empresa
            </p>
            <p className="text-xs text-stone-400">
              Se crea junto con la empresa, pendiente de activar. El
              administrador activa su cuenta desde /login usando el correo
              de arriba — ahí define su propia contraseña, tú no la
              defines aquí.
            </p>
          </div>
          <div className="flex gap-5">
            <CustomInput
              label="Nombre del administrador"
              placeholder="Ej. Jhon"
              {...register("adminName")}
              error={errors.adminName}
            />
            <CustomInput
              label="Apellido del administrador"
              placeholder="Ej. Doe"
              {...register("adminLastName")}
              error={errors.adminLastName}
            />
          </div>
        </div>

        {plansOptions ? (
          <CustomSelect<string>
            label="Plan asignado"
            options={plansOptions}
            value={watch("planId")}
            onChange={(value) => setValue("planId", value)}
          />
        ) : (
          <p>Cargando planes...</p>
        )}
      </div>

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear empresa"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyForm;
