import { CollectForm } from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Button from "../base/Button";
import CustomCheckbox from "../forms/CustomCheckbox";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { DocType, docTypesOptions } from "@/types/user.types";
import { CustomSelectOption } from "@/types/forms.types";
import CustomInput from "../forms/CustomInput";
import CustomSelect from "../forms/CustomSelect";
import { Icon } from "@iconify/react/dist/iconify.js";
import { generateOtpCode, validateOtpCode } from "@/lib/oneTimeCode.api";
import { getPolicyTemplateFileUrl } from "@/lib/policyTemplate.api";
import LoadingCover from "../layout/LoadingCover";
import { CampaignDeliveryChannel } from "@/types/campaign.types";
import { fetchCollectFormResponses, registerCollectFormResponse } from "@/lib/collectFormResponse.api";
import { fetchCompanies } from "@/lib/company.api";
import { Company } from "@/types/company.types";
import { CreateCollectFormResponse } from "@/types/collectFormResponse.types";

interface Props {
  data: CollectForm;
}

// Paso 1: Buscar usuario
const searchSchema = z.object({
  docType: z.string<DocType>(),
  docNumber: z.coerce.number().min(1, "Número de documento inválido"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

// Paso 2: Validar OTP y aceptar consentimiento
const consentSchema = z.object({
  otpCode: z
    .string()
    .min(1, "Debes ingresar el código de verificación")
    .min(4, "El código debe tener al menos 4 caracteres"),
  dataProcessing: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar la política para continuar",
  }),
});

type ConsentFormValues = z.infer<typeof consentSchema>;

const PublicConsentForm = ({ data }: Props) => {
  const [step, setStep] = useState<"search" | "consent" | "success">("search");
  const [userData, setUserData] = useState<any>(null);
  const [pendingOtpId, setPendingOtpId] = useState<string | null>(null);
  const [policyUrl, setPolicyUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpChannel, setOtpChannel] = useState<CampaignDeliveryChannel>("SMS");
  const [otpLastSentChannel, setOtpLastSentChannel] =
    useState<CampaignDeliveryChannel | null>(null);
  const [companyData, setCompanyData] = useState<Company | null>(null);

  // Formulario de búsqueda
  const {
    register: registerSearch,
    handleSubmit: handleSubmitSearch,
    formState: { errors: errorsSearch },
    setValue: setValueSearch,
    watch: watchSearch,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema) as any,
    defaultValues: {
      docType: "CC",
      docNumber: undefined as any,
    },
  });

  // Formulario de consentimiento
  const {
    register: registerConsent,
    handleSubmit: handleSubmitConsent,
    formState: { errors: errorsConsent },
    watch: watchConsent,
  } = useForm<ConsentFormValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      otpCode: "",
      dataProcessing: false,
    },
  });

  // Observar el estado del checkbox de aceptación
  const hasAcceptedPolicy = watchConsent("dataProcessing");

  // Cargar información de la empresa y URL de la política
  React.useEffect(() => {
    // Verificar si el formulario incluye información de la empresa
    const formData = data as any;
    if (formData.company?.name) {
      // Si el backend ya incluye el nombre de la empresa, usarlo directamente
      setCompanyData({ name: formData.company.name } as Company);
    }

    // Obtener URL de la política
    if (data.policyTemplateId && data.companyId) {
      getPolicyTemplateFileUrl(data.companyId, data.policyTemplateId).then((res) => {
        if (!res.error && res.data?.url) {
          setPolicyUrl(res.data.url);
        }
      });
    }
  }, [data.policyTemplateId, data.companyId]);

  async function onSearchSubmit(formData: SearchFormValues) {
    setIsSubmitting(true);

    try {
      console.log("Buscando usuario con:", formData);
      console.log("Company ID:", data.companyId);
      console.log("Form ID:", data._id);

      // Buscar usuario en las respuestas del formulario (sin filtro de pageSize para obtener todas)
      const res = await fetchCollectFormResponses({
        companyId: data.companyId,
        id: data._id,
        pageSize: 0, // 0 = todas las respuestas
      });

      console.log("Respuesta API:", res);

      if (res.error) {
        console.error("Error en API:", res.error);
        toast.error(parseApiError(res.error));
        setIsSubmitting(false);
        return;
      }

      const responses = res.data?.responses || [];
      console.log(`Total de respuestas encontradas: ${responses.length}`);
      console.log("Respuestas:", responses);

      // Buscar la respuesta que coincida exactamente con el documento
      const matchedResponse = responses.find(
        (r: any) => {
          console.log(`Comparando: ${r.user?.docType} === ${formData.docType} && ${r.user?.docNumber} === ${formData.docNumber}`);
          return (
            r.user?.docType === formData.docType &&
            r.user?.docNumber === formData.docNumber
          );
        }
      );

      console.log("Usuario encontrado:", matchedResponse);

      if (!matchedResponse) {
        toast.error(
          "No se encontró un registro con ese documento. Por favor verifica los datos."
        );
        setIsSubmitting(false);
        return;
      }

      // Verificar si ya tiene consentimiento activo
      if (
        matchedResponse.consent?.status === "ACTIVE" &&
        matchedResponse.verifiedWithOTP
      ) {
        toast.info("Ya has aceptado la política de tratamiento de datos");
        setStep("success");
        setIsSubmitting(false);
        return;
      }

      setUserData(matchedResponse);
      setStep("consent");
      toast.success("Usuario encontrado. Por favor acepta el consentimiento.");
    } catch (error) {
      toast.error("Error al buscar usuario");
      console.error("Error completo:", error);
    }

    setIsSubmitting(false);
  }

  async function handleSendOtp() {
    if (!userData) return;

    setIsSendingOtp(true);

    const recipient =
      otpChannel === "SMS" ? userData.user.phone : userData.user.email;

    console.log("Enviando OTP a:", recipient, "por canal:", otpChannel);

    if (!recipient) {
      toast.error(
        `No tienes ${otpChannel === "SMS" ? "teléfono" : "correo electrónico"} registrado`
      );
      setIsSendingOtp(false);
      return;
    }

    const res = await generateOtpCode({
      collectFormId: data._id,
      recipientData: {
        channel: otpChannel,
        address: recipient,
      },
    });

    console.log("Respuesta generateOtpCode:", res);
    console.log("Estructura completa de res.data:", JSON.stringify(res.data, null, 2));

    if (res.error) {
      console.error("Error al generar OTP:", res.error);
      toast.error(parseApiError(res.error));
      setIsSendingOtp(false);
      return;
    }

    // Intentar obtener el ID de diferentes formas según la estructura del backend
    const otpId = res.data?.otpCodeId || res.data?._id || res.data?.id;
    console.log("OTP ID recibido:", otpId);
    console.log("Tipo de otpId:", typeof otpId);
    
    if (otpId) {
      setPendingOtpId(otpId);
      setOtpLastSentChannel(otpChannel);
      toast.success(
        `Código OTP enviado a tu ${otpChannel === "SMS" ? "teléfono" : "correo electrónico"}`
      );
    } else {
      console.error("No se pudo obtener el OTP ID de la respuesta");
      toast.warning("El código fue enviado, pero hubo un problema con la respuesta. Puedes intentar ingresar el código de todas formas.");
      // Establecer un valor temporal para permitir continuar
      setPendingOtpId("temp-otp-id");
      setOtpLastSentChannel(otpChannel);
    }
    
    setIsSendingOtp(false);
  }

  async function onConsentSubmit(formData: ConsentFormValues) {
    // Validar que se haya solicitado el código OTP
    if (!pendingOtpId || !userData) {
      toast.error("Por favor, solicita el código de verificación primero");
      return;
    }

    // Validar que se haya ingresado el código
    if (!formData.otpCode || formData.otpCode.trim() === "") {
      toast.error("Por favor, ingresa el código de verificación que recibiste");
      return;
    }

    // Validar que se haya aceptado la política
    if (!formData.dataProcessing) {
      toast.error("Debes aceptar la política de tratamiento de datos personales");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("=== INICIANDO PROCESO DE CONSENTIMIENTO ===");
      console.log("1. Validando código OTP...");
      console.log("   - OTP ID:", pendingOtpId);
      console.log("   - Código ingresado:", formData.otpCode.trim());
      
      // Paso 1: Validar el código OTP con el backend
      const otpValidation = await validateOtpCode(
        pendingOtpId,
        formData.otpCode.trim()
      );

      if (otpValidation.error) {
        console.error("❌ Error al validar OTP:", otpValidation.error);
        toast.error(parseApiError(otpValidation.error));
        setIsSubmitting(false);
        return;
      }

      console.log("✅ OTP validado exitosamente");
      console.log("2. Registrando respuesta con consentimiento...");
      
      // Paso 2: Registrar la respuesta con el consentimiento aceptado
      const userInfo = userData.user || userData; // Manejar ambas estructuras
      const responseData: CreateCollectFormResponse = {
        user: {
          docType: userInfo.docType,
          docNumber: Number(userInfo.docNumber), // Asegurar que sea número
          name: userInfo.name,
          lastName: userInfo.lastName || "",
          age: userInfo.age || 0,
          gender: userInfo.gender || "OTHER",
          email: userInfo.email || "",
          phone: userInfo.phone || "",
        },
        data: userData.data || {}, // Incluir datos del formulario si existen
        dataProcessing: true,
        otpCode: formData.otpCode.trim(),
        otpCodeId: pendingOtpId,
      };

      console.log("   - Datos a enviar:", JSON.stringify(responseData, null, 2));
      
      const responseResult = await registerCollectFormResponse(
        data._id,
        responseData
      );

      if (responseResult.error) {
        console.error("❌ Error al registrar respuesta:", responseResult.error);
        toast.error(parseApiError(responseResult.error));
        setIsSubmitting(false);
        return;
      }

      console.log("✅ Respuesta registrada exitosamente");
      console.log("   - Resultado:", responseResult.data);
      console.log("=== PROCESO COMPLETADO ===");
      
      toast.success("¡Consentimiento aceptado exitosamente!");
      setStep("success");
    } catch (error) {
      console.error("❌ Error inesperado:", error);
      toast.error("Error al procesar el consentimiento");
    }

    setIsSubmitting(false);
  }

  if (step === "success") {
    return (
      <div className="max-w-2xl w-full px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-green-100 rounded-full">
              <Icon icon="tabler:check" className="text-5xl text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900">
              ¡Consentimiento aceptado!
            </h2>
            <p className="text-stone-600">
              Gracias por aceptar la política de tratamiento de datos personales.
              Tu información está protegida y será utilizada de acuerdo con la
              normativa vigente.
            </p>
            <div className="w-full pt-4 border-t border-stone-200">
              <p className="text-sm text-stone-500">
                Puedes cerrar esta ventana de forma segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "consent") {
    return (
      <form
        onSubmit={handleSubmitConsent(onConsentSubmit)}
        className="max-w-2xl w-full px-4"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 sm:p-8">
          {isSubmitting && <LoadingCover />}

          <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary-900 mb-2">
                Aceptar consentimiento
              </h2>
              <p className="text-sm text-stone-600">
                Por favor verifica tu identidad y acepta la política de
                tratamiento de datos personales
              </p>
            </div>

            {/* Datos del usuario */}
            <div className="bg-primary-50 border border-disabled rounded-lg p-4">
              <h3 className="font-semibold text-sm text-primary-900 mb-3">
                Tus datos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-stone-600">Nombre:</span>{" "}
                  <span className="text-primary-900">
                    {userData?.user.name} {userData?.user.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-stone-600">Documento:</span>{" "}
                  <span className="text-primary-900">
                    {userData?.user.docType} {userData?.user.docNumber}
                  </span>
                </div>
                {userData?.user.phone && (
                  <div>
                    <span className="font-medium text-stone-600">Teléfono:</span>{" "}
                    <span className="text-primary-900">{userData.user.phone}</span>
                  </div>
                )}
                {userData?.user.email && (
                  <div>
                    <span className="font-medium text-stone-600">Email:</span>{" "}
                    <span className="text-primary-900 break-words">
                      {userData.user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Selección de canal OTP */}
            <div>
              <label className="block font-medium text-sm text-stone-700 mb-2">
                Canal de verificación
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setOtpChannel("SMS")}
                  disabled={!userData?.user.phone}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    otpChannel === "SMS"
                      ? "border-primary-500 bg-primary-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  } ${!userData?.user.phone ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon
                    icon="mdi:message-text-outline"
                    className={`text-xl ${otpChannel === "SMS" ? "text-primary-600" : "text-stone-600"}`}
                  />
                  <span
                    className={`font-semibold text-sm ${otpChannel === "SMS" ? "text-primary-900" : "text-stone-700"}`}
                  >
                    SMS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOtpChannel("EMAIL")}
                  disabled={!userData?.user.email}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    otpChannel === "EMAIL"
                      ? "border-primary-500 bg-primary-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  } ${!userData?.user.email ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon
                    icon="material-symbols:email-outline"
                    className={`text-xl ${otpChannel === "EMAIL" ? "text-primary-600" : "text-stone-600"}`}
                  />
                  <span
                    className={`font-semibold text-sm ${otpChannel === "EMAIL" ? "text-primary-900" : "text-stone-700"}`}
                  >
                    Email
                  </span>
                </button>
              </div>

              <Button
                type="button"
                hierarchy="secondary"
                onClick={handleSendOtp}
                loading={isSendingOtp}
                disabled={isSendingOtp || !otpChannel}
                className="w-full"
                startContent={<Icon icon="tabler:send" />}
              >
                {otpLastSentChannel
                  ? `Reenviar código por ${otpLastSentChannel}`
                  : `Enviar código por ${otpChannel}`}
              </Button>
            </div>

            {/* Código OTP - SIEMPRE VISIBLE */}
            <div>
              {pendingOtpId && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="tabler:circle-check"
                      className="text-green-600 text-xl flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">
                        ✓ Código enviado exitosamente
                      </p>
                      <p className="text-xs text-green-800">
                        Revisa tu {otpLastSentChannel === "SMS" ? "teléfono" : "correo electrónico"} e ingresa el código que recibiste abajo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <CustomInput
                label="Código de verificación (OTP) *"
                placeholder="Ingresa el código que recibiste (Ejemplo: 123456)"
                type="text"
                {...(registerConsent("otpCode") as any)}
                error={errorsConsent.otpCode}
              />
            </div>

            {/* Información de la empresa y política */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon
                    icon="tabler:building"
                    className="text-primary-600 text-2xl"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-primary-900 mb-1">
                    {companyData?.name || "Empresa"}
                  </h4>
                  <p className="text-xs text-primary-800 mb-3">
                    Al continuar, aceptarás la política de tratamiento de datos
                    personales de <span className="font-semibold">{companyData?.name || "la empresa"}</span>.
                    Esta autorización es necesaria para procesar tu información de
                    acuerdo con la Ley 1581 de 2012.
                  </p>
                  {policyUrl && (
                    <a
                      href={policyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary-300 rounded-lg text-xs font-semibold text-primary-700 hover:bg-primary-50 hover:border-primary-400 transition-all shadow-sm"
                    >
                      <Icon icon="tabler:file-text" className="text-base" />
                      Ver política completa
                      <Icon icon="tabler:external-link" className="text-sm" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox de aceptación */}
            <div className="bg-gradient-to-br from-blue-50 to-primary-50 border-2 border-primary-200 rounded-xl p-4">
              <CustomCheckbox
                label={
                  <span className="text-primary-900 font-medium">
                    Acepto la política de tratamiento de datos personales y autorizo el uso de mi información de acuerdo con la{" "}
                    <span className="font-bold text-primary-700">Ley 1581 de 2012</span>
                  </span>
                }
                {...(registerConsent("dataProcessing") as any)}
                error={errorsConsent.dataProcessing}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                hierarchy="tertiary"
                onClick={() => {
                  setStep("search");
                  setUserData(null);
                  setPendingOtpId(null);
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                hierarchy="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !hasAcceptedPolicy}
                className="flex-1"
                startContent={<Icon icon="tabler:shield-check" />}
              >
                Aceptar consentimiento
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Step: search
  return (
    <form
      onSubmit={handleSubmitSearch(onSearchSubmit as any)}
      className="max-w-2xl w-full px-4"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 sm:p-8">
        {isSubmitting && <LoadingCover />}

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex p-3 bg-primary-100 rounded-full mb-4">
              <Icon
                icon="tabler:shield-check"
                className="text-4xl text-primary-600"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900 mb-2">
              Aceptación de política de datos
            </h2>
            <p className="text-sm text-stone-600 mb-1">
              Ley 1581 de 2012 - Protección de datos personales
            </p>
            <p className="text-xs text-stone-500">
              Para continuar, verifica tu identidad ingresando tu documento
            </p>
          </div>

          {/* Información de la empresa y formulario */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon
                  icon="tabler:building"
                  className="text-primary-600 text-xl"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-600 mb-1">Empresa</p>
                <h3 className="font-bold text-base text-primary-900">
                  {companyData?.name || "Empresa"}
                </h3>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-3 border-t border-primary-200">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon
                  icon="tabler:clipboard-text"
                  className="text-blue-600 text-xl"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-600 mb-1">Formulario</p>
                <h4 className="font-semibold text-sm text-primary-900">
                  {data.name}
                </h4>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Icon
                icon="tabler:info-circle"
                className="text-blue-600 text-lg flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-blue-900">
                <span className="font-semibold">¿Por qué necesitamos tu autorización?</span> La Ley 1581 de 2012 exige tu consentimiento previo para recolectar, almacenar y usar tus datos personales.
              </p>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect
              label="Tipo de documento"
              options={docTypesOptions as CustomSelectOption<string>[]}
              value={watchSearch("docType")}
              onChange={(value) => setValueSearch("docType", value as DocType)}
            />

            <CustomInput
              type="number"
              label="Número de documento"
              placeholder="1234567890"
              {...(registerSearch("docNumber") as any)}
              error={errorsSearch.docNumber}
            />
          </div>

          <Button
            type="submit"
            hierarchy="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PublicConsentForm;
