type STRING_TO_DATE_FORMAT = "DD/MM/YYYY" | "YYYY-MM-DD";

export function utcToLocalDate(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Create a new Date adjusted to local time by applying the timezone offset
  const localTime = utcDate.getTime() - utcDate.getTimezoneOffset() * 60000;
  return new Date(localTime);
}
export function parseUtcDateAsLocalCalendarDate(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  const localDate = new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate()
  );
  return localDate;
}

export function formatDateToString({
  date,
  format = "DD/MM/YYYY",
}: {
  date: Date | string | undefined;
  format?: STRING_TO_DATE_FORMAT;
}): string {
  if (!date) return "";

  const parsedDate = parseUtcDateAsLocalCalendarDate(
    typeof date === "string" ? date : new Date(date).toString()
  );

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
