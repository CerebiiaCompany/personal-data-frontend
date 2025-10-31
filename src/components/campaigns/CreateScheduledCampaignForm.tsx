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
import { useRouter } from "next/navigation";
import { createScheduledCampaignValidationSchema } from "@/validations/main.validations";
import {
  CampaignAudienceGender,
  CampaignDeliveryChannel,
  CampaignGoal,
} from "@/types/campaign.types";
import { createCampaign } from "@/lib/campaign.api";
import { CustomRadioGroup } from "../forms/CustomRadioGroup";
import { useCollectForms } from "@/hooks/useCollectForms";
import { useCampaignAudience } from "@/hooks/useCampaignAudience";
import { useAppSetting } from "@/hooks/useAppSetting";

const CreateScheduledCampaignForm = () => {
  const user = useSessionStore((store) => store.user);
  const pricePerSMS = useAppSetting("SMS_PRICE_PER_MESSAGE");

  const [loading, setLoading] = useState<boolean>(false);

  // Función para obtener fecha y hora actual en formato datetime-local
  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    control: formControl,
  } = useForm({
    resolver: zodResolver(createScheduledCampaignValidationSchema),
    defaultValues: {
      active: false,
      sourceFormIds: [],
      audience: {
        gender: "ALL",
        minAge: 0,
        maxAge: 100,
      },
      scheduling: {
        scheduledDateTime: getCurrentDateTimeLocal(),
      },
      deliveryChannel: "SMS", // Por defecto SMS ya que EMAIL está deshabilitado
    },
  });

  const router = useRouter();
  
  // Obtener valores de edad con valores por defecto, evitando comparaciones inválidas
  const minAgeValue = watch("audience.minAge");
  const maxAgeValue = watch("audience.maxAge");
  const parsedMinAge = Number(minAgeValue);
  const parsedMaxAge = Number(maxAgeValue);
  const minAge = Number.isFinite(parsedMinAge) ? parsedMinAge : 0;
  const maxAge = Number.isFinite(parsedMaxAge) ? parsedMaxAge : 100;

  const sourceFormsValue = watch("sourceFormIds").join(",");
  const genderValue = watch("audience.gender") || "ALL";

  const campaignAudience = useCampaignAudience({
    companyId: user?.companyUserData?.companyId,
    sourceForms: sourceFormsValue,
    gender: genderValue,
    minAge: minAge,
    maxAge: maxAge,
  });

  // Debug: imprimir valores cuando cambien
  useEffect(() => {
    console.log("🔍 Parámetros de audiencia:", {
      companyId: user?.companyUserData?.companyId,
      sourceForms: sourceFormsValue,
      gender: genderValue,
      minAge: minAge,
      maxAge: maxAge,
      audienceCount: campaignAudience.data?.count,
    });
  }, [sourceFormsValue, genderValue, minAge, maxAge, campaignAudience.data]);

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

  async function onSubmit(data: any) {
    if (!user?.companyUserData?.companyId) return;

    setLoading(true);

    // Convertir fecha y hora a ISO string
    const scheduledDateTime = new Date(data.scheduling.scheduledDateTime).toISOString();

    const payload = {
      ...data,
      scheduling: {
        scheduledDateTime,
      },
    };

    // Imprimir en consola lo que se va a enviar al servidor
    console.log("📤 Datos que se van a enviar al servidor:", payload);
    console.log("📤 Endpoint:", `/companies/${user?.companyUserData?.companyId}/campaigns`);

    const res = await createCampaign(user?.companyUserData?.companyId, payload);

    setLoading(false);

    if (res.error) {
      return toast.error(parseApiError(res.error));
    }

    toast.success("Campaña programada creada");
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
  }, [campaignAudience.data, setValue]);

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
            Crear nueva campaña programada
          </h4>

          <div className="flex justify-end gap-4 items-center">
            <Button className="w-fit" type="submit" loading={loading}>
              Crear campaña programada
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
                  desc: "¡Fomenta la participación!",
                  icon: "tabler:message-share",
                },
                {
                  value: "POTENTIAL_CUSTOMERS",
                  title: "Clientes potenciales",
                  desc: "¡Capta nuevos prospectos!",
                  icon: "tabler:user-share",
                },
                {
                  value: "SALES",
                  title: "Ventas",
                  desc: "¡Multiplica tus conversiones!",
                  icon: "tabler:basket-bolt",
                },
                {
                  value: "PROMOTION",
                  title: "Promoción",
                  desc: "¡Anuncia y lanza al éxito!",
                  icon: "tabler:speakerphone",
                },
                {
                  value: "OTHER",
                  title: "Otro",
                  desc: "¡Define tu objetivo único!",
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

      {/* Scheduling - Fecha y hora específica */}
      <div className="rounded-xl border border-disabled p-10 py-6 flex flex-col items-stretch gap-6">
        <h6 className="text-primary-900 font-normal text-lg">Programación</h6>

        <CustomInput
          type="datetime-local"
          label="Fecha y hora de envío"
          {...register("scheduling.scheduledDateTime")}
          error={errors.scheduling?.scheduledDateTime as FieldError}
          min={(() => {
            // Calcular la fecha mínima (2 minutos en el futuro)
            const now = new Date();
            const minDateTime = new Date(now.getTime() + 2 * 60 * 1000);
            // Formato para datetime-local: YYYY-MM-DDTHH:mm
            const year = minDateTime.getFullYear();
            const month = String(minDateTime.getMonth() + 1).padStart(2, "0");
            const day = String(minDateTime.getDate()).padStart(2, "0");
            const hours = String(minDateTime.getHours()).padStart(2, "0");
            const minutes = String(minDateTime.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}`;
          })()}
        />
        <span className="text-sm text-stone-500 flex items-center gap-2">
          <Icon icon={"tabler:info-circle"} className="text-base" />
          La campaña debe programarse al menos 2 minutos en el futuro
        </span>
      </div>

      {/* DeliveryChannel - Solo SMS (EMAIL deshabilitado) */}
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
                  value: "SMS",
                  title: "SMS",
                  icon: "tabler:device-mobile-message",
                },
                {
                  value: "EMAIL",
                  title: "Correo",
                  icon: "tabler:mail",
                  disabled: true, // Deshabilitado
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

      {/* Source Form Ids */}
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

      {/* Audience */}
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

      <div className="p-4">
        <Button type="submit" className="w-full" loading={loading}>
          Crear campaña programada
        </Button>
      </div>
    </form>
  );
};

export default CreateScheduledCampaignForm;

