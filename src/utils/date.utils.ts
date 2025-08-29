type STRING_TO_DATE_FORMAT = "DD/MM/YYYY";

export function formatDateToString({
  date,
  format = "DD/MM/YYYY",
}: {
  date: Date;
  format?: STRING_TO_DATE_FORMAT;
}) {
  switch (format) {
    case "DD/MM/YYYY":
      return `${date.getDate().toString().padStart(2, "00")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "00")}/${date.getFullYear()}`;

    default:
      return "Formato de fecha inválida";
  }
}
