import type { ReactNode } from 'react';

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`chip${selected ? ' chip--on' : ''}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  );
}
