import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toLocalDate } from '@/domain/dates';
import { createLocalRepositories } from './repositories/local';
import type { Repositories } from './repositories/types';

interface DataContextValue {
  repos: Repositories;
  /** Muda a cada gravação: telas que leem dados usam como dependência. */
  version: number;
  /** Executa uma escrita e avisa as telas para reler. */
  write: <T>(fn: (repos: Repositories) => T) => T;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children, repos: injected }: { children: ReactNode; repos?: Repositories }) {
  const [repos] = useState(() => {
    const r =
      injected ??
      createLocalRepositories({ storage: window.localStorage, newId: () => crypto.randomUUID(), now: () => new Date() });
    // O progresso conta a partir do primeiro uso do app.
    if (!r.settings.get<string | null>('trackingStartDate', null)) r.settings.set('trackingStartDate', toLocalDate(new Date()));
    return r;
  });
  const [version, setVersion] = useState(0);
  const write = useCallback(
    <T,>(fn: (r: Repositories) => T) => {
      const out = fn(repos);
      setVersion((v) => v + 1);
      return out;
    },
    [repos],
  );
  const value = useMemo(() => ({ repos, version, write }), [repos, version, write]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData fora do DataProvider');
  return ctx;
}
