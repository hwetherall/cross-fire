import type { ObjectionCategory } from '@/lib/types';

const categoryStyles: Record<ObjectionCategory, { bg: string; text: string }> = {
  gap: { bg: '#FAECE7', text: '#993C1D' },
  error: { bg: '#FCEBEB', text: '#A32D2D' },
  disagreement: { bg: '#EEEDFE', text: '#534AB7' },
  clarification: { bg: '#E1F5EE', text: '#0F6E56' },
  cosmetic: { bg: '#FAEEDA', text: '#854F0B' },
};

export function CategoryBadge({ category }: { category: ObjectionCategory }) {
  const style = categoryStyles[category];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {category}
    </span>
  );
}
