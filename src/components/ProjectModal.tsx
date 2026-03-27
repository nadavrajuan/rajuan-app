'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TodoSection from './TodoSection';

interface Category { id: string; name: string }

interface Project {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  url: string | null;
  urlPublic: boolean;
  isPublic: boolean;
  isIdea: boolean;
  imageUrl: string | null;
  tags: string[];
  category: Category | null;
  createdAt: string;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  adminOnly: boolean;
  createdAt: string;
}

export default function ProjectModal({
  project,
  isAdmin,
  onClose,
}: {
  project: Project;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoaded, setTodosLoaded] = useState(false);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch todos
  useEffect(() => {
    fetch(`/api/projects/${project.id}/todos`)
      .then((r) => r.json())
      .then((data) => { setTodos(data); setTodosLoaded(true); });
  }, [project.id]);

  const sectionLabel = project.isIdea ? 'IDEAS' : 'PROJECTS';
  const path = project.category
    ? `/ROOT/${sectionLabel}/${project.category.name.toUpperCase().replace(/\s/g, '_')}/${project.name.toUpperCase().replace(/\s/g, '_')}`
    : `/ROOT/${sectionLabel}/MISC/${project.name.toUpperCase().replace(/\s/g, '_')}`;

  const showUrl = isAdmin || project.urlPublic;
  const hasHiddenUrl = !project.url && !project.urlPublic;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centering wrapper */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4 pointer-events-none">
        {/* Window */}
        <div
          className="w-full max-w-2xl bevel-raised bg-surface-container pointer-events-auto"
          style={{ boxShadow: '8px 8px 0px 0px rgba(26,28,28,0.7)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title bar */}
          <div className="bg-primary-container px-3 py-1 flex justify-between items-center">
            <span className="text-on-primary-container font-black text-xs uppercase tracking-widest truncate">
              {project.name.toUpperCase().replace(/\s/g, '_')}.EXE
            </span>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <Link
                href={`/project/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-5 h-5 bevel-raised bg-surface-container-high flex items-center justify-center hover:brightness-125"
                title="Open in new tab"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>open_in_new</span>
              </Link>
              <div className="w-5 h-5 bevel-raised bg-primary flex items-center justify-center">
                <span className="block w-2 h-0.5 bg-on-primary" />
              </div>
              <button
                onClick={onClose}
                className="w-5 h-5 bevel-raised bg-error flex items-center justify-center text-white text-[10px] font-bold hover:brightness-125"
              >
                X
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="bg-surface-container-low">
            {/* Image */}
            {project.imageUrl && (
              <div className="bevel-pressed overflow-hidden aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 space-y-5">
              {/* Path */}
              <div className="font-mono text-[9px] text-violet-500/70 break-all">{path}</div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {project.isIdea && (
                  <span className="text-[10px] font-bold bg-violet-800 text-violet-200 px-2 py-0.5 border border-violet-400/30 uppercase">
                    IDEA
                  </span>
                )}
                {project.category && (
                  <span className="text-[10px] font-bold bg-indigo-900 text-violet-300 px-2 py-0.5 border border-violet-500/30 uppercase">
                    {project.category.name}
                  </span>
                )}
                {isAdmin && !project.isPublic && (
                  <span className="text-[10px] font-bold bg-amber-600 text-black px-2 py-0.5 uppercase">PRIVATE</span>
                )}
                {isAdmin && !project.urlPublic && (
                  <span className="text-[10px] font-bold bg-secondary text-on-secondary px-2 py-0.5 uppercase">LINK_HIDDEN</span>
                )}
              </div>

              {/* Name */}
              <h2 className="text-2xl font-black text-primary uppercase leading-tight">{project.name}</h2>

              {/* Short description */}
              {project.description && (
                <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {project.description}
                </p>
              )}

              {/* Long description */}
              {project.longDescription && (
                <div className="border-t border-violet-500/20 pt-4">
                  <p className="text-on-surface-variant/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.longDescription}
                  </p>
                </div>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold bg-indigo-900 text-violet-300 px-2 py-0.5 border border-violet-500/30">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                {showUrl && project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bevel-raised bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:bg-primary-container"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    EXECUTE: VISIT_PROJECT
                  </a>
                )}
                {hasHiddenUrl && !isAdmin && (
                  <a
                    href="https://wa.me/+972522708760"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bevel-raised bg-surface-container-high text-secondary font-black text-xs uppercase tracking-widest hover:bg-surface-container-highest border border-secondary/30"
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    REQUEST_ACCESS
                  </a>
                )}
              </div>

              {/* Todos */}
              {todosLoaded && (
                <TodoSection projectId={project.id} initialTodos={todos} isAdmin={isAdmin} />
              )}

              {/* Metadata */}
              <div className="bg-surface-container-high -mx-6 px-6 py-3 mt-4 flex justify-between items-center">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">METADATA</span>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  TIMESTAMP:{' '}
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
