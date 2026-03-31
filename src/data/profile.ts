/** Personal data displayed across the site */
export const profile = {
  name: "Anurag Rai",
  title: "Software Engineer",
  email: "hello@anuragrai.dev",
  description:
    "Software engineer building modern, scalable web applications. Explore my experience, projects, and get in touch.",

  social: {
    github: "https://github.com/anuragrai",
    linkedin: "https://linkedin.com/in/anuragrai",
  },

  /** Bio paragraphs displayed in the About section */
  bio: [
    "I'm a software engineer who builds modern, scalable web applications. I care about clean architecture, thoughtful user experiences, and shipping code that works reliably at scale.",
    "Currently focused on real-time systems and distributed architectures. I enjoy the intersection of engineering rigor and creative problem-solving.",
  ],
} as const;
