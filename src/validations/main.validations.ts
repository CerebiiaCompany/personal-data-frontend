import { AnswerType, DataType } from "@/types/collectForm.types";
import * as z from "zod";

export const createCollectFormValidationSchema = z.object({
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
