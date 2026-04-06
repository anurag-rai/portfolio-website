export interface ExperienceEntry {
  role: string;
  company: string;
  /** Format: "YYYY-MM", e.g. "2023-05" */
  startDate: string;
  /** Format: "YYYY-MM", or null for "Present" */
  endDate: string | null;
  /**
   * Each string is rendered as a bullet point.
   * Supports inline HTML for formatting — use <strong> for bold.
   * @example ["Developed an <strong>LLM-powered</strong> quiz system."]
   */
  description: string[];
  technologies: string[];
}

// Reverse chronological order
export const experiences: ExperienceEntry[] = [
  {
    role: "Senior Software Engineer",
    company: "Clipboard Health",
    startDate: "2022-12",
    endDate: null,
    description: [
      // -- Background checks
      "Led a team of 3 engineers to redesign criminal background check enforcement for healthcare workers, moving from upfront validation to intent-triggered, asynchronous screening while enforcing strict compliance and safety invariants via layered controls. This <strong>reduced ~70% wasted checks</strong>, <strong>lowering per-active-user costs by ~80%</strong> and <strong>saving ~$1.5M+ annually.</strong>",
      // -- OTA
      "Architected and launched over-the-air (OTA) updates for a mobile app, replacing weekly app store releases with CI-driven deployments <strong>reducing time-to-user from 7+ days to ~30 minutes</strong>. This <strong>eliminated 100+ QA hours/week</strong>, enabled almost-instant hotfixes and rollbacks, achieved <strong>80% user adoption within 12 hours</strong>, and <strong>enabled same-day experiment delivery across all product teams.</strong>",
      // -- Reviews
      "Led a team of 2 engineers to architect a workplace reviews microservice (1.4M req/day, 175 peak RPS, sub-10ms p50), replacing a generic rating system with structured reviews, multi-dimensional aggregations, and LLM-powered content moderation. Workers who used reviews saw <strong>50% fewer poor ratings</strong> and <strong>49% higher retention per workplace.</strong>",
      // -- Quizzes
      "Led a team of 3 engineers to improve marketplace supply quality by building an LLM-driven system that transforms unstructured workplace rules into quizzes for healthcare workers enforced before they book shifts. This <strong>increased rule adherence ratings from 63% to 72%</strong> with <strong>no drop in fill rate.</strong>",
      // -- Skills assessment
      "Designed and led the evolution of a marketplace reliability system to screen and tier new healthcare workers, <strong>screening out workers 2x more likely to no-show</strong> while <strong>preserving supply through tiered booking access.</strong>",
    ],
    technologies: [
      "TypeScript",
      "React",
      "NodeJS",
      "Terraform",
      "AWS",
      "PostgreSQL",
      "MongoDB",
      "Redis",
    ],
  },
  {
    role: "Software Development Engineer 2",
    company: "Amazon",
    startDate: "2021-07",
    endDate: "2022-04",
    description: [
      "Designed and implemented a <strong>highly available configuration management system</strong> for Amazon warehouses, enabling the launch of a <strong>greenfield project.</strong>",
      "Developed a deployment workflow to distribute UI artifacts across <strong>multiple global regions</strong> for a multi-tenant frontend application, ensuring <strong>reliable and scalable application rollouts.</strong>",
    ],
    technologies: ["TypeScript", "Java", "React", "AWS CDK", "AWS", "DynamoDB"],
  },
  {
    role: "Software Engineer",
    company: "Smallcase",
    startDate: "2018-12",
    endDate: "2021-07",
    description: [
      "Developed multiple RESTful microservices from inception to deployment as part of a domain-driven service-oriented architecture and integrated with multiple third-party services—including financial brokerage firms and payment solutions—to support stock transactions for <strong>over 4.5 million users.</strong>",
      "Developed and scaled critical services such as a notification system delivering <strong>1 million+ daily notifications</strong> and a distributed cron service executing <strong>1,000+ business-critical jobs daily.</strong>",
    ],
    technologies: ["JavaScript", "NodeJS", "Kafka", "MongoDB", "Redis"],
  },
  {
    role: "Software Engineer",
    company: "Grey Orange",
    startDate: "2017-08",
    endDate: "2018-11",
    description: [
      "Developed an event-driven service with both push-based (webhooks/events) and pull-based (REST API) capabilities providing <strong>real-time order lifecycle visibility</strong> for warehouse operations.",
      "Built an internal tool to detect SLA breaches, <strong>improving operational efficiency.</strong>",
    ],
    technologies: ["Erlang", "Mnesia", "Python", "RabbitMQ"],
  },
  {
    role: "Summer Intern - Google Summer of Code",
    company: "AIMA Code",
    startDate: "2016-04",
    endDate: "2016-07",
    description: ["Implemented algorithms for <strong>First-Order and Propositional Logic.</strong>"],
    technologies: ["Java", "ANTLR", "JUnit"],
  },
];
