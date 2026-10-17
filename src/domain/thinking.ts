/**
 * Desatar um pensamento: registro de pensamentos da terapia cognitivo-comportamental (Beck; as armadilhas
 * são as distorções de Burns, mais a "permissão" típica da dependência), organizado em degraus: primeiro
 * o corpo, depois a emoção, o pensamento e, por fim, o que a melhor versão da pessoa faria (arquivo HABIL).
 */
export interface ThinkingTrap {
  id: string;
  name: string;
  /** Como esse pensamento costuma soar. */
  example: string;
  /** Pergunta que abre um buraco no pensamento. */
  question: string;
}

export const TRAPS: readonly ThinkingTrap[] = [
  { id: 'permissao', name: 'Dar permissão', example: '"Só hoje. Eu mereço."', question: 'O que eu mereço de verdade: esta noite ou acordar bem amanhã?' },
  { id: 'tudo_ou_nada', name: 'Tudo ou nada', example: '"Já usei ontem, então tanto faz."', question: 'Existe um meio-termo? Um tropeço não apaga o caminho feito.' },
  { id: 'tempestade', name: 'Fazer tempestade', example: '"Não vou aguentar essa vontade."', question: 'Já aguentei antes? A vontade sobe, chega no pico e passa.' },
  { id: 'adivinhar', name: 'Adivinhar o pior', example: '"Vou ficar mal a noite inteira."', question: 'Que prova eu tenho disso? Já aconteceu sempre assim?' },
  { id: 'sempre_nunca', name: 'Sempre e nunca', example: '"Eu nunca vou conseguir parar."', question: 'É sempre mesmo? Lembre de uma vez em que deu certo.' },
  { id: 'so_o_ruim', name: 'Só ver o ruim', example: '"O dia foi todo uma porcaria."', question: 'O que deu certo hoje, mesmo que pequeno?' },
  { id: 'desmerecer', name: 'Desmerecer o bom', example: '"Três dias sem usar não é nada."', question: 'Se um amigo fizesse isso, eu diria que não é nada?' },
  { id: 'sentir_e_fato', name: 'Achar que sentir é fato', example: '"Sinto que preciso, então preciso."', question: 'Vontade não é ordem. O que os fatos dizem?' },
  { id: 'deveria', name: '"Eu deveria"', example: '"Eu deveria ser mais forte que isso."', question: 'Troque "eu deveria" por "eu gostaria". O que muda?' },
  { id: 'rotulo', name: 'Colar rótulos', example: '"Sou um fracassado."', question: 'Sou uma pessoa enfrentando algo difícil. O que eu fiz hoje a meu favor?' },
  { id: 'culpa', name: 'Culpa toda minha ou toda deles', example: '"A culpa é do meu chefe, então tanto faz."', question: 'Que parte está nas minhas mãos agora?' },
];

export const BODY_NEEDS = ['Fome', 'Sede', 'Sono', 'Cansaço', 'Dor', 'Ressaca', 'Tudo bem'] as const;
export const FEELINGS = ['Ansiedade', 'Raiva', 'Tristeza', 'Tédio', 'Solidão', 'Vergonha', 'Agitação', 'Alegria'] as const;

/** Necessidade do corpo vem antes: com fome ou sem dormir, qualquer vontade fica maior. */
export function bodyTip(needs: readonly string[]): string | null {
  const real = needs.filter((n) => n !== 'Tudo bem');
  if (!real.length) return null;
  const tips: Record<string, string> = {
    Fome: 'coma algo',
    Sede: 'beba água',
    Sono: 'deite um pouco, mesmo 20 minutos',
    Cansaço: 'descanse antes de decidir qualquer coisa',
    Dor: 'cuide da dor (remédio que você já usa, compressa, banho)',
    Ressaca: 'água, comida leve e descanso',
  };
  return `Primeiro o corpo: ${real.map((n) => tips[n]).join(', ')}. Com o corpo cuidado, a vontade costuma diminuir.`;
}

/** Frequência das armadilhas, da mais comum para a menos comum. */
export function trapCounts(records: readonly { traps: readonly string[] }[]): { trap: ThinkingTrap; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of records) for (const t of r.traps) counts.set(t, (counts.get(t) ?? 0) + 1);
  return TRAPS.filter((t) => counts.has(t.id))
    .map((trap) => ({ trap, count: counts.get(trap.id)! }))
    .sort((a, b) => b.count - a.count);
}
