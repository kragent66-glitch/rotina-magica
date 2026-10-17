import { useEffect, useState } from 'react';

/**
 * Instalar com um toque: o Chrome do Android avisa (beforeinstallprompt) quando o app pode ir para a
 * tela inicial. Guardamos o aviso e mostramos um botão nosso, no lugar da faixa padrão do navegador.
 * No iPhone e em navegadores sem esse aviso, nada aparece.
 */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export function useInstall(): { canInstall: boolean; install: () => Promise<void> } {
  const [, rerender] = useState(0);
  useEffect(() => {
    const l = () => rerender((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    canInstall: deferred !== null,
    install: async () => {
      const e = deferred;
      if (!e) return;
      await e.prompt();
      await e.userChoice.catch(() => null);
      deferred = null;
      notify();
    },
  };
}
