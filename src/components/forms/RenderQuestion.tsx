import { CollectFormQuestion } from "@/types/collectForm.types";
import React from "react";
import CustomInput from "./CustomInput";
import { FieldError } from "react-hook-form";

interface Props extends React.ComponentProps<"input"> {
  question: CollectFormQuestion;
  error?: FieldError;
}

const RenderQuestion = ({ question, error, ...props }: Props) => {
  return (
    <div>
      <CustomInput
        label={question.title}
        placeholder="Tu respuesta..."
        variant="underline"
        {...props}
        error={error}
      />
    </div>
  );
};

export default RenderQuestion;
