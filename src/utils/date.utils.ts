type STRING_TO_DATE_FORMAT = "DD/MM/YYYY" | "YYYY-MM-DD";

export function utcToLocalDate(utcDateString: string): Date {
  const utcDate = new Date(utcDateString);
  // Create a new Date adjusted to local time by applying the timezone offset
  const localTime = utcDate.getTime() - utcDate.getTimezoneOffset() * 60000;
  return new Date(localTime);
}

export function toDateTimeLocalString(d: string) {
  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
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

function calendarParts(date: Date | string): {
  year: number;
  month: number;
  day: number;
} | null {
  if (typeof date === "string") {
    const isoDate = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      return {
        year: Number(isoDate[1]),
        month: Number(isoDate[2]),
        day: Number(isoDate[3]),
      };
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;
    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
    };
  }

  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function formatDateToString({
  date,
  format = "DD/MM/YYYY",
}: {
  date: Date | string | undefined;
  format?: STRING_TO_DATE_FORMAT;
}): string {
  if (!date) return "";

  const parts = calendarParts(date);
  if (!parts) return "";

  const day = String(parts.day).padStart(2, "0");
  const month = String(parts.month).padStart(2, "0");
  const year = String(parts.year);

  switch (format) {
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return "Formato de fecha inválida";
  }
}
