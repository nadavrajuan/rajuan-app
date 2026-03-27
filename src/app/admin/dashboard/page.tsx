'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TagInput from '@/components/TagInput';

interface Category {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  longDescription: string | null;
  url: string | null;
  imageUrl: string | null;
  urlPublic: boolean;
  isPublic: boolean;
  isIdea: boolean;
  tags: string[];
  category: Category | null;
  categoryId: string | null;
}

const emptyForm = {
  name: '',
  description: '',
  longDescription: '',
  url: '',
  imageUrl: '',
  urlPublic: true,
  isPublic: true,
  isIdea: false,
  tags: [] as string[],
  categoryId: '',
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<'projects' | 'ideas' | 'categories'>('projects');

  async function handleGenerateImage() {
    if (!form.description && !form.name) {
      setUploadError('Add a name or description first');
      return;
    }
    setGenerating(true);
    setUploadError('');
    const res = await fetch('/api/admin/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, description: form.description || form.longDescription }),
    });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } else {
      setUploadError(data.error ?? 'Generation failed');
    }
    setGenerating(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (res.ok) {
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } else {
      setUploadError(data.error ?? 'Upload failed');
    }
    setUploading(false);
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  }

  async function load() {
    const [projs, cats] = await Promise.all([
      fetch('/api/projects?all=true').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]);
    setProjects(projs);
    setCategories(cats);
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((me) => {
        if (!me.isAdmin) router.push('/admin/login');
        else load();
      });
  }, [router]);

  function startEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      longDescription: p.longDescription || '',
      url: p.url || '',
      isIdea: p.isIdea,
      imageUrl: p.imageUrl || '',
      urlPublic: p.urlPublic,
      isPublic: p.isPublic,
      tags: p.tags,
      categoryId: p.categoryId || '',
    });
    setShowForm(true);
    setActiveSection('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      longDescription: form.longDescription || null,
      url: form.url || null,
      imageUrl: form.imageUrl || null,
      urlPublic: form.urlPublic,
      isPublic: form.isPublic,
      isIdea: form.isIdea,
      tags: form.tags,
      categoryId: form.categoryId || null,
    };

    if (editingId) {
      await fetch(`/api/projects/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    setSaving(false);
    await load();
  }

  async function deleteProject(id: string) {
    if (!confirm('DELETE THIS FILE?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    await load();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory.trim() }),
    });
    setNewCategory('');
    await load();
  }

  async function deleteCategory(id: string) {
    if (!confirm('DELETE THIS DIRECTORY?')) return;
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const inputClass =
    'w-full px-3 py-2 bevel-pressed bg-surface-container-lowest text-on-surface text-xs font-mono focus:outline-none uppercase placeholder:text-outline placeholder:normal-case';

  return (
    <div className="bg-background text-on-background min-h-screen font-sans overflow-hidden">
      {/* Overlays */}
      <div className="fixed inset-0 crt-overlay z-[100] pointer-events-none" />

      {/* Fixed Header — FILE_EXPLORER style */}
      <header
        className="fixed top-0 w-full h-10 bg-primary-container border-b-4 border-primary-dim flex justify-between items-center w-full px-2 z-50"
        style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-lg font-black text-on-primary-container uppercase tracking-tight">
            FILE_EXPLORER_V1.0
          </span>
          <nav className="hidden md:flex items-center gap-1">
            <button className="bg-secondary text-black px-3 py-1 text-xs bevel-raised font-bold uppercase">
              FILE
            </button>
            <button className="text-on-primary-container px-3 py-1 text-xs font-bold uppercase hover:bg-primary-dim hover:text-white">
              EDIT
            </button>
            <button className="text-on-primary-container px-3 py-1 text-xs font-bold uppercase hover:bg-primary-dim hover:text-white">
              VIEW
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <div className="bevel-pressed bg-surface-container-lowest border-2 border-primary-container p-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">search</span>
            <input
              className="bg-transparent border-none text-[10px] text-primary focus:ring-0 p-0 w-24 uppercase placeholder:text-primary/40 focus:outline-none"
              placeholder="PATH_SEARCH..."
              type="text"
            />
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="material-symbols-outlined text-on-primary-container hover:text-error p-1"
          >
            power_settings_new
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div
        className="flex"
        style={{ height: 'calc(100vh - 40px - 48px)', marginTop: '40px' }}
      >
        {/* Sidebar — tree view */}
        <aside className="bg-black font-sans text-[10px] uppercase font-bold tracking-widest w-64 border-r-4 border-primary-dim flex flex-col pt-4 gap-2 z-40 overflow-y-auto flex-shrink-0">
          {/* Operator */}
          <div className="px-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-primary border-2 border-white flex items-center justify-center bevel-raised">
                <span className="material-symbols-outlined text-on-primary text-sm">person</span>
              </div>
              <div>
                <div className="text-primary font-bold">OPERATOR_01</div>
                <div className="text-secondary text-[8px] opacity-80">ROOT_ACCESS</div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {/* Projects — active */}
            <div
              className={`px-4 py-2 flex items-center gap-3 cursor-pointer ${
                activeSection === 'projects'
                  ? 'bg-primary text-on-primary border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/60'
                  : 'text-secondary opacity-80 hover:bg-primary-dim/20'
              }`}
              onClick={() => setActiveSection('projects')}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                folder_special
              </span>
              <span>PROJECTS ({projects.filter((p) => !p.isIdea).length})</span>
            </div>

            {/* Sub-items: categories */}
            {activeSection === 'projects' && categories.length > 0 && (
              <div className="pl-8 space-y-1 text-secondary opacity-80">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 hover:bg-primary-dim/20 p-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">subdirectory_arrow_right</span>
                    <span className="material-symbols-outlined text-sm">folder</span>
                    <span>{cat.name.toUpperCase().replace(/\s/g, '_')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Ideas section */}
            <div
              className={`px-4 py-2 flex items-center gap-3 cursor-pointer ${
                activeSection === 'ideas'
                  ? 'bg-primary text-on-primary border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/60'
                  : 'text-secondary opacity-80 hover:bg-primary-dim/20'
              }`}
              onClick={() => { setActiveSection('ideas'); setShowForm(false); }}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                lightbulb
              </span>
              <span>IDEAS ({projects.filter((p) => p.isIdea).length})</span>
            </div>

            {/* Categories section */}
            <div
              className={`px-4 py-2 flex items-center gap-3 cursor-pointer ${
                activeSection === 'categories'
                  ? 'bg-primary text-on-primary border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/60'
                  : 'text-secondary opacity-80 hover:bg-primary-dim/20'
              }`}
              onClick={() => setActiveSection('categories')}
            >
              <span className="material-symbols-outlined text-sm">lan</span>
              <span>DIRECTORIES</span>
            </div>

            <Link
              href="/"
              className="text-secondary opacity-80 px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-primary-dim/20"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>GALLERY</span>
            </Link>

            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="text-error opacity-80 px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-error-container/20 w-full text-left"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>LOGOUT</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-surface-container p-4 overflow-y-auto">
          {/* Window frame */}
          <div className="bg-surface-container-low bevel-raised min-h-full flex flex-col">
            {/* Inner toolbar */}
            <div className="bg-surface-container-high p-2 flex items-center justify-between border-b-2 border-outline-variant">
              <div className="flex items-center gap-4 text-[10px] font-bold text-primary/60">
                <Link href="/" className="flex items-center gap-1 hover:text-secondary cursor-pointer">
                  <span className="material-symbols-outlined text-xs">arrow_upward</span>
                  <span>PARENT_DIR</span>
                </Link>
                <div className="h-4 w-[2px] bg-outline-variant" />
                <div className="text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">folder_open</span>
                  <span>
                    C:\PROJECTS\{activeSection === 'categories' ? 'DIRECTORIES' : 'ACTIVE_MODS'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(activeSection === 'projects' || activeSection === 'ideas') && !showForm && (
                  <button
                    onClick={() => {
                      setForm({ ...emptyForm, isIdea: activeSection === 'ideas' });
                      setEditingId(null);
                      setShowForm(true);
                    }}
                    className="bevel-raised bg-secondary text-on-secondary px-3 py-1 text-[10px] font-black uppercase"
                  >
                    + NEW_{activeSection === 'ideas' ? 'IDEA' : 'FILE'}
                  </button>
                )}
                {showForm && (
                  <button
                    onClick={resetForm}
                    className="bevel-pressed bg-surface-container-highest text-primary px-3 py-1 text-[10px] font-black uppercase"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 p-4 space-y-4">

              {/* ── PROJECTS / IDEAS SECTION ── */}
              {(activeSection === 'projects' || activeSection === 'ideas') && (
                <>
                  {/* Project form */}
                  {showForm && (
                    <div className="bevel-raised bg-surface-container-high p-4 mb-4">
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">edit_document</span>
                        {editingId ? 'EDIT_FILE.EXE' : 'NEW_FILE.EXE'}
                      </div>
                      <form onSubmit={saveProject} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              PROJECT_NAME *
                            </label>
                            <input
                              required
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className={inputClass}
                              placeholder="project name"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              URL
                            </label>
                            <input
                              type="url"
                              value={form.url}
                              onChange={(e) => setForm({ ...form, url: e.target.value })}
                              placeholder="https://"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              SHORT_DESCRIPTION
                            </label>
                            <textarea
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                              rows={3}
                              className={`${inputClass} resize-none`}
                              placeholder="10-word summary..."
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              LONG_DESCRIPTION
                            </label>
                            <textarea
                              value={form.longDescription}
                              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                              rows={3}
                              className={`${inputClass} resize-none`}
                              placeholder="full description..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              DIRECTORY
                            </label>
                            <select
                              value={form.categoryId}
                              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                              className={inputClass}
                            >
                              <option value="">— NONE —</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                              IMAGE
                            </label>
                            {/* Preview */}
                            {form.imageUrl && (
                              <div className="mb-2 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={form.imageUrl}
                                  alt="preview"
                                  className="w-full h-24 object-cover bevel-pressed"
                                />
                                <button
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                                  className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-[10px] font-black flex items-center justify-center bevel-raised"
                                >
                                  X
                                </button>
                              </div>
                            )}
                            {/* Image actions */}
                            <div className="flex gap-2">
                              <label className={`flex-1 flex items-center justify-center gap-1 py-2 cursor-pointer font-black text-[10px] uppercase tracking-widest ${uploading ? 'bevel-pressed bg-surface-container-high text-outline' : 'bevel-raised bg-secondary text-on-secondary hover:brightness-110'}`}>
                                <span className="material-symbols-outlined text-sm">upload</span>
                                {uploading ? 'UPLOADING...' : 'UPLOAD'}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  onChange={handleImageUpload}
                                  disabled={uploading || generating}
                                  className="hidden"
                                />
                              </label>
                              <button
                                type="button"
                                onClick={handleGenerateImage}
                                disabled={uploading || generating}
                                className={`flex-1 flex items-center justify-center gap-1 py-2 font-black text-[10px] uppercase tracking-widest ${generating ? 'bevel-pressed bg-surface-container-high text-outline' : 'bevel-raised bg-violet-700 text-white hover:brightness-110'}`}
                              >
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                {generating ? 'GENERATING...' : 'AI_GEN'}
                              </button>
                            </div>
                            {uploadError && (
                              <p className="text-[9px] text-error font-bold uppercase mt-1">{uploadError}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] text-on-surface-variant mb-1 block font-bold uppercase tracking-widest">
                            TAGS
                          </label>
                          <TagInput
                            value={form.tags}
                            onChange={(tags) => setForm({ ...form, tags })}
                            suggestions={Array.from(new Set(projects.flatMap((p) => p.tags))).sort()}
                          />
                          <p className="text-[8px] text-outline mt-1 uppercase">
                            Type + enter to add · click suggestion to reuse · backspace to remove
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-on-surface-variant uppercase">
                            <input
                              type="checkbox"
                              checked={form.isPublic}
                              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                              className="accent-primary w-4 h-4"
                            />
                            PUBLIC_FILE
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-on-surface-variant uppercase">
                            <input
                              type="checkbox"
                              checked={form.urlPublic}
                              onChange={(e) => setForm({ ...form, urlPublic: e.target.checked })}
                              className="accent-primary w-4 h-4"
                            />
                            URL_PUBLIC
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-violet-300 uppercase">
                            <input
                              type="checkbox"
                              checked={form.isIdea}
                              onChange={(e) => setForm({ ...form, isIdea: e.target.checked })}
                              className="accent-violet-400 w-4 h-4"
                            />
                            IS_IDEA
                          </label>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="bevel-raised bg-primary text-on-primary px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary-container disabled:opacity-50 flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">save</span>
                          {saving ? 'SAVING...' : editingId ? 'UPDATE_FILE' : 'CREATE_FILE'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Project list */}
                  <div className="space-y-2">
                    {projects.filter((p) => (activeSection === 'ideas' ? p.isIdea : !p.isIdea)).length === 0 ? (
                      <div className="text-center py-8 text-on-surface-variant text-xs font-bold uppercase">
                        NO FILES DETECTED
                      </div>
                    ) : (
                      projects.filter((p) => (activeSection === 'ideas' ? p.isIdea : !p.isIdea)).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 bevel-raised bg-surface-container-high px-3 py-2 hover:bg-surface-container-highest"
                        >
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            description
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-on-surface uppercase truncate">
                                {p.name.replace(/\s/g, '_')}
                              </span>
                              {!p.isPublic && (
                                <span className="text-[8px] px-1 py-0.5 bg-amber-600 text-black font-bold uppercase flex-shrink-0">
                                  PRIVATE
                                </span>
                              )}
                              {p.url && !p.urlPublic && (
                                <span className="text-[8px] px-1 py-0.5 bg-secondary text-on-secondary font-bold uppercase flex-shrink-0">
                                  LINK_HIDDEN
                                </span>
                              )}
                            </div>
                            {p.category && (
                              <span className="text-[9px] text-on-surface-variant font-mono">
                                /{p.category.name.toUpperCase().replace(/\s/g, '_')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              href={`/project/${p.id}`}
                              target="_blank"
                              className="text-[9px] text-secondary hover:text-primary font-bold uppercase"
                            >
                              VIEW
                            </Link>
                            <button
                              onClick={() => startEdit(p)}
                              className="text-[9px] text-primary hover:text-secondary font-bold uppercase"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => deleteProject(p.id)}
                              className="text-[9px] text-error hover:text-on-error font-bold uppercase"
                            >
                              DEL
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* ── CATEGORIES SECTION ── */}
              {activeSection === 'categories' && (
                <div className="space-y-4">
                  {/* Add category form */}
                  <div className="bevel-raised bg-surface-container-high p-4">
                    <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">create_new_folder</span>
                      NEW_DIRECTORY
                    </div>
                    <form onSubmit={addCategory} className="flex gap-2">
                      <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="directory name"
                        className={`flex-1 ${inputClass}`}
                      />
                      <button
                        type="submit"
                        className="bevel-raised bg-secondary text-on-secondary px-4 py-2 text-[10px] font-black uppercase"
                      >
                        MKDIR
                      </button>
                    </form>
                  </div>

                  {/* Category list */}
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <div className="text-center py-8 text-on-surface-variant text-xs font-bold uppercase">
                        NO DIRECTORIES DETECTED
                      </div>
                    ) : (
                      categories.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 bevel-raised bg-surface-container-high px-3 py-2"
                        >
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            folder
                          </span>
                          <span className="flex-1 text-xs font-black text-on-surface uppercase">
                            {c.name.replace(/\s/g, '_')}
                          </span>
                          <button
                            onClick={() => deleteCategory(c.id)}
                            className="text-[9px] text-error hover:text-on-error font-bold uppercase"
                          >
                            RMDIR
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status bar */}
            <div className="mt-auto bg-surface-container-highest p-1 flex justify-between text-[9px] font-bold text-primary/60 border-t-2 border-outline-variant">
              <div className="flex gap-4">
                <span>{projects.length} FILES DETECTED</span>
                <span>{categories.length} DIRECTORIES</span>
              </div>
              <div className="flex gap-4">
                <span>STATUS: SYSTEM_READY</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Footer — command prompt style */}
      <footer
        className="fixed bottom-0 w-full h-12 bg-[#1a1a1a] z-50 border-t-4 border-primary-dim flex items-center px-4 gap-4"
        style={{ boxShadow: '0 -4px 10px rgba(185,159,255,0.2)' }}
      >
        <div className="bevel-pressed bg-secondary text-black p-1 flex items-center gap-2 cursor-pointer hover:brightness-125">
          <span className="material-symbols-outlined text-sm">grid_view</span>
          <span className="text-[9px] font-black uppercase">START</span>
        </div>
        <div className="flex-1 flex items-center gap-4 bevel-pressed bg-surface-container-lowest border-2 border-primary-container/40 h-8 px-3">
          <span className="text-secondary font-black text-sm">{'>'}</span>
          <span className="text-primary text-[10px] font-mono tracking-widest uppercase">
            C:\PROJECTS\ACTIVE_MODS
          </span>
          <div className="w-2 h-4 bg-primary animate-pulse ml-1" />
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-primary p-1 flex items-center gap-1 hover:brightness-125 text-[9px] font-bold uppercase">
            <span className="material-symbols-outlined text-sm">home</span>
            <span className="hidden md:block">GALLERY</span>
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="text-error p-1 flex items-center gap-1 hover:brightness-125 text-[9px] font-bold uppercase"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden md:block">LOGOUT</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
