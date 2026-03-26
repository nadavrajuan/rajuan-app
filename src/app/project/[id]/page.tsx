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

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 px-6 py-5">
        <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
          ← Back to gallery
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {project.category && (
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            {project.category.name}
          </span>
        )}

        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0 mt-1">
              {!project.isPublic && (
                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  Private
                </span>
              )}
              {project.url && !project.urlPublic && (
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                  Link hidden
                </span>
              )}
            </div>
          )}
        </div>

        {project.description && (
          <p className="mt-6 text-neutral-300 leading-relaxed text-base whitespace-pre-wrap">
            {project.description}
          </p>
        )}

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 bg-neutral-800 text-neutral-400 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {showUrl && project.url && (
          <div className="mt-8">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-950 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
            >
              Visit project
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-neutral-800 text-xs text-neutral-600">
          Added {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </main>
    </div>
  );
}
