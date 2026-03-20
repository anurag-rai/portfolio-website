/**
 * Centralized site configuration.
 * Update these values to customize the portfolio content.
 * This is the single source of truth for all personal data displayed on the site.
 */
export const siteConfig = {
  name: "Anurag Rai",
  title: "Software Engineer",
  email: "hello@anuragrai.dev",
  description:
    "Software engineer building modern, scalable web applications. Explore my experience, projects, and get in touch.",

  social: {
    github: "https://github.com/anuragrai",
    linkedin: "https://linkedin.com/in/anuragrai",
  },

  /** Navigation links shown in header and mobile menu */
  navLinks: [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],

  /** Bio paragraphs displayed in the About section */
  bio: [
    "I'm a software engineer who builds modern, scalable web applications. I care about clean architecture, thoughtful user experiences, and shipping code that works reliably at scale.",
    "Currently focused on real-time systems and distributed architectures. I enjoy the intersection of engineering rigor and creative problem-solving.",
  ],

  /** Skills displayed as pills in the About section */
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "Next.js",
    "AWS",
    "PostgreSQL",
    "GraphQL",
    "Docker",
    "Tailwind CSS",
    "Git",
  ],

  /** IANA timezone for the footer clock */
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",
} as const;
