import React, { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { docTypesOptions } from "@/types/user.types";

import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomSelect from "@/components/forms/CustomSelect";
import { CreateCompany } from "@/types/company.types";
import { createCompanyValidationSchema } from "@/validations/superadmin.validations";
import { usePlans } from "@/hooks/usePlans";
import { createCompany } from "@/lib/company.api";
import { CustomSelectOption } from "@/types/forms.types";

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
  } = useForm({
    resolver: zodResolver(createCompanyValidationSchema),
    defaultValues: initialValues || {
      manager: {
        docType: "CC",
      },
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

  async function onSubmit(data: CreateCompany) {
    if (user?.role != "SUPERADMIN")
      return toast.error("No tienes permisos para realizar esta acción");

    console.log(data);

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
        "No puede actualizar los datos de una empresa ya creada"
      );
    } else {
      //? handle creating
      res = await createCompany(data);
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
        <CustomInput label="NIT" {...register("nit")} error={errors.nit} />

        {/*//? Manager Section */}
        <div className="flex flex-col border border-stone-200 p-4 rounded-lg gap-4">
          <p className="text-sm text-stone-500 font-medium">Administrador</p>
          <CustomInput
            placeholder="Nombre del administrador"
            {...register("manager.name")}
            error={errors.manager?.name}
          />

          <div className="flex gap-5">
            <CustomSelect
              className="w-fit flex-none"
              options={docTypesOptions}
              value={watch("manager.docType")}
              onChange={(value) => setValue("manager.docType", value)}
            />
            <CustomInput
              placeholder="Número de documento"
              {...register("manager.docNumber")}
              error={errors.manager?.docNumber}
            />
          </div>
        </div>

        <CustomInput
          label="Correo"
          {...register("email")}
          error={errors.email}
        />

        <CustomInput
          label="Teléfono"
          {...register("phone")}
          error={errors.phone}
        />

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
