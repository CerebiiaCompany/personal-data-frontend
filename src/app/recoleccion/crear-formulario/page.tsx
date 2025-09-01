"use client";

import { MARKETING_CHANNELS } from "@/types/form.types";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Button from "@/components/base/Button";
import CustomInput from "@/components/forms/CustomInput";
import CustomTextarea from "@/components/forms/CustomTextarea";

const schema = z.object({
  title: z.string(),
  description: z.string(),
  marketingChannels: z.array(z.string<MARKETING_CHANNELS>()),
});

export default function CollectionCreateFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      marketingChannels: [],
    },
  });

  function onSubmit(data: z.infer<typeof schema>) {}

  return (
    <div className="flex flex-col">
      <header className="w-full flex flex-col gap-2">
        <nav className="w-full flex gap-2 justify-center px-3 py-6 items-stretch">
          <label className="flex max-w-4xl items-center rounded-lg gap-2 text-stone-600 border border-disabled flex-1 relative px-3 h-fit">
            <Icon icon={"tabler:search"} />
            <input type="text" placeholder="Buscar" className="w-full py-1.5" />
          </label>

          <div>
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
          <h4 className="font-normal text-xl text-primary-900 px-5">
            Recolección
          </h4>
          <span className="inline-block w-full h-1.5 bg-primary-50" />
        </nav>
      </header>

      {/* Content */}
      <div className="px-8 py-6 flex flex-col gap-6 items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 max-w-3xl items-stretch w-full"
        >
          <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
            <CustomInput name="title" placeholder="Formulario sin título" />
            <CustomTextarea
              rows={5}
              name="description"
              label="Descripción del formulario"
              placeholder=""
              className="resize-y"
            />
          </div>

          <div className="rounded-xl border border-disabled p-10 flex flex-col items-stretch gap-5">
            <p className="text-lg font-semibold">Ruta de envío</p>

            <label className="custom-checkbox">
              <input type="checkbox" />
              <div className="checkbox-visual"></div>
              <span className="">SMS</span>
            </label>
          </div>

          <Button className="w-fit">Crear y publicar formulario</Button>
        </form>
      </div>
    </div>
  );
}
