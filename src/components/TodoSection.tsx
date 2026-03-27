'use client';

import { useState } from 'react';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  adminOnly: boolean;
}

export default function TodoSection({
  projectId,
  initialTodos,
  isAdmin,
}: {
  projectId: string;
  initialTodos: Todo[];
  isAdmin: boolean;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newText, setNewText] = useState('');
  const [newAdminOnly, setNewAdminOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  const visible = isAdmin ? todos : todos.filter((t) => !t.adminOnly);
  const doneCount = visible.filter((t) => t.done).length;

  if (visible.length === 0 && !isAdmin) return null;

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/projects/${projectId}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText.trim(), adminOnly: newAdminOnly }),
    });
    const todo = await res.json();
    setTodos((prev) => [...prev, todo]);
    setNewText('');
    setNewAdminOnly(false);
    setAdding(false);
  }

  async function toggleDone(todo: Todo) {
    if (!isAdmin) return;
    const res = await fetch(`/api/projects/${projectId}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done }),
    });
    const updated = await res.json();
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
  }

  async function deleteTodo(id: string) {
    await fetch(`/api/projects/${projectId}/todos/${id}`, { method: 'DELETE' });
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function copyAll() {
    const text = visible.map((t) => `[${t.done ? 'x' : ' '}] ${t.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border-t border-violet-500/20 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-sm">checklist</span>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">TODO_LIST</span>
          {visible.length > 0 && (
            <span className="font-mono text-[9px] text-outline">{doneCount}/{visible.length}</span>
          )}
        </div>
        {visible.length > 0 && (
          <button
            onClick={copyAll}
            className="text-[9px] font-bold text-on-surface-variant hover:text-primary uppercase flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">content_copy</span>
            {copied ? 'COPIED!' : 'COPY_ALL'}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {visible.length > 0 && (
        <div className="h-0.5 bg-surface-container-highest mb-3">
          <div
            className="h-0.5 bg-secondary transition-all duration-300"
            style={{ width: `${(doneCount / visible.length) * 100}%` }}
          />
        </div>
      )}

      {/* List */}
      <div className="space-y-1">
        {visible.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 px-2 py-1.5 bg-surface-container-high group"
          >
            <button
              onClick={() => toggleDone(todo)}
              disabled={!isAdmin}
              className={`w-4 h-4 bevel-pressed flex-shrink-0 flex items-center justify-center text-[10px] font-black transition-colors ${
                todo.done ? 'bg-secondary text-on-secondary' : 'bg-surface-container-highest'
              } ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {todo.done && '✓'}
            </button>
            <span
              className={`flex-1 text-xs leading-relaxed ${
                todo.done ? 'line-through text-outline' : 'text-on-surface'
              }`}
            >
              {todo.text}
            </span>
            {isAdmin && todo.adminOnly && (
              <span className="text-[8px] font-bold bg-amber-900/60 text-amber-300 px-1 uppercase flex-shrink-0">
                ADMIN
              </span>
            )}
            {isAdmin && (
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-error text-sm font-black hover:bg-error-container px-1 leading-none flex-shrink-0"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-[10px] text-outline uppercase text-center py-3 font-bold">
            NO_TODOS_YET
          </div>
        )}
      </div>

      {/* Add form (admin only) */}
      {isAdmin && (
        <form onSubmit={addTodo} className="mt-3 flex gap-2 items-center">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="add todo..."
            className="flex-1 bevel-pressed bg-surface-container-lowest text-on-surface text-xs font-mono px-2 py-1.5 focus:outline-none placeholder:text-outline placeholder:normal-case"
          />
          <label className="flex items-center gap-1 text-[9px] font-bold text-outline uppercase cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={newAdminOnly}
              onChange={(e) => setNewAdminOnly(e.target.checked)}
              className="accent-amber-400 w-3 h-3"
            />
            ADMIN
          </label>
          <button
            type="submit"
            disabled={adding || !newText.trim()}
            className="bevel-raised bg-secondary text-on-secondary px-3 py-1.5 text-[9px] font-black uppercase disabled:opacity-50 flex-shrink-0"
          >
            ADD
          </button>
        </form>
      )}
    </div>
  );
}
