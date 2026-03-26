'use client';

interface Category {
  id: string;
  name: string;
}

interface FilterBarProps {
  categories: Category[];
  tags: string[];
  activeCategory: string | null;
  activeTag: string | null;
  onCategoryChange: (id: string) => void;
  onTagChange: (tag: string) => void;
}

export default function FilterBar({
  categories,
  tags,
  activeCategory,
  activeTag,
  onCategoryChange,
  onTagChange,
}: FilterBarProps) {
  if (categories.length === 0 && tags.length === 0) return null;

  return (
    <div className="border-b border-neutral-800 px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {categories.length > 0 && (
        <>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`text-sm px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-white text-neutral-950 font-medium'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
          {tags.length > 0 && <div className="w-px h-5 bg-neutral-700 mx-1 flex-shrink-0" />}
        </>
      )}
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagChange(tag)}
          className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
            activeTag === tag
              ? 'bg-neutral-200 text-neutral-950 font-medium'
              : 'border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
