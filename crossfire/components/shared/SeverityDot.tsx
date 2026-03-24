import type { ObjectionSeverity } from '@/lib/types';

const dotColors: Record<ObjectionSeverity, string> = {
  critical: '#E24B4A',
  high: '#EF9F27',
  medium: '#BA7517',
  low: '#888780',
};

export function SeverityDot({ severity }: { severity: ObjectionSeverity }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full shrink-0"
      style={{ backgroundColor: dotColors[severity] }}
      title={severity}
    />
  );
}
