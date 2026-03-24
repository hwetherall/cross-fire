import type { ResolutionStatus } from '@/lib/types';

const statusStyles: Record<ResolutionStatus, { bg: string; text: string }> = {
  resolved: { bg: '#EAF3DE', text: '#3B6D11' },
  unresolved: { bg: '#FAEEDA', text: '#854F0B' },
  escalated: { bg: '#EEEDFE', text: '#534AB7' },
};

export function StatusBadge({ status }: { status: ResolutionStatus }) {
  const style = statusStyles[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}
