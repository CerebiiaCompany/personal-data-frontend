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

type AnswerType = "text" | "date";

const schema = z.object({
  title: z.string(),
  description: z.string(),
  marketingChannels: z.object({
    sms: z.boolean(),
    email: z.boolean(),
    whatsapp: z.boolean(),
  }),
  questions: z.array(
    z.object({
      title: z.string(),
      type: z.string<AnswerType>(),
    })
  ),
});

export default function CollectionCreateFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      marketingChannels: {
        sms: false,
        email: false,
        whatsapp: false,
      },
      questions: [],
    },
  });
  const floatingActionNavbarRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [floatingNavbarToggle, setFloatingNavbarToggle] =
    useState<boolean>(false);

  function onSubmit(data: z.infer<typeof schema>) {
    console.log(data);
  }

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
      <header className="w-full flex flex-col gap-2">
        <nav className="w-full flex gap-2 justify-center px-3 py-6 items-stretch">
          <label className="flex max-w-4xl items-center rounded-lg gap-2 text-stone-600 border border-disabled flex-1 relative px-3 h-fit">
            <Icon icon={"tabler:search"} />
            <input type="text" placeholder="Buscar" className="w-full py-1.5" />
          </label>

          <div className="min-w-10">
            <button className="relative h-full rounded-lg hover:bg-stone-200 transition-colors aspect-square grid place-content-center">
              <Icon
                icon={"tabler:bell"}
                className="text-2xl text-primary-900"
              />
              <span className="absolute inline-block top-1 right-1 bg-primary-500 rounded-full w-4 h-4"></span>
            </button>
          </div>
        </nav>

        <nav className="w-full flex flex-col items-start gap-1">
          <h4 className="font-normal text-lg text-primary-900 px-3">
            Recolección
          </h4>
          <span className="inline-block w-full h-1.5 bg-primary-50" />
        </nav>
      </header>

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <h4 className="font-bold text-2xl text-primary-900">
          Crear formulario nuevo
        </h4>
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
              <h4 className="font-bold text-lg text-primary-900">
                Crear formulario nuevo
              </h4>

              <div className="flex justify-end gap-4 items-center">
                <Button className="w-fit" type="submit">
                  Crear y publicar formulario
                </Button>
                <Button className="w-fit" isIconOnly>
                  <Icon icon={"gg:link"} className="text-2xl" />
                </Button>
              </div>
            </div>
          </nav>

          <header className="flex justify-end gap-4">
            <Button className="w-fit" type="submit">
              Crear y publicar formulario
            </Button>
            <Button className="w-fit" isIconOnly>
              <Icon icon={"gg:link"} className="text-2xl" />
            </Button>
          </header>

          <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
            <CustomInput
              {...register("title")}
              name="title"
              placeholder="Formulario sin título"
              variant="underline"
            />
            <CustomTextarea
              {...register("description")}
              rows={5}
              name="description"
              label="Descripción del formulario"
              placeholder="Escoger el Tipo de Cargo"
              className="resize-y"
            />
          </div>

          <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
            <p className="text-lg font-semibold">Ruta de envío</p>
            <CustomCheckbox
              label="SMS"
              {...register("marketingChannels.sms")}
            />
            <CustomCheckbox
              label="Email"
              {...register("marketingChannels.email")}
            />{" "}
            <CustomCheckbox
              label="WhatsApp"
              {...register("marketingChannels.whatsapp")}
            />
          </div>

          <Button
            onClick={() => {
              document
                .getElementById(HTML_IDS_DATA.selectTemplateDialog)
                ?.classList.add("dialog-visible");
            }}
            className="max-w-xs"
          >
            Seleccionar plantilla
          </Button>

          {/* Select  */}
          <SelectTemplateDialog />

          {/* Questions list */}
          {watch("questions").map((question, index) => (
            <div
              className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5"
              key={index}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between gap-2">
                  <CustomInput
                    variant="underline"
                    placeholder="Título de la pregunta"
                    {...register(`questions.${index}.title`)}
                  />

                  <CustomSelect
                    value={watch("questions")[index].type}
                    onChange={(value) =>
                      setValue(`questions.${index}.type`, value)
                    }
                    options={[
                      {
                        value: "text",
                        title: "Repuesta escrita",
                        icon: "material-symbols:short-text-rounded",
                      },
                      {
                        value: "date",
                        title: "Fecha",
                        icon: "fluent:calendar-16-regular",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add question button */}
          <div className="flex justify-end">
            <Button
              className="max-w-xs w-full"
              startContent={<Icon icon={"tabler:plus"} className="text-lg" />}
              onClick={() => {
                setValue("questions", [
                  ...watch("questions"),
                  { title: "", type: "text" },
                ]);
              }}
            >
              Añadir pregunta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
