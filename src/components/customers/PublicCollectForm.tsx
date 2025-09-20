import { AnswerType, CollectForm } from "@/types/collectForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Button from "../base/Button";
import RenderQuestion from "../forms/RenderQuestion";

interface Props {
  data: CollectForm;
}

const PublicCollectForm = ({ data }: Props) => {
  const fields: {
    [key: string]: {
      type: AnswerType;
      default: any;
    };
  } = {};

  data.questions.forEach(
    (question) =>
      (fields[question.title] = {
        type: question.answerType,
        default: question.answerType === "TEXT" ? "" : new Date(),
      })
  );

  // Build a dynamic Zod schema based on the inferred `fields`

  type FieldConfig = { type: AnswerType; default: any };

  function buildSchemaFromFields(fields: Record<string, FieldConfig>) {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const [key, cfg] of Object.entries(fields)) {
      switch (cfg.type) {
        case "TEXT":
          shape[key] = z.string().min(1, "Campo requerido");
          break;
        /* case "NUMBER":
          shape[key] = z.preprocess(
            (v) =>
              v === "" || v === null || v === undefined ? undefined : Number(v),
            z.number({ invalid_type_error: "Debe ser un número" })
          );
          break;
        case "BOOLEAN":
          shape[key] = z.boolean();
          break; */
        case "DATE":
          shape[key] = z.preprocess(
            (v) => (v instanceof Date ? v : v ? new Date(v as any) : undefined),
            z.date({ error: "Fecha inválida" })
          );
          break;
        default:
          shape[key] = z.any();
          break;
      }
    }

    return z.object(shape);
  }

  // Memoize schema and default values from `fields`
  const schema = React.useMemo(() => buildSchemaFromFields(fields), [data]);

  const dynamicDefaultValues = React.useMemo(() => {
    return Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v.default])
    );
  }, [data]);

  // Helper types derived from the dynamic schema
  type DynamicSchema = ReturnType<typeof buildSchemaFromFields>;
  type FormValues = z.infer<DynamicSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: dynamicDefaultValues as any,
  });

  async function onSubmit(data: FormValues) {
    console.log("Hello world!", data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-2xl items-stretch w-full"
    >
      <h1 className="font-bold text-2xl text-primary-900">{data.name}</h1>

      {data.questions.map((question) => (
        <RenderQuestion
          key={question._id}
          {...register(question.title)}
          question={question}
          error={errors[question.title]}
        />
      ))}

      <div className="flex gap-4 mt-8 justify-center">
        <Button className="w-full max-w-lg" type="submit">
          Enviar
        </Button>
      </div>
    </form>
  );
};

export default PublicCollectForm;
