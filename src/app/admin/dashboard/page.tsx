'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  categoryId: string | null;
}

const emptyForm = {
  name: '',
  description: '',
  url: '',
  urlPublic: true,
  isPublic: true,
  tags: '',
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

  async function load() {
    const [projs, cats] = await Promise.all([
      fetch('/api/projects').then((r) => r.json()),
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
      url: p.url || '',
      urlPublic: p.urlPublic,
      isPublic: p.isPublic,
      tags: p.tags.join(', '),
      categoryId: p.categoryId || '',
    });
    setShowForm(true);
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
      url: form.url || null,
      urlPublic: form.urlPublic,
      isPublic: form.isPublic,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
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
    if (!confirm('Delete this project?')) return;
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
    if (!confirm('Delete this category?')) return;
    await fetch('/api/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">
            ← Gallery
          </Link>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-4 py-2 bg-white text-neutral-950 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              + New project
            </button>
          )}
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Project Form */}
        {showForm && (
          <section className="bg-neutral-900 border border-neutral-700 rounded-xl p-6">
            <h2 className="text-base font-semibold mb-5">
              {editingId ? 'Edit project' : 'Add project'}
            </h2>
            <form onSubmit={saveProject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">URL</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                  >
                    <option value="">— none —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block">
                    Tags (comma-separated)
                  </label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="react, api, open-source"
                    className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded accent-white"
                  />
                  <span className="text-sm">
                    Public{' '}
                    <span className="text-neutral-500 text-xs">(visible to everyone)</span>
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.urlPublic}
                    onChange={(e) => setForm({ ...form, urlPublic: e.target.checked })}
                    className="w-4 h-4 rounded accent-white"
                  />
                  <span className="text-sm">
                    URL public{' '}
                    <span className="text-neutral-500 text-xs">
                      (uncheck to hide link from visitors)
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-white text-neutral-950 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Add project'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Projects list */}
        <section>
          <h2 className="text-sm font-medium text-neutral-400 mb-4">
            Projects ({projects.length})
          </h2>
          <div className="space-y-2">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    {!p.isPublic && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex-shrink-0">
                        Private
                      </span>
                    )}
                    {p.url && !p.urlPublic && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex-shrink-0">
                        Link hidden
                      </span>
                    )}
                  </div>
                  {p.category && (
                    <span className="text-xs text-neutral-500">{p.category.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/project/${p.id}`}
                    target="_blank"
                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-neutral-600 py-4">No projects yet.</p>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-neutral-800 pt-8">
          <h2 className="text-sm font-medium text-neutral-400 mb-4">Categories</h2>
          <form onSubmit={addCategory} className="flex gap-2 mb-4">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm transition-colors"
            >
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-full text-sm"
              >
                {c.name}
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-neutral-500 hover:text-red-400 transition-colors text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
