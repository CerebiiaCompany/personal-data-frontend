import React, { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { FieldError, useForm } from "react-hook-form";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import { useCompanyUsers } from "@/hooks/useCompanyUsers";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { CreateCompany } from "@/types/company.types";
import {
  createCompanyPaymentValidationSchema,
  createCompanyValidationSchema,
} from "@/validations/superadmin.validations";
import { usePlans } from "@/hooks/usePlans";
import { createCompany } from "@/lib/company.api";
import { CustomSelectOption } from "@/types/forms.types";
import { CreateCompanyPayment } from "@/types/payment.types";
import { createCompanyPayment } from "@/lib/payment.api";
import { useCompanies } from "@/hooks/superadmin/useCompanies";
import CustomDateInput from "@/components/forms/CustomDateInput";
import { planPeriodTypeOptions } from "@/types/plan.types";
import { CreateUser, docTypesOptions } from "@/types/user.types";
import { createCompanyUser } from "@/lib/user.api";
import { createUserValidationSchema } from "@/validations/main.validations";
import CustomTextarea from "@/components/forms/CustomTextarea";

interface Props {
  initialValues?: CreateUser;
}

const CreateAdminForm = ({ initialValues }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);
  const companies = useCompanies({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createUserValidationSchema),
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
  const [companyId, setCompanyId] = useState<string>("");
  const plans = usePlans({});
  const [plansOptions, setPlansOptions] = useState<
    CustomSelectOption<string>[] | null
  >(null);

  const [companiesOptions, setCompaniesOptions] = useState<
    CustomSelectOption<string>[] | null
  >(null);

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
    if (companies.data && !companiesOptions) {
      setCompaniesOptions(
        companies.data.map((company) => ({
          title: company.name,
          value: company._id,
        }))
      );
    }
  }, [companies.data]);

  console.log(errors);

  async function onSubmit(data: CreateUser) {
    if (user?.role != "SUPERADMIN")
      return toast.error("No tienes permisos para realizar esta acción");

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      /* res = await updateCompanyArea(
        user?.companyUserData?.companyId,
        params.areaId as string,
        data
      ); */

      return toast.error(
        "No puede actualizar los datos de un administrador ya creado"
      );
    } else {
      //? handle creating
      res = await createCompanyUser(companyId, {
        ...data,
        role: "COMPANY_ADMIN",
      });
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(
      initialValues ? "Administrador actualizado" : "Administrador creado"
    );

    router.push("/superadmin/administradores");
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
        {companiesOptions ? (
          <CustomSelect<string>
            label="Empresa"
            options={companiesOptions}
            value={companyId}
            unselectedText="Selecciona la empresa"
            onChange={(value) => setCompanyId(value)}
          />
        ) : (
          <p>Cargando empresas...</p>
        )}
      </div>

      <div role="separator" className="h-[1px] w-full bg-disabled" />
      <p className="font-medium text-sm text-stone-500">
        Datos del usuario administrador
      </p>
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

        {/* {areas.data && (
          <CustomSelect
            onChange={(value) =>
              setValue("companyUserData.companyAreaId", value)
            }
            options={areas.data.map((area) => ({
              value: area._id,
              title: area.name,
            }))}
            label="Asignar Área"
            unselectedText="Seleccionar área"
            value={watch("companyUserData.companyAreaId")}
          />
        )} */}

        <CustomTextarea
          {...register("companyUserData.note")}
          rows={3}
          placeholder="Añadir nota..."
          className="resize-y"
          error={errors.companyUserData?.note}
        />

        {/* LOGIN DATA */}
        <div role="separator" className="w-full h-[1px] bg-disabled"></div>

        <div className="p-4 flex flex-col items-stretch gap-5">
          <div className="flex gap-5">
            <CustomInput
              label="Usuario"
              {...register("username")}
              placeholder="j_doe1"
              error={errors.username}
            />
            <CustomInput
              label="Clave"
              {...register("password" as any)}
              error={(errors as any).password}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear administrador"}
        </Button>
      </div>
    </form>
  );
};

export default CreateAdminForm;
