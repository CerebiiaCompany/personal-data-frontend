"use client";

import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomTextarea from "@/components/forms/CustomTextarea";
import CustomCheckbox from "@/components/forms/CustomCheckbox";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import CustomSelect from "@/components/forms/CustomSelect";
import SelectTemplateDialog from "@/components/dialogs/SelectTemplateDialog";
import { HTML_IDS_DATA } from "@/constants/htmlIdsData";
import SectionHeader from "@/components/base/SectionHeader";
import { AnswerType, DataType } from "@/types/collectForm.types";
import { createCollectForm } from "@/lib/collectForm.api";
import { useSessionStore } from "@/store/useSessionStore";
import { toast } from "sonner";
import { parseApiError } from "@/utils/parseApiError";
import { useRouter } from "next/navigation";
import CreateCollectFormForm from "@/components/collectForms/CreateCollectFormForm";

const schema = z.object({
  name: z.string().min(1, "Este campo es obligatorio"),
  description: z.string(),
  marketingChannels: z.object({
    SMS: z.boolean(),
    EMAIL: z.boolean(),
    WHATSAPP: z.boolean(),
  }),
  questions: z
    .array(
      z.object({
        title: z.string().min(1, "Este campo es obligatorio"),
        answerType: z.string<AnswerType>(),
        dataType: z.string<DataType>(),
      })
    )
    .min(1, "Añade al menos una pregunta"),
});

export default function CollectionCreateFormPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "Formulario Creado de Prueba",
      description: "Creado desde el cliente frontend",
      marketingChannels: {
        SMS: true,
        EMAIL: true,
        WHATSAPP: true,
      },
      questions: [],
    },
  });
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);
  const user = useSessionStore((store) => store.user);

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

  return (
    <div className="flex flex-col relative">
      <SectionHeader />

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <h4 className="font-bold text-2xl text-primary-900">
          Crear formulario nuevo
        </h4>
        <CreateCollectFormForm />
      </div>
    </div>
  );
}
