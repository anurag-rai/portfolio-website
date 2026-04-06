/** Personal data displayed across the site */
export const profile = {
  name: "Anurag Rai",
  title: "Software Engineer",
  email: "hello@anuragrai.dev",
  description:
    "Software engineer building modern, scalable web applications. Explore my experience, projects, and get in touch.",

  social: {
    github: "https://github.com/anurag-rai/",
    linkedin: "https://www.linkedin.com/in/anuragrai7/",
  },

  /** Bio paragraphs displayed in the About section */
  bio: [
    "I design and build distributed systems that handle millions of daily requests, save millions in costs, and ship to users in minutes instead of days. Full-stack across the board — APIs, microservices, event-driven architectures, cloud infrastructure on AWS — across healthcare, fintech, and logistics.",
    "I build AI-powered products and use AI daily as a core part of how I write code, review PRs, and ship faster.",
  ],
} as const;
