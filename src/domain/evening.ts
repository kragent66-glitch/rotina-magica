/**
 * Planos de noite: o núcleo do app. A evidência mais forte depois das recompensas é tornar a vida
 * sem droga mais interessante (reforço comunitário, CRA). Para quem usa depois do trabalho,
 * sozinho e entediado, isso significa ter a noite decidida antes de chegar em casa.
 */

export interface Activity {
  id: string;
  label: string;
  /** Tira de casa: quebra o roteiro "chegar sozinho e entediado". */
  leavesHome: boolean;
  /** Envolve outras pessoas: o isolamento é gatilho. */
  social: boolean;
  /** Primeira ação concreta ao sair do trabalho. Começar é a parte difícil. */
  firstStep: string;
}

export const ACTIVITIES: readonly Activity[] = [
  { id: 'academia', label: 'Academia ou treino', leavesHome: true, social: false, firstStep: 'Ir direto do trabalho para a academia, sem passar em casa' },
  { id: 'corrida', label: 'Caminhar ou correr', leavesHome: true, social: false, firstStep: 'Trocar de roupa e sair para caminhar assim que chegar' },
  { id: 'esporte', label: 'Futebol ou outro esporte', leavesHome: true, social: true, firstStep: 'Combinar o jogo antes de sair do trabalho' },
  { id: 'amigos', label: 'Ver amigos ou família', leavesHome: true, social: true, firstStep: 'Mandar mensagem combinando o encontro antes de sair do trabalho' },
  { id: 'comer_fora', label: 'Comer fora', leavesHome: true, social: false, firstStep: 'Escolher o lugar e ir direto do trabalho' },
  { id: 'cozinhar', label: 'Cozinhar', leavesHome: false, social: false, firstStep: 'Passar no mercado no caminho e comprar o que vai fazer' },
  { id: 'jogar', label: 'Videogame', leavesHome: false, social: true, firstStep: 'Combinar uma partida online com alguém para um horário fixo' },
  { id: 'serie', label: 'Série ou filme', leavesHome: false, social: false, firstStep: 'Escolher o episódio ou filme ainda no trabalho' },
  { id: 'musica', label: 'Música (ouvir ou tocar)', leavesHome: false, social: false, firstStep: 'Separar a playlist ou o instrumento antes de sair' },
  { id: 'ler', label: 'Ler', leavesHome: false, social: false, firstStep: 'Ir para um café ou praça ler por 30 minutos antes de ir para casa' },
  { id: 'aprender', label: 'Aprender algo (curso, idioma)', leavesHome: false, social: false, firstStep: 'Deixar a aula aberta e marcar o horário de começar' },
  { id: 'criar', label: 'Criar algo (desenho, projeto)', leavesHome: false, social: false, firstStep: 'Deixar o material separado para começar ao chegar' },
];

export const REASONS: readonly string[] = [
  'Minha saúde',
  'Dinheiro',
  'Família',
  'Trabalho',
  'Dormir bem',
  'Ter controle da minha vida',
  'Gostar de mim de novo',
  'Não ter o dia seguinte destruído',
];

export interface EveningPlanDraft {
  title: string;
  firstStep: string;
  leavesHome: boolean;
  activityId: string | null;
}

/** Planos padrão quando a pessoa ainda não escolheu nada: os dois que mais tiram do roteiro de risco. */
const FALLBACK = ['corrida', 'comer_fora'];
const MAX_PLANS = 4;

function score(a: Activity): number {
  return (a.leavesHome ? 2 : 0) + (a.social ? 1 : 0);
}

/**
 * Monta os planos de noite a partir do que a pessoa gosta. Prioriza o que tira de casa e envolve
 * gente, porque o gatilho é chegar sozinho. Atividades escritas pela pessoa entram com um primeiro
 * passo genérico, que ela pode editar.
 */
export function buildEveningPlans(
  selectedIds: readonly string[],
  custom: readonly string[] = [],
): EveningPlanDraft[] {
  const chosen = ACTIVITIES.filter((a) => selectedIds.includes(a.id));
  const customTitles = custom.map((c) => c.trim()).filter(Boolean);
  const base = chosen.length || customTitles.length ? chosen : ACTIVITIES.filter((a) => FALLBACK.includes(a.id));

  const fromCatalog: EveningPlanDraft[] = [...base]
    .sort((a, b) => score(b) - score(a))
    .map((a) => ({ title: a.label, firstStep: a.firstStep, leavesHome: a.leavesHome, activityId: a.id }));
  const fromCustom: EveningPlanDraft[] = customTitles.map((title) => ({
    title,
    firstStep: 'Decidir ainda no trabalho a hora de começar',
    leavesHome: false,
    activityId: null,
  }));

  return [...fromCatalog, ...fromCustom].slice(0, MAX_PLANS);
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return TIME.test(value);
}

/** Normaliza entradas como "18", "18h", "1830" ou "18:3" para "HH:MM". Retorna null se não der. */
export function parseTime(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (!digits) return null;
  let h: number;
  let m = 0;
  if (input.includes(':')) {
    const [hs, ms = '0'] = input.split(':');
    h = Number(hs.replace(/\D/g, ''));
    m = Number(ms.replace(/\D/g, '') || '0');
  } else if (digits.length <= 2) {
    h = Number(digits);
  } else {
    h = Number(digits.slice(0, -2));
    m = Number(digits.slice(-2));
  }
  const out = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return isValidTime(out) ? out : null;
}
