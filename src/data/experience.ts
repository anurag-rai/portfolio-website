export interface ExperienceEntry {
  role: string;
  company: string;
  startDate: string; // "YYYY-MM" format, e.g. "2023-05"
  endDate: string | null; // "YYYY-MM" or null for "Present"
  description: string;
  technologies: string[];
}

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
 */
export function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} '${String(year).slice(2)}`;
}

/**
 * Calculates the duration between two "YYYY-MM" dates.
 * Uses current date when `end` is null (ongoing role).
 * @example calcDuration("2021-06", "2023-04") // "1y 10m"
 * @example calcDuration("2023-05", null)       // "2y 10m" (if today is March 2026)
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

  let totalMonths = (ey - sy) * 12 + (em - sm);
  // Round up: partial months count as 1
  if (totalMonths < 1) totalMonths = 1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

export const experiences: ExperienceEntry[] = [
  {
    role: "Senior Software Engineer",
    company: "Company Name",
    startDate: "2023-05",
    endDate: null,
    description:
      "Led development of real-time systems and migrated core services to a microservices architecture. Improved system reliability and reduced deployment times.",
    technologies: ["TypeScript", "React", "Node.js", "AWS", "PostgreSQL"],
  },
  {
    role: "Software Engineer",
    company: "Previous Company",
    startDate: "2021-06",
    endDate: "2023-04",
    description:
      "Built and maintained customer-facing features across the full stack. Implemented CI/CD pipelines and improved test coverage.",
    technologies: ["TypeScript", "React", "GraphQL", "Docker"],
  },
  {
    role: "Junior Developer",
    company: "First Company",
    startDate: "2019-01",
    endDate: "2021-05",
    description:
      "Developed internal tools and contributed to the main product. Gained deep experience in frontend development and testing.",
    technologies: ["JavaScript", "React", "CSS", "Node.js"],
  },
];
