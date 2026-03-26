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

export default function ProjectCard({
  project,
  isAdmin,
}: {
  project: Project;
  isAdmin: boolean;
}) {
  return (
    <div className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/40">
      {/* Admin badges */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          {!project.isPublic && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-medium">
              Private
            </span>
          )}
          {project.url && !project.urlPublic && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-medium">
              Link hidden
            </span>
          )}
        </div>
      )}

      {/* Card content */}
      <div className="p-5">
        {project.category && (
          <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
            {project.category.name}
          </span>
        )}
        <h3 className="text-base font-semibold mt-1 mb-2 leading-tight">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-neutral-400 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-4 flex items-center gap-2">
        <Link
          href={`/project/${project.id}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          More info →
        </Link>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm px-3 py-1.5 bg-white text-neutral-950 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Visit
          </a>
        )}
      </div>
    </div>
  );
}
