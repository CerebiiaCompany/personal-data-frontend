import React, { useEffect, useRef, useState } from "react";
import Button from "../base/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import clsx from "clsx";
import { Controller, FieldError, useForm } from "react-hook-form";
import CustomInput from "../forms/CustomInput";
import CustomSelect from "../forms/CustomSelect";
import CustomTextarea from "../forms/CustomTextarea";
import { useSessionStore } from "@/store/useSessionStore";
import { parseApiError } from "@/utils/parseApiError";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { createCampaignValidationSchema } from "@/validations/main.validations";
import { docTypesOptions } from "@/types/user.types";
import { useCompanyAreas } from "@/hooks/useCompanyAreas";
import {
  CampaignAudienceGender,
  CampaignDeliveryChannel,
  CampaignGoal,
  CreateCampaign,
} from "@/types/campaign.types";
import { createCampaign, updateCampaign } from "@/lib/campaign.api";
import CustomDateInput from "../forms/CustomDateInput";
import { CustomRadioGroup } from "../forms/CustomRadioGroup";
import { useCollectForms } from "@/hooks/useCollectForms";
import {
  formatDateToString,
  parseUtcDateAsLocalCalendarDate,
  utcToLocalDate,
} from "@/utils/date.utils";
import { useCampaignAudience } from "@/hooks/useCampaignAudience";
import { useAppSetting } from "@/hooks/useAppSetting";

interface Props {
  initialValues?: CreateCampaign;
}

const CreateCampaignForm = ({ initialValues }: Props) => {
  const user = useSessionStore((store) => store.user);
  const pricePerSMS = useAppSetting("SMS_PRICE_PER_MESSAGE");

  const [loading, setLoading] = useState<boolean>(false);
  const params = useParams();
  const parsedInitialValues: CreateCampaign | undefined = initialValues
    ? {
        ...initialValues,
        scheduling: {
          ...initialValues?.scheduling,
          startDate: formatDateToString({
            date: initialValues.scheduling.startDate,
            format: "YYYY-MM-DD",
          }),
          endDate: formatDateToString({
            date: initialValues.scheduling.endDate,
            format: "YYYY-MM-DD",
          }),
        },
      }
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    control: formControl,
  } = useForm({
    resolver: zodResolver(createCampaignValidationSchema),
    defaultValues: parsedInitialValues || {
      active: false,
      sourceFormIds: [],
      audience: {
        gender: "ALL",
      },
      scheduling: {
        ocurrences: 5,
        startDate: utcToLocalDate(new Date().toUTCString())
          .toISOString()
          .split("T")[0],
      },
    },
  });

  const router = useRouter();
  const campaignAudience = useCampaignAudience({
    companyId: user?.companyUserData?.companyId,
    sourceForms: watch("sourceFormIds").join(","),
    gender: watch("audience.gender"),
    minAge: Number(watch("audience.minAge")),
    maxAge: Number(watch("audience.maxAge")),
  });

  const formRef = useRef<HTMLFormElement>(null);
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);
  const collectForms = useCollectForms({
    companyId: user?.companyUserData?.companyId,
  });

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

  async function onSubmit(data: CreateCampaign) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    let res;

    if (initialValues) {
      //? handle updating
      res = await updateCampaign(
        user?.companyUserData?.companyId,
        params.campaignId as string,
        {
          ...data,
          active: undefined,
          scheduling: {
            ...data.scheduling,
            startDate: new Date(data.scheduling.startDate).toISOString(),
            endDate: new Date(data.scheduling.endDate).toISOString(),
          },
        }
      );
    } else {
      //? handle creating
      res = await createCampaign(user?.companyUserData?.companyId, {
        ...data,
        scheduling: {
          ...data.scheduling,
          startDate: new Date(data.scheduling.startDate).toISOString(),
          endDate: new Date(data.scheduling.endDate).toISOString(),
        },
      });
    }
    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success(initialValues ? "Campaña actualizada" : "Campaña creada");

    router.push("/admin/campanas");
  }

  function deleteSourceFormId(id: string) {
    const newSourceFormIds = watch("sourceFormIds");
    const startIndex = newSourceFormIds.findIndex((e) => e === id);

    newSourceFormIds.splice(startIndex, 1);

    setValue("sourceFormIds", newSourceFormIds);
  }

  useEffect(() => {
    if (campaignAudience.data) {
      setValue("audience.count", campaignAudience.data.count);
    } else {
      setValue("audience.count", 0);
    }
  }, [campaignAudience.data]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="flex flex-col gap-3 items-stretch w-full"
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
            {initialValues ? "Actualizar campaña" : "Crear nueva campaña"}
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              {initialValues ? "Guardar cambios" : "Crear campaña "}
            </Button>
          </div>
        </div>
      </nav>
      {/* Name */}
      <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-1.5">
        <h6 className="text-primary-900 font-normal text-lg">
          Nombre de la campaña
        </h6>
        <CustomInput
          {...register("name")}
          placeholder="Ej. Campaña #1"
          error={errors.name}
        />
      </div>

      {/* Goal */}
      <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-4">
        <h6 className="text-primary-900 font-normal text-lg">
          Objetivo de la campaña
        </h6>

        <Controller
          name="goal"
          control={formControl}
          render={({ field }) => (
            <CustomRadioGroup<CampaignGoal>
              options={[
                {
                  value: "INTERACTION",
                  title: "Interacción",
                  desc: "¡Fomenta la participación!", // Antes: "Boost engagement"
                  icon: "tabler:message-share",
                },
                {
                  value: "POTENTIAL_CUSTOMERS",
                  title: "Clientes potenciales",
                  desc: "¡Capta nuevos prospectos!", // Antes: "Capture prospects"
                  icon: "tabler:user-share",
                },
                {
                  value: "SALES",
                  title: "Ventas",
                  desc: "¡Multiplica tus conversiones!", // Antes: "Drive conversions"
                  icon: "tabler:basket-bolt",
                },
                {
                  value: "PROMOTION",
                  title: "Promoción",
                  desc: "¡Anuncia y lanza al éxito!", // Antes: "Announce or launch"
                  icon: "tabler:speakerphone",
                },
                {
                  value: "OTHER",
                  title: "Otro",
                  desc: "¡Define tu objetivo único!", // Antes: "Custom objective"
                  icon: "icon-park-outline:other",
                },
              ]}
              value={field.value as any}
              onChange={field.onChange}
              name={field.name}
              error={errors.goal}
            />
          )}
        />
      </div>

      {/* Scheduling */}
      {!initialValues?.active && (
        <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
          <h6 className="text-primary-900 font-normal text-lg">Programación</h6>

          <CustomDateInput
            label="Fecha de inicio"
            {...register("scheduling.startDate")}
            error={errors.scheduling?.startDate as FieldError}
          />
          <CustomDateInput
            label="Fecha de finalización"
            {...register("scheduling.endDate")}
            error={errors.scheduling?.endDate as FieldError}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <CustomSelect
                className="flex-none w-24"
                options={[
                  {
                    title: "5",
                    value: "5",
                  },
                  {
                    title: "10",
                    value: "10",
                  },
                  {
                    title: "15",
                    value: "15",
                  },
                ]}
                value={String(watch("scheduling.ocurrences"))}
                onChange={(value) =>
                  setValue("scheduling.ocurrences", Number(value))
                }
              />
              <span className="flex items-start flex-col">
                <p className="text-lg text-primary-900">
                  Número de envíos programado
                </p>
                <p className="text-sm text-stone-500">
                  Definir cantidad de envíos en la programación registrada
                </p>
              </span>
            </div>
            <span className="text-sm w-fit flex gap-1 items-center py-1 px-2 bg-primary-500/10 rounded-lg text-primary-500">
              <Icon icon={"tabler:info-circle"} className="text-lg" />
              El número de envíos se verá reflejado en los créditos activos.
            </span>
          </div>
        </div>
      )}

      {/* DeliveryChannel */}
      {!initialValues && ( //Can't modify the campaign delivery channel
        <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
          <h6 className="text-primary-900 font-normal text-lg">
            Ruta de envío
          </h6>

          <Controller
            name="deliveryChannel"
            control={formControl}
            render={({ field }) => (
              <CustomRadioGroup<CampaignDeliveryChannel>
                options={[
                  {
                    value: "EMAIL",
                    title: "Correo",
                    icon: "tabler:mail",
                  },
                  {
                    value: "SMS",
                    title: "SMS",
                    icon: "tabler:device-mobile-message",
                  },
                ]}
                value={field.value as any}
                onChange={field.onChange}
                name={field.name}
                error={errors.deliveryChannel}
              />
            )}
          />
        </div>
      )}

      {/* Source Form Ids */}
      {!initialValues && (
        <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
          <h6 className="text-primary-900 font-normal text-lg">
            Selección de datos
          </h6>

          {collectForms.data && (
            <>
              <CustomSelect
                unselectedText="Seleccione los formularios para enviar la campaña"
                options={collectForms.data
                  .filter((form) => !watch("sourceFormIds").includes(form._id))
                  .map((form) => ({
                    title: form.name,
                    value: form._id,
                  }))}
                onChange={(value) => {
                  setValue("sourceFormIds", [...watch("sourceFormIds"), value]);
                  setError("sourceFormIds", { message: "" });
                }}
              />
              <div className="w-fill grid grid-cols-[repeat(auto-fit,_minmax(120px,_30%))] gap-x-6 gap-y-4 justify-start">
                {watch("sourceFormIds").map((formId) => {
                  const formData = collectForms.data?.find(
                    (form) => form._id === formId
                  );

                  return (
                    formData && (
                      <div
                        key={formId}
                        className="flex flex-1 p-1.5 rounded-md gap-2 items-center justify-start text-primary-900 bg-primary-50"
                      >
                        <button
                          onClick={(_) => deleteSourceFormId(formId)}
                          className="p-1 hover:bg-primary-900/10 rounded-md transition-colors"
                        >
                          <Icon icon={"tabler:x"} className="text-lg" />
                        </button>
                        <p className="font-normal text-ellipsis">
                          {formData.name}
                        </p>
                      </div>
                    )
                  );
                })}
              </div>
            </>
          )}

          {errors.sourceFormIds && (
            <span className="text-red-400 text-sm font-semibold">
              {errors.sourceFormIds.message}
            </span>
          )}

          <span className="text-sm w-fit flex gap-1 items-center py-1 px-2 bg-primary-500/10 rounded-lg text-primary-500">
            <Icon icon={"tabler:info-circle"} className="text-lg" />
            La selección de cada formulario tiene un costo de 20 créditos.
          </span>
        </div>
      )}

      {/* Audience */}
      {!initialValues && (
        <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
          <h6 className="text-primary-900 font-normal text-lg">Audiencia</h6>

          <Controller
            name="audience.gender"
            control={formControl}
            render={({ field }) => (
              <CustomRadioGroup<CampaignAudienceGender>
                label="Género"
                {...field}
                options={[
                  {
                    title: "Todos",
                    value: "ALL",
                    icon: "tabler:users-group",
                  },
                  {
                    title: "Hombres",
                    value: "MALE",
                    icon: "tabler:gender-male",
                  },
                  {
                    title: "Mujeres",
                    value: "FEMALE",
                    icon: "tabler:gender-female",
                  },
                ]}
                error={errors.audience?.gender}
              />
            )}
          />

          <div className="flex flex-col gap-1">
            <p className="font-medium w-full pl-2 text-stone-500 text-sm">
              Edad
            </p>
            <div className="flex gap-3 items-center">
              <CustomInput
                type="number"
                className="flex-none"
                {...register("audience.minAge")}
                error={errors.audience?.minAge as FieldError}
              />
              <p className="font-normal text-stone-500">Hasta</p>
              <CustomInput
                type="number"
                className="flex-none"
                {...register("audience.maxAge")}
                error={errors.audience?.maxAge as FieldError}
              />
              <p className="font-normal text-stone-500">
                Personas en este rango
              </p>
              <p className="bg-primary-50 px-5 py-2 rounded-lg">
                {watch("audience.count") ?? "--"}
              </p>
            </div>
          </div>

          {errors.audience?.count && (
            <span className="text-red-400 text-sm font-semibold">
              {errors.audience.count.message}
            </span>
          )}
        </div>
      )}

      {/* Credits */}
      <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch">
        <h6 className="text-primary-900 font-normal text-lg">
          Créditos de campaña
        </h6>
        <p className="text-sm font-normal text-stone-500">
          Creditos estimados en campaña en base a los formularios seleccionados
          y segmentación realizada.
        </p>
        <p className="font-bold text-xl text-primary-900 mt-3">
          {pricePerSMS.data && watch("audience.count")
            ? `${
                (pricePerSMS.data.value as number) * watch("audience.count")
              } Créditos`
            : "..."}
        </p>
        <span className="text-sm w-fit flex gap-1 items-start py-1 px-2 bg-primary-500/10 rounded-lg text-primary-500 mt-3 -ml-1">
          <Icon icon={"tabler:info-circle"} className="text-lg mt-0.5" />
          Este número puede diferir de la cantidad de créditos final de la
          campaña ya que solo consumes créditos si la campaña llega al
          destinatario.
        </span>
      </div>

      {/* Content */}
      {!initialValues && (
        <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
          <h6 className="text-primary-900 font-normal text-lg">
            Contenido del anuncio
          </h6>

          <CustomInput
            {...register("content.name")}
            placeholder="Nombre del anuncio"
            label="Nombre"
            error={errors.content?.name}
          />
          <CustomTextarea
            {...register("content.bodyText")}
            rows={4}
            label="Texto principal"
            placeholder="Texto principal de la campaña"
            className="resize-y"
            error={errors.content?.bodyText}
          />

          <CustomInput
            {...register("content.link")}
            placeholder="https://sitio.com"
            label="Añade link"
            error={errors.content?.link}
          />
        </div>
      )}

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          {initialValues ? "Guardar cambios" : "Crear campaña"}
        </Button>
      </div>
    </form>
  );
};

export default CreateCampaignForm;
