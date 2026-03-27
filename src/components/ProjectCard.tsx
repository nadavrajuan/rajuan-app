'use client';

import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  urlPublic: boolean;
  isPublic: boolean;
  tags: string[];
  category: { id: string; name: string } | null;
}

function getCardGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 40%, 12%) 0%, hsl(${(hue + 80) % 360}, 30%, 8%) 100%)`;
}

export default function ProjectCard({
  project,
  isAdmin,
}: {
  project: Project;
  isAdmin: boolean;
}) {
  const path = project.category
    ? `/ROOT/PROJECTS/${project.category.name.toUpperCase().replace(/\s/g, '_')}`
    : '/ROOT/PROJECTS/MISC';

  return (
    <div className="bevel-raised bg-surface-container-low p-2 flex flex-col gap-2 hover:bg-surface-container-high group">
      {/* Thumbnail placeholder */}
      <div
        className="aspect-video w-full bevel-pressed overflow-hidden relative"
        style={{ background: getCardGradient(project.name) }}
      >
        <div className="absolute inset-0 retro-grid opacity-60" />
        {/* Admin badges */}
        <div className="absolute top-1 right-1 flex gap-1">
          {isAdmin && !project.isPublic && (
            <span className="bg-amber-600 text-black text-[8px] font-bold px-1 py-0.5">PRIVATE</span>
          )}
          {isAdmin && project.url && !project.urlPublic && (
            <span className="bg-secondary text-on-secondary text-[8px] font-bold px-1 py-0.5">
              LINK_HIDDEN
            </span>
          )}
        </div>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            folder_zip
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[7px] text-violet-500/70 truncate">{path}</div>
        <h3 className="text-xs font-black text-primary truncate uppercase">{project.name}</h3>
        {project.description && (
          <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-bold bg-indigo-900 text-violet-300 px-1 border border-violet-500/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 mt-auto">
        <Link
          href={`/project/${project.id}`}
          className="flex-1 bevel-raised bg-surface-container-high text-primary py-1.5 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-primary hover:text-on-primary"
        >
          <span className="material-symbols-outlined text-[12px]">info</span>
          INFO
        </Link>
        {project.url && (project.urlPublic || isAdmin) && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bevel-raised bg-primary text-on-primary py-1.5 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[12px]">rocket_launch</span>
            VISIT
          </a>
        )}
      </div>
    </div>
  );
}
