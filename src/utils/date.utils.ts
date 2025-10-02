type STRING_TO_DATE_FORMAT = "DD/MM/YYYY" | "YYYY-MM-DD";

export function formatDateToString({
  date,
  format = "DD/MM/YYYY",
}: {
  date: Date | string | undefined;
  format?: STRING_TO_DATE_FORMAT;
}): string {
  if (!date) return "";
  const parsedDate = new Date(date);
  switch (format) {
    case "DD/MM/YYYY":
      return `${parsedDate.getDate().toString().padStart(2, "00")}/${(
        parsedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "00")}/${parsedDate.getFullYear()}`;

    case "YYYY-MM-DD":
      const year = parsedDate.getFullYear();
      const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
      const day = parsedDate.getDate().toString().padStart(2, "0");

      // Format the date string as YYYY-MM-DD
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;

    default:
      return "Formato de fecha inválida";
  }
}
