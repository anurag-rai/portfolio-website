export interface ProjectEntry {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export const projects: ProjectEntry[] = [
  {
    title: "Project One",
    description:
      "A real-time collaborative platform handling thousands of concurrent users. Built with a focus on performance and reliability.",
    image: "/images/project-1.jpg",
    technologies: ["TypeScript", "React", "WebSocket", "Redis", "AWS"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/example",
  },
  {
    title: "Project Two",
    description:
      "An open-source developer tool that simplifies complex workflows. Designed for extensibility and ease of use.",
    image: "/images/project-2.jpg",
    technologies: ["Node.js", "CLI", "TypeScript"],
    repoUrl: "https://github.com/example",
  },
];
