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
import { createCollectFormValidationSchema } from "@/validations/main.validations";
import { showDialog } from "@/utils/dialogs.utils";
import { usePolicyTemplates } from "@/hooks/usePolicyTemplates";
import LoadingCover from "../layout/LoadingCover";

interface Props {
  initialValues?: CreateCollectForm;
}

const CreateCollectFormForm = ({ initialValues }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createCollectFormValidationSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
      policyTemplateId: "",
      marketingChannels: {
        SMS: true,
        EMAIL: false,
        WHATSAPP: false,
      },
      questions: [],
    },
  });

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);
  const user = useSessionStore((store) => store.user);
  const policyTemplates = usePolicyTemplates({
    companyId: user?.companyUserData?.companyId,
  });

  useEffect(() => {
    const scrollContainer = document.getElementById("scrollContainer");
    if (!scrollContainer || !formRef.current) return;
    const firstFormContainer = formRef.current!.querySelector(
      "&>header"
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

  async function onSubmit(data: CreateCollectForm) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    let res;

    /*     const normalizedData = {
      ...data,
      questions: data.questions.map((question, i) => ({
        ...question,
        order: i + 1,
      })),
    }; */

    if (initialValues) {
      //? handle updating
      res = await updateCollectForm(
        user?.companyUserData?.companyId,
        params.formId as string,
        data
      );
    } else {
      //? handle creating
      res = await createCollectForm(user?.companyUserData?.companyId, data);
    }
    setLoading(false);

    console.log(data);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(
      initialValues ? "Formulario actualizado" : "Formulario creado"
    );

    router.push("/admin/recoleccion");
  }

  function deleteQuestion(index: number) {
    const newQuestions = [...watch("questions")];

    newQuestions.splice(index, 1);

    setValue("questions", newQuestions);
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit((data) => onSubmit(data))}
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
            {initialValues ? "Actualizar formulario" : "Crear formulario nuevo"}
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              {initialValues
                ? "Guardar cambios"
                : "Crear y publicar formulario"}
            </Button>
            <Button isIconOnly>
              <Icon icon={"gg:link"} className="text-2xl" />
            </Button>
          </div>
        </div>
      </nav>

      <header className="flex justify-end gap-4">
        <Button onClick={() => router.back()} hierarchy="tertiary" isIconOnly>
          <Icon icon={"tabler:arrow-narrow-left"} className="text-2xl" />
        </Button>
        <Button className="w-fit" type="submit" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear y publicar formulario"}
        </Button>
        <Button className="w-fit" isIconOnly>
          <Icon icon={"gg:link"} className="text-2xl" />
        </Button>
      </header>

      <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
        <CustomInput
          {...register("name")}
          placeholder="Formulario sin título"
          variant="underline"
          error={errors.name}
        />
        <CustomTextarea
          {...register("description")}
          rows={5}
          label="Descripción del formulario"
          placeholder="Ej. Recolección de datos de usuarios segmentados"
          className="resize-y"
          error={errors.description}
        />
      </div>

      <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
        <p className="text-lg font-semibold">Ruta de envío</p>
        <CustomCheckbox label="SMS" {...register("marketingChannels.SMS")} />
        <CustomCheckbox
          label="Email"
          {...register("marketingChannels.EMAIL")}
          disabled
        />{" "}
        <CustomCheckbox
          label="WhatsApp"
          {...register("marketingChannels.WHATSAPP")}
          disabled
        />
      </div>

      <div className="flex items-center gap-4 relative">
        {policyTemplates.loading && (
          <div className="relative h-16 w-full">
            <LoadingCover size="sm" />
          </div>
        )}
        {policyTemplates.data && (
          <>
            <Button
              onClick={() => showDialog(HTML_IDS_DATA.selectTemplateDialog)}
              className="max-w-xs"
              hierarchy="secondary"
            >
              Seleccionar plantilla
            </Button>

            <div className="flex items-center gap-2">
              <p className="font-medium text-stone-500">
                Seleccionada:{" "}
                <b>
                  {policyTemplates.data.find(
                    (policy) => policy._id === watch("policyTemplateId")
                  )?.name || "Sin seleccionar"}
                </b>
              </p>
              {watch("policyTemplateId") && (
                <button
                  onClick={(_) => setValue("policyTemplateId", "")}
                  className="p-1 rounded-md transition-colors text-stone-500 hover:bg-stone-100"
                >
                  <Icon icon={"tabler:x"} className="text-lg" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {errors.policyTemplateId && (
        <span className="text-red-400 text-sm font-semibold">
          {errors.policyTemplateId.message}
        </span>
      )}

      {/* Select  */}
      {policyTemplates.data && (
        <SelectTemplateDialog
          items={policyTemplates.data}
          value={watch("policyTemplateId")}
          onSelect={(id) =>
            setValue("policyTemplateId", id, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        />
      )}

      {/* Add question button */}
      <div className="flex justify-between mt-6">
        <h6 className="font-semibold text-primary-900 text-xl">
          Preguntas personalizadas
        </h6>
        <Button
          hierarchy="secondary"
          className="max-w-xs w-full"
          startContent={<Icon icon={"tabler:plus"} className="text-lg" />}
          onClick={() => {
            const questions = watch("questions");
            setValue("questions", [
              ...questions,
              {
                title: "",
                answerType: "TEXT",
                dataType: "PERSONAL",
                order: questions.length + 1,
              },
            ]);
          }}
        >
          Añadir pregunta
        </Button>
      </div>

      {/* Questions list */}
      {watch("questions").length ? (
        watch("questions").map((_, index) => (
          <div
            className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5 relative group"
            key={index}
          >
            <div className="absolute top-2 right-2 group-hover:opacity-100 opacity-0 -translate-y-5 group-hover:translate-0 transition-all">
              <Button
                onClick={() => deleteQuestion(index)}
                isIconOnly
                hierarchy="tertiary"
                className="bg-red-400/10! text-red-400"
              >
                <Icon icon={"tabler:trash"} className="text-2xl" />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <CustomInput
                variant="underline"
                placeholder="Título de la pregunta"
                {...register(`questions.${index}.title`)}
                error={errors.questions && errors.questions[index]?.title}
              />
              <div className="flex justify-between gap-3">
                <CustomSelect<AnswerType>
                  value={watch("questions")[index].answerType}
                  unselectedText="Tipo de respuesta"
                  onChange={(value) =>
                    setValue(`questions.${index}.answerType`, value)
                  }
                  options={[
                    {
                      value: "TEXT",
                      title: "Repuesta escrita",
                      icon: "material-symbols:short-text-rounded",
                    },
                    {
                      value: "DATE",
                      title: "Fecha",
                      icon: "fluent:calendar-16-regular",
                    },
                  ]}
                />

                <CustomSelect<DataType>
                  value={watch("questions")[index].dataType}
                  onChange={(value) =>
                    setValue(`questions.${index}.dataType`, value)
                  }
                  unselectedText="Tipo de dato"
                  options={[
                    {
                      value: "PERSONAL",
                      title: "Personal",
                      icon: "tabler:user",
                    },
                    {
                      value: "MEDICAL",
                      title: "Médico",
                      icon: "tabler:first-aid-kit",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-stone-500">No has añadido ninguna pregunta</p>
      )}

      {errors.questions && (
        <span className="text-red-400 text-sm font-semibold">
          {errors.questions.message}
        </span>
      )}
    </form>
  );
};

export default CreateCollectFormForm;
