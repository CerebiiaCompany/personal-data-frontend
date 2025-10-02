"use client";

import { CollectFormQuestion } from "@/types/collectForm.types";
import React, { useState } from "react";
import CustomInput from "./CustomInput";
import { FieldError } from "react-hook-form";
import CustomDateInput from "./CustomDateInput";
import { formatDateToString } from "@/utils/date.utils";

interface Props extends React.ComponentProps<"input"> {
  question: CollectFormQuestion;
  error?: FieldError;
}

const RenderQuestionInput = ({
  question,
  error,
  defaultValue,
  ...props
}: Props) => {
  const [value, setValue] = useState("");

  return (
    <div>
      {question.answerType == "TEXT" && (
        <CustomInput
          label={question.title}
          placeholder="Tu respuesta..."
          variant="underline"
          {...props}
          error={error}
        />
      )}
      {question.answerType === "DATE" && (
        <CustomDateInput
          label={question.title}
          placeholder="Tu respuesta..."
          variant="underline"
          {...props}
          value={
            typeof defaultValue === "string"
              ? defaultValue.includes("T")
                ? defaultValue.slice(0, 10)
                : defaultValue
              : ""
          }
          error={error}
        />
      )}
    </div>
  );
};

export default RenderQuestionInput;
