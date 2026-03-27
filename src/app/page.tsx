'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ProjectCard, { CardProject } from '@/components/ProjectCard';
import ProjectModal from '@/components/ProjectModal';

interface Category {
  id: string;
  name: string;
}

function CyberClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-[10px] font-bold text-secondary">{time}</span>;
}

type Section = 'projects' | 'ideas';

export default function HomePage() {
  const [projects, setProjects] = useState<CardProject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState<Section>('projects');
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<CardProject | null>(null);

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('isIdea', section === 'ideas' ? 'true' : 'false');
    if (activeCategory) params.set('category', activeCategory);
    if (activeTag) params.set('tag', activeTag);
    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    setProjects(data);
  }, [section, activeCategory, activeTag]);

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

  function switchSection(s: Section) {
    setSection(s);
    setActiveCategory(null);
    setActiveTag(null);
  }

  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort();

  const activeCategoryName = categories.find((c) => c.id === activeCategory)?.name;
  const sectionLabel = section === 'ideas' ? 'IDEAS' : 'PROJECTS';
  const path = activeCategoryName
    ? `/ROOT/${sectionLabel}/${activeCategoryName.toUpperCase().replace(/\s/g, '_')}`
    : `/ROOT/${sectionLabel}/ALL`;

  const sidebarItem = (
    active: boolean,
    icon: string,
    label: string,
    onClick: () => void,
    indent = false
  ) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2 font-black text-xs uppercase text-left ${indent ? 'pl-8' : ''} ${
        active
          ? 'bg-violet-500 text-indigo-950'
          : 'text-violet-400 hover:border-2 hover:border-cyan-400'
      }`}
      style={active ? { boxShadow: 'inset -3px -3px 0px #38008d' } : {}}
    >
      <span
        className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      {label}
    </button>
  );

  return (
    <div className="bg-background text-on-background min-h-screen font-sans overflow-hidden">
      <div className="fixed inset-0 crt-overlay z-[100] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-indigo-950/50 via-transparent to-violet-950/80 pointer-events-none" />

      {/* Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          isAdmin={isAdmin}
          onClose={() => {
            setSelectedProject(null);
            window.history.pushState({}, '', '/');
          }}
        />
      )}

      {/* Fixed Header */}
      <header
        className="fixed top-0 w-full h-8 border-b-2 border-violet-400 bg-violet-950/80 backdrop-blur-md flex justify-between items-center px-4 z-50"
        style={{ boxShadow: 'inset 2px 2px 0px #b99fff, 0 0 15px rgba(185,159,255,0.3)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-primary font-black tracking-widest uppercase text-xs">RAJUAN.EXE</span>
          <nav className="hidden md:flex gap-4">
            <span className="text-secondary text-xs font-bold" style={{ textShadow: '0 0 5px #00e3fd' }}>
              {sectionLabel}
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link href="/admin/dashboard" className="text-[10px] text-primary hover:text-secondary font-bold uppercase">
                ADMIN
              </Link>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  setIsAdmin(false);
                  fetchProjects();
                }}
                className="text-[10px] text-error font-bold uppercase hover:bg-error-container px-1"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link href="/admin/login" className="text-[10px] text-outline hover:text-primary font-bold uppercase">
              LOGIN
            </Link>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="relative z-10 flex" style={{ height: 'calc(100vh - 5rem)', marginTop: '2rem' }}>

        {/* Sidebar */}
        <aside
          className="hidden md:flex flex-col w-64 border-r-4 border-indigo-900 bg-indigo-950 flex-shrink-0"
          style={{ boxShadow: '2px 0px 0px #b99fff' }}
        >
          {/* Operator */}
          <div className="px-4 py-5 border-b border-indigo-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bevel-raised bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-black text-lg">R</span>
              </div>
              <div>
                <div className="text-secondary font-black text-xs uppercase">OPERATOR_01</div>
                <div className="text-primary text-[10px] font-bold">
                  {isAdmin ? 'STATUS: ADMIN' : 'STATUS: VISITOR'}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="space-y-0.5 px-2">

              {/* PROJECTS section */}
              <button
                onClick={() => {
                  const next = !projectsOpen;
                  setProjectsOpen(next);
                  if (next) { setIdeasOpen(false); switchSection('projects'); }
                }}
                className="flex items-center gap-2 w-full px-3 py-2 font-black text-xs uppercase text-left text-violet-300 hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">
                  {projectsOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  folder_special
                </span>
                PROJECTS
              </button>

              {projectsOpen && (
                <div className="ml-2">
                  {sidebarItem(
                    section === 'projects' && !activeCategory,
                    'folder_open',
                    'ALL_PROJECTS',
                    () => switchSection('projects')
                  )}
                  {!loading && categories.map((cat) =>
                    sidebarItem(
                      section === 'projects' && activeCategory === cat.id,
                      'folder',
                      cat.name.toUpperCase().replace(/\s/g, '_'),
                      () => {
                        setSection('projects');
                        setActiveCategory(cat.id === activeCategory && section === 'projects' ? null : cat.id);
                        setActiveTag(null);
                      },
                      true
                    )
                  )}
                </div>
              )}

              {/* IDEAS section */}
              <button
                onClick={() => {
                  const next = !ideasOpen;
                  setIdeasOpen(next);
                  if (next) { setProjectsOpen(false); switchSection('ideas'); }
                }}
                className="flex items-center gap-2 w-full px-3 py-2 font-black text-xs uppercase text-left text-violet-300 hover:text-primary mt-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {ideasOpen ? 'expand_more' : 'chevron_right'}
                </span>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lightbulb
                </span>
                IDEAS
              </button>

              {ideasOpen && (
                <div className="ml-2">
                  {sidebarItem(
                    section === 'ideas' && !activeCategory,
                    'folder_open',
                    'ALL_IDEAS',
                    () => switchSection('ideas')
                  )}
                  {!loading && categories.map((cat) =>
                    sidebarItem(
                      section === 'ideas' && activeCategory === cat.id,
                      'folder',
                      cat.name.toUpperCase().replace(/\s/g, '_'),
                      () => {
                        setSection('ideas');
                        setActiveCategory(cat.id === activeCategory && section === 'ideas' ? null : cat.id);
                        setActiveTag(null);
                      },
                      true
                    )
                  )}
                </div>
              )}
            </div>
          </nav>

          {isAdmin && (
            <div className="p-4">
              <Link
                href="/admin/dashboard"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-error bevel-raised font-bold text-xs uppercase hover:bg-error-container"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                ADMIN_CONSOLE
              </Link>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-2 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 retro-grid pointer-events-none" />

          {loading ? (
            <div className="absolute inset-2 md:inset-8 flex items-center justify-center">
              <div className="text-secondary font-black text-xs uppercase animate-pulse tracking-widest">
                LOADING_{sectionLabel}...
              </div>
            </div>
          ) : (
            <div
              className="absolute inset-2 md:inset-8 bevel-raised bg-surface-container flex flex-col"
              style={{ boxShadow: '0 0 24px rgba(185,159,255,0.15)' }}
            >
              {/* Window title bar */}
              <div className="bg-primary-container px-3 py-1 flex justify-between items-center shrink-0">
                <span className="text-on-primary-container font-black text-xs uppercase tracking-widest">
                  {section === 'ideas' ? 'IDEA_EXPLORER.EXE' : 'PROJECT_EXPLORER.EXE'}
                </span>
                <div className="flex gap-1">
                  <div className="w-5 h-5 bevel-raised bg-primary flex items-center justify-center">
                    <span className="block w-2 h-0.5 bg-on-primary" />
                  </div>
                  <div className="w-5 h-5 bevel-raised bg-primary flex items-center justify-center">
                    <span className="block w-2 h-2 border border-on-primary" />
                  </div>
                  <div className="w-5 h-5 bevel-raised bg-error flex items-center justify-center text-white text-[10px] font-bold">
                    X
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-surface-container-low p-2 border-b-2 border-indigo-900 shrink-0 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-secondary px-1">
                  <span className="font-mono text-violet-500/80">PATH:</span>
                  <span className="text-primary font-mono tracking-wider truncate max-w-[200px]">{path}</span>
                </div>

                {/* Mobile section toggle */}
                <div className="md:hidden flex gap-1">
                  <button
                    onClick={() => { setProjectsOpen(true); setIdeasOpen(false); switchSection('projects'); }}
                    className={`text-[9px] font-black uppercase px-2 py-1 ${section === 'projects' ? 'bg-violet-500 text-indigo-950' : 'text-violet-400 border border-violet-500/30'}`}
                  >
                    PROJECTS
                  </button>
                  <button
                    onClick={() => { setIdeasOpen(true); setProjectsOpen(false); switchSection('ideas'); }}
                    className={`text-[9px] font-black uppercase px-2 py-1 ${section === 'ideas' ? 'bg-violet-500 text-indigo-950' : 'text-violet-400 border border-violet-500/30'}`}
                  >
                    IDEAS
                  </button>
                </div>

                {/* Mobile category select */}
                {categories.length > 0 && (
                  <div className="md:hidden flex items-center gap-2 text-[10px] font-bold text-secondary">
                    <select
                      className="bg-surface-container-lowest border border-secondary/30 text-secondary text-[10px] px-1 py-0.5 focus:outline-none uppercase"
                      value={activeCategory || ''}
                      onChange={(e) => {
                        setActiveCategory(e.target.value || null);
                        setActiveTag(null);
                      }}
                    >
                      <option value="">ALL_{sectionLabel}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tag filters */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                        className={`text-[9px] px-1.5 py-0.5 font-bold uppercase ${
                          activeTag === tag
                            ? 'bg-secondary text-on-secondary'
                            : 'border border-secondary/30 text-secondary/60 hover:border-secondary hover:text-secondary'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto bg-surface-container-highest p-4 scrollbar-pixel">
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl">
                      {section === 'ideas' ? 'lightbulb' : 'folder_off'}
                    </span>
                    <span className="font-bold text-xs uppercase">NO_OBJECTS_FOUND</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        isAdmin={isAdmin}
                        onSelect={(p) => {
                          setSelectedProject(p);
                          window.history.pushState({}, '', `/project/${p.id}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="bg-surface-container-low px-3 py-1 border-t-2 border-indigo-900 text-[9px] font-bold text-violet-400 flex justify-between items-center shrink-0">
                <span>{projects.length} OBJECT(S) FOUND</span>
                <span>SYSTEM: NOMINAL</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer Taskbar */}
      <footer
        className="fixed bottom-0 left-0 w-full h-12 bg-indigo-900/90 backdrop-blur-xl z-50 flex items-center px-2 gap-2 border-t-4 border-indigo-950"
        style={{ boxShadow: '0 -4px 20px rgba(0,227,253,0.2), inset 2px 2px 0px #b99fff' }}
      >
        <button
          className="flex items-center gap-2 px-4 h-9 bg-violet-600 text-white font-black text-[10px] tracking-tight uppercase scale-95"
          style={{ boxShadow: 'inset 3px 3px 0px #38008d' }}
        >
          <span className="material-symbols-outlined text-lg">apps</span>
          START
        </button>
        <div className="h-9 w-[2px] bg-indigo-950 mx-1" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setProjectsOpen(true); setIdeasOpen(false); switchSection('projects'); }}
            className={`flex items-center gap-2 px-3 h-9 font-bold text-[10px] border-r border-indigo-950 scale-95 ${section === 'projects' ? 'bg-violet-600 text-white' : 'text-violet-300 hover:bg-indigo-800'}`}
            style={section === 'projects' ? { boxShadow: 'inset 3px 3px 0px #38008d' } : {}}
          >
            <span className="material-symbols-outlined text-sm">folder_special</span>
            PROJECTS
          </button>
          <button
            onClick={() => { setIdeasOpen(true); setProjectsOpen(false); switchSection('ideas'); }}
            className={`flex items-center gap-2 px-3 h-9 font-bold text-[10px] border-r border-indigo-950 scale-95 ${section === 'ideas' ? 'bg-violet-600 text-white' : 'text-violet-300 hover:bg-indigo-800'}`}
            style={section === 'ideas' ? { boxShadow: 'inset 3px 3px 0px #38008d' } : {}}
          >
            <span className="material-symbols-outlined text-sm">lightbulb</span>
            IDEAS
          </button>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-3 h-9 text-violet-300 hover:bg-indigo-800 hover:text-cyan-200 font-bold text-[10px]"
            >
              <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
              ADMIN
            </Link>
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-3 bevel-pressed h-9 bg-indigo-950/50">
          <span className="material-symbols-outlined text-secondary text-sm">search</span>
          <div className="h-4 w-[1px] bg-indigo-900" />
          <CyberClock />
        </div>
      </footer>
    </div>
  );
}
