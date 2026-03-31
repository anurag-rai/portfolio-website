const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a "YYYY-MM" date string into a short display format.
 * @example formatDate("2023-05") // "May '23"
 * @example formatDate("2019-01") // "Jan '19"
 */
export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} '${String(year).slice(2)}`;
}

/**
 * Calculates the inclusive duration between two "YYYY-MM" dates.
 * Both start and end months are counted (Apr to Jul = 4 months).
 * Uses current date when `end` is null (ongoing role).
 * @example calcDuration("2023-04", "2023-07") // "4m"
 * @example calcDuration("2021-07", "2022-04") // "10m"
 * @example calcDuration("2018-12", "2021-07") // "2y 8m"
 * @example calcDuration("2023-05", null)       // calculated from today
 */
export function calcDuration(start: string, end: string | null): string {
  const [sy, sm] = start.split("-").map(Number);
  let ey: number, em: number;
  if (end) {
    [ey, em] = end.split("-").map(Number);
  } else {
    const now = new Date();
    ey = now.getFullYear();
    em = now.getMonth() + 1;
  }

  // +1 for inclusive counting: Apr(4) to Jul(7) = 7-4+1 = 4 months
  let totalMonths = (ey - sy) * 12 + (em - sm) + 1;
  if (totalMonths < 1) totalMonths = 1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}
