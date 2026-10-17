import { createLocalRepositories, type KeyValueStorage } from './repositories/local';

export function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

let seq = 0;
/** Repositórios em memória para testes. */
export function createTestRepositories(storage = memoryStorage(), now = () => new Date('2026-10-16T12:00:00')) {
  return createLocalRepositories({ storage, newId: () => `id-${++seq}`, now });
}
