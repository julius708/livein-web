import { notFound } from "next/navigation";
import { projects } from "@/lib/developer-projects";
import DeveloperProject from "@/components/DeveloperProject";

export function generateStaticParams() {
  return Object.keys(projects).map((project) => ({ project }));
}

export async function generateMetadata({ params }) {
  const { project } = await params;
  return {
    title: `${projects[project]?.name || "Projekt"} | LIVE-IN · ukážka`,
    robots: { index: false, follow: false },
  };
}

export default async function ProjectPage({ params }) {
  const { project } = await params;
  if (!projects[project]) notFound();
  return <DeveloperProject project={projects[project]} projectId={project} />;
}
