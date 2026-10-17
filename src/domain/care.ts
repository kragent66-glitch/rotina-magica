/**
 * Depois de usar, as próximas horas e o dia seguinte costumam ser os piores (humor muito baixo,
 * cansaço, culpa). O app entra em "modo cuidado": acolhe, lembra do básico e deixa o CVV à vista.
 */
export const CARE_WINDOW_MS = 36 * 60 * 60 * 1000;

export function isCareMode(lastUseAt: string | null, now: Date): boolean {
  if (!lastUseAt) return false;
  const elapsed = now.getTime() - new Date(lastUseAt).getTime();
  return elapsed >= 0 && elapsed < CARE_WINDOW_MS;
}

export const CARE_STEPS = [
  'Beba um copo grande de água agora',
  'Coma alguma coisa, mesmo sem fome',
  'Tente dormir ou pelo menos deitar no escuro',
  'Hoje não é dia de decidir nada grande nem de se cobrar',
] as const;

export const BEFORE_TAGS = [
  'Tédio',
  'Sozinho',
  'Bebi',
  'Estresse ou briga',
  'Tristeza',
  'Dinheiro ou PIX fácil',
  'Alguém ofereceu',
  'Cansaço',
] as const;

export const TURNING_POINTS = [
  'Ainda no trabalho',
  'No caminho de volta',
  'Ao chegar em casa',
  'Quando peguei o celular',
  'Quando bateu a vontade',
] as const;

const SUGGESTIONS: Record<string, string> = {
  Bebi: 'Se eu for beber, então deixo cartão e celular com PIX em casa e combino a hora de voltar',
  'Dinheiro ou PIX fácil': 'Se for fim de expediente, então o limite de PIX noturno já está baixo e não levo dinheiro',
  Sozinho: 'Se eu for ficar sozinho à noite, então combino de ver ou falar com alguém antes das 20h',
  Tédio: 'Se eu chegar em casa sem nada pra fazer, então saio por 20 minutos antes de sentar',
  'Alguém ofereceu': 'Se alguém oferecer, então respondo "hoje não, tô de boa" e saio de perto',
  Cansaço: 'Se eu estiver muito cansado, então como algo e deito cedo, sem decidir nada',
  'Estresse ou briga': 'Se o dia for pesado, então faço 10 minutos de exercício antes de qualquer coisa',
  Tristeza: 'Se eu estiver triste, então ligo ou mando áudio para alguém, ou para o CVV (188)',
};

/** Uma sugestão de ajuste para a próxima vez, a partir do que veio antes. A pessoa pode editar. */
export function suggestAdjustment(tags: readonly string[], turningPoint: string | null): string {
  // Primeiro o que corta acesso (álcool, dinheiro, oferta), depois o que preenche a noite.
  const priority = ['Bebi', 'Dinheiro ou PIX fácil', 'Alguém ofereceu', 'Sozinho', 'Tédio', 'Tristeza', 'Estresse ou briga', 'Cansaço'];
  const first = priority.find((t) => tags.includes(t));
  if (first) return SUGGESTIONS[first];
  if (turningPoint === 'Ainda no trabalho' || turningPoint === 'No caminho de volta') {
    return 'Se eu sair do trabalho, então já escolhi meu plano da noite antes de sair';
  }
  return 'Se a vontade vier, então abro o SOS antes de pegar o celular para qualquer outra coisa';
}
