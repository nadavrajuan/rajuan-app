'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import FilterBar from '@/components/FilterBar';

interface Category {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  urlPublic: boolean;
  isPublic: boolean;
  tags: string[];
  category: Category | null;
  createdAt: string;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    if (activeTag) params.set('tag', activeTag);
    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    setProjects(data);
  }, [activeCategory, activeTag]);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([me, cats]) => {
      setIsAdmin(me.isAdmin);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rajuan</h1>
          <p className="text-sm text-neutral-400 mt-0.5">Projects &amp; experiments</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className="text-sm px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  setIsAdmin(false);
                  fetchProjects();
                }}
                className="text-sm px-3 py-1.5 text-neutral-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          )}
          {!isAdmin && (
            <Link
              href="/admin/login"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Filters */}
      <FilterBar
        categories={categories}
        tags={allTags}
        activeCategory={activeCategory}
        activeTag={activeTag}
        onCategoryChange={(id) => {
          setActiveCategory(id === activeCategory ? null : id);
          setActiveTag(null);
        }}
        onTagChange={(tag) => {
          setActiveTag(tag === activeTag ? null : tag);
          setActiveCategory(null);
        }}
      />

      {/* Grid */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-24 text-neutral-500">
            {activeCategory || activeTag ? 'No projects match this filter.' : 'No projects yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
