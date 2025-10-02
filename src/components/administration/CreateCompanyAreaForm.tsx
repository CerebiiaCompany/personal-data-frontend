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
  createUserValidationSchema,
  updateUserValidationSchema,
} from "@/validations/main.validations";
import { CreateUser, docTypesOptions, UpdateUser } from "@/types/user.types";
import { createCompanyUser, updateCompanyUser } from "@/lib/user.api";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import { countriesOptions, CreateCompanyArea } from "@/types/companyArea.types";
import { createCompanyArea, updateCompanyArea } from "@/lib/companyArea.api";
import { useCompanyUsers } from "@/hooks/useCompanyUsers";

interface Props {
  initialValues?: CreateCompanyArea;
}

const CreateCompanyAreaForm = ({ initialValues }: Props) => {
  const user = useSessionStore((store) => store.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>("");
  const params = useParams();
  const companyUsers = useCompanyUsers({
    companyId: user?.companyUserData?.companyId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createCompanyAreaValidationSchema),
    defaultValues: initialValues || {
      tags: [],
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

  async function onSubmit(data: CreateCompanyArea) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      res = await updateCompanyArea(
        user?.companyUserData?.companyId,
        params.areaId as string,
        data
      );
    } else {
      //? handle creating
      res = await createCompanyArea(user?.companyUserData?.companyId, data);
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(initialValues ? "Área actualizado" : "Área creado");

    router.push("/admin/administracion/areas");
  }

  function addTag() {
    if (!tagInput) return toast.error("Escribe una etiqueta");
    if (watch("tags").includes(tagInput))
      return toast.error("Esta etiqueta ya existe");

    setTagInput("");
    setValue("tags", [...watch("tags"), tagInput]);
  }

  function removeTag(index: number) {
    const newTags = [...watch("tags")];
    newTags.splice(index, 1);

    setValue("tags", newTags);
  }

  function addUser(id: string) {
    setValue("users", [...(watch("users") || []), id]);
  }

  function removeUser(id: string) {
    const newUsers = [...(watch("users") || [])];
    if (!newUsers.length) return;
    const startIndex = newUsers.findIndex((e) => e === id);

    newUsers.splice(startIndex, 1);

    setValue("users", newUsers);
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
          label="Nombre del Área"
          {...register("name")}
          placeholder="Local 001"
          error={errors.name}
        />
        <CustomSelect
          options={countriesOptions}
          value={watch("country")}
          onChange={(value) => setValue("country", value)}
        />
        <div className="flex gap-5">
          <CustomInput
            label="Departamento/Estado"
            {...register("state")}
            error={errors.state}
          />
          <CustomInput
            label="Ciudad"
            {...register("city")}
            error={errors.city}
          />
        </div>
        <CustomInput
          label="Dirección"
          {...register("address")}
          error={errors.address}
        />

        <div className="flex flex-col items-start gap-1.5">
          <p className="font-medium w-full pl-2 text-stone-500 text-sm">
            Añadir Etiquetas
          </p>
          <div className="flex gap-3 items-stretch w-full">
            <CustomInput
              placeholder="Equipo 1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />

            <Button
              className="h-[unset] items-center"
              type="button"
              onClick={addTag}
            >
              <Icon icon={"tabler:plus"} className="text-xl" />
            </Button>
          </div>
        </div>

        <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(120px,_30%))] gap-x-6 gap-y-4 justify-start">
          {(watch("tags") || []).map((tag, index) => (
            <div
              key={tag}
              className="flex flex-1 p-1.5 rounded-md gap-2 items-center justify-start text-primary-900 bg-primary-50"
            >
              <button
                onClick={(_) => removeTag(index)}
                className="p-1 hover:bg-primary-900/10 rounded-md transition-colors"
              >
                <Icon icon={"tabler:x"} className="text-lg" />
              </button>
              <p className="font-normal text-ellipsis">{tag}</p>
            </div>
          ))}
        </div>

        {!initialValues && companyUsers.data && (
          <>
            <CustomSelect
              label="Añadir Usuarios"
              options={companyUsers.data.map((user) => ({
                title: `${user.name} ${user.lastName} - ${user.companyUserData?.docType} ${user.companyUserData?.docNumber}`,
                value: user._id,
              }))}
              onChange={addUser}
            />
            <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(120px,_30%))] gap-x-6 gap-y-4 justify-start">
              {(watch("users") || []).map((userId) => {
                const userData = companyUsers.data?.find(
                  (e) => e._id === userId
                );

                return (
                  <div
                    key={userId}
                    className="flex flex-1 p-1.5 rounded-md gap-2 items-center justify-start text-primary-900 bg-primary-50"
                  >
                    <button
                      onClick={(_) => removeUser(userId)}
                      className="p-1 hover:bg-primary-900/10 rounded-md transition-colors"
                    >
                      <Icon icon={"tabler:x"} className="text-lg" />
                    </button>
                    <p className="font-normal text-ellipsis">
                      {userData?.name} {userData?.lastName} - $
                      {userData?.companyUserData?.docType}{" "}
                      {userData?.companyUserData?.docNumber}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCompanyAreaForm;
