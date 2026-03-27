'use client';

import { useState, useRef } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

export default function TagInput({ value, onChange, suggestions }: TagInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/,/g, '');
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="relative">
      {/* Input area */}
      <div
        className="bevel-pressed bg-surface-container-lowest min-h-[38px] p-1.5 flex flex-wrap gap-1 items-center cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[9px] font-black bg-primary text-on-primary px-1.5 py-0.5 uppercase"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-on-primary/60 hover:text-on-primary font-black leading-none ml-0.5"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="bg-transparent border-none focus:outline-none text-on-surface text-[10px] font-mono uppercase flex-1 min-w-[80px] placeholder:text-outline placeholder:normal-case placeholder:text-[10px]"
          placeholder={value.length === 0 ? 'type tag, press enter...' : ''}
        />
      </div>

      {/* Autocomplete dropdown */}
      {open && (filtered.length > 0 || (input.trim() && !value.includes(input.trim().toLowerCase()))) && (
        <div className="absolute top-full left-0 right-0 z-50 bevel-raised bg-surface-container-high mt-0.5 max-h-40 overflow-y-auto scrollbar-pixel">
          {/* "Add new" option if input isn't already a suggestion */}
          {input.trim() && !suggestions.includes(input.trim().toLowerCase()) && !value.includes(input.trim().toLowerCase()) && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(input);
              }}
              className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-secondary hover:bg-secondary hover:text-on-secondary uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant"
            >
              <span className="material-symbols-outlined text-xs">add</span>
              ADD: #{input.trim().toLowerCase()}
            </button>
          )}
          {/* Existing tag matches */}
          {filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(tag);
              }}
              className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-primary hover:bg-primary hover:text-on-primary uppercase tracking-wider flex items-center gap-2"
            >
              <span className="text-outline">#</span>
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
