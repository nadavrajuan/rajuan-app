import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const session = await getAdminSession();
  const isAdmin = !!session;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!project || (!isAdmin && !project.isPublic)) notFound();

  const showUrl = isAdmin || project.urlPublic;

  const path = project.category
    ? `/ROOT/PROJECTS/${project.category.name.toUpperCase().replace(/\s/g, '_')}/${project.name.toUpperCase().replace(/\s/g, '_')}`
    : `/ROOT/PROJECTS/MISC/${project.name.toUpperCase().replace(/\s/g, '_')}`;

  return (
    <div className="bg-background text-on-background min-h-screen font-sans relative overflow-hidden">
      {/* Overlays */}
      <div className="fixed inset-0 crt-overlay z-[100] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-violet-950/80 pointer-events-none" />
      <div className="fixed inset-0 z-0 retro-grid pointer-events-none" />

      {/* Fixed Header */}
      <header
        className="fixed top-0 w-full h-8 border-b-2 border-violet-400 bg-violet-950/80 backdrop-blur-md flex items-center px-4 z-50"
        style={{ boxShadow: 'inset 2px 2px 0px #b99fff, 0 0 15px rgba(185,159,255,0.3)' }}
      >
        <Link href="/" className="text-[10px] text-secondary font-bold uppercase hover:text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">arrow_back</span>
          BACK_TO_EXPLORER
        </Link>
        <div className="flex-1" />
        <span className="text-primary font-black tracking-widest uppercase text-xs">RAJUAN.EXE</span>
      </header>

      {/* Main */}
      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
        {/* Floating window */}
        <div
          className="w-full max-w-2xl bevel-raised bg-surface-container"
          style={{ boxShadow: '8px 8px 0px 0px rgba(26,28,28,0.5)' }}
        >
          {/* Window title bar */}
          <div className="bg-primary-container px-3 py-1 flex justify-between items-center">
            <span className="text-on-primary-container font-black text-xs uppercase tracking-widest truncate">
              {project.name.toUpperCase().replace(/\s/g, '_')}.EXE
            </span>
            <div className="flex gap-1 flex-shrink-0 ml-2">
              <div className="w-5 h-5 bevel-raised bg-primary flex items-center justify-center">
                <span className="block w-2 h-0.5 bg-on-primary" />
              </div>
              <Link href="/" className="w-5 h-5 bevel-raised bg-error flex items-center justify-center text-white text-[10px] font-bold">
                X
              </Link>
            </div>
          </div>

          {/* Window body */}
          <div className="p-6 bg-surface-container-low space-y-5">
            {/* Path */}
            <div className="font-mono text-[9px] text-violet-500/70 break-all">{path}</div>

            {/* Category + status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {project.category && (
                <span className="text-[10px] font-bold bg-indigo-900 text-violet-300 px-2 py-0.5 border border-violet-500/30 uppercase">
                  {project.category.name}
                </span>
              )}
              {isAdmin && !project.isPublic && (
                <span className="text-[10px] font-bold bg-amber-600 text-black px-2 py-0.5 uppercase">
                  PRIVATE
                </span>
              )}
              {isAdmin && project.url && !project.urlPublic && (
                <span className="text-[10px] font-bold bg-secondary text-on-secondary px-2 py-0.5 uppercase">
                  LINK_HIDDEN
                </span>
              )}
            </div>

            {/* Project name */}
            <h1 className="text-2xl font-black text-primary uppercase leading-tight">{project.name}</h1>

            {/* Description */}
            {project.description && (
              <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold bg-indigo-900 text-violet-300 px-2 py-0.5 border border-violet-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Visit button */}
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

            {/* Metadata panel */}
            <div className="bg-surface-container-high -mx-6 px-6 py-3 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">METADATA</span>
              <span className="font-mono text-[10px] text-on-surface-variant">
                TIMESTAMP:{' '}
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full h-12 bg-indigo-900/90 backdrop-blur-xl z-50 flex items-center px-2 gap-2 border-t-4 border-indigo-950"
        style={{ boxShadow: '0 -4px 20px rgba(0,227,253,0.2), inset 2px 2px 0px #b99fff' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 px-4 h-9 bg-violet-600 text-white font-black text-[10px] tracking-tight uppercase scale-95"
          style={{ boxShadow: 'inset 3px 3px 0px #38008d' }}
        >
          <span className="material-symbols-outlined text-lg">apps</span>
          START
        </Link>
        <div className="h-9 w-[2px] bg-indigo-950 mx-1" />
        <button
          className="flex items-center gap-2 px-3 h-9 bg-violet-600 text-white font-bold text-[10px] scale-95"
          style={{ boxShadow: 'inset 3px 3px 0px #38008d' }}
        >
          <span className="material-symbols-outlined text-sm">description</span>
          {project.name.toUpperCase().replace(/\s/g, '_').slice(0, 20)}.EXE
        </button>
      </footer>
    </div>
  );
}
