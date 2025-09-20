type STRING_TO_DATE_FORMAT = "DD/MM/YYYY";

export function formatDateToString({
  date,
  format = "DD/MM/YYYY",
}: {
  date: Date | string;
  format?: STRING_TO_DATE_FORMAT;
}) {
  const parsedDate = new Date(date);
  switch (format) {
    case "DD/MM/YYYY":
      return `${parsedDate.getDate().toString().padStart(2, "00")}/${(
        parsedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "00")}/${parsedDate.getFullYear()}`;

    default:
      return "Formato de fecha inválida";
  }
}
