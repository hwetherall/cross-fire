import type { TimelineEntry } from '@/components/dashboard/buildIssueList';

export function TimelineStrip({ timeline }: { timeline: TimelineEntry[] }) {
  const parts = timeline.map((entry) => {
    if (entry.redAction === 'accepted') {
      return `Red accepted R${entry.round}`;
    }
    const redLabel =
      entry.redAction === 'raised' ? `Raised R${entry.round}` : `Red re-raised R${entry.round}`;
    const blueLabel =
      entry.blueAction === 'none' || entry.blueAction === 'n/a'
        ? ''
        : `Blue ${entry.blueAction} R${entry.round}`;
    return blueLabel ? `${redLabel} → ${blueLabel}` : redLabel;
  });

  return (
    <p className="text-[11px] text-gray-500 leading-relaxed">
      {parts.join(' → ')}
    </p>
  );
}
