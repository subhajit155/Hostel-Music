import React from 'react';
import { CATEGORIES } from '../data/songs';
import { useMusicContext } from '../context/MusicContext';

const CategoryTabs = () => {
  const { selectedCategory, dispatch } = useMusicContext();

  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto tab-scroll pb-2 px-1">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`tab-${cat.id}`}
              onClick={() => dispatch({ type: 'SET_CATEGORY', value: cat.id })}
              aria-selected={active}
              role="tab"
              className={`
                flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full
                text-sm font-medium transition-all duration-200 flex-shrink-0
                ${active
                  ? 'bg-truck-red text-white shadow-glow-red scale-105'
                  : 'bg-surface-2 text-white/60 hover:bg-surface-3 hover:text-white border border-border-muted'
                }
              `}
            >
              <span className="text-base leading-none">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
      <div className="truck-divider mt-2" />
    </div>
  );
};

export default CategoryTabs;
