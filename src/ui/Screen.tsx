import type { ReactNode } from 'react';

/** Tela com botão de voltar no topo. */
export function Screen({ title, onBack, children, className }: { title?: string; onBack?: () => void; children: ReactNode; className?: string }) {
  return (
    <main className={`screen${className ? ` ${className}` : ''}`}>
      {onBack && (
        <button type="button" className="link" onClick={onBack}>
          ← Voltar
        </button>
      )}
      {title && <h1>{title}</h1>}
      {children}
    </main>
  );
}
