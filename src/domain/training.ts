/**
 * Treino diário: o "eu calmo" pratica uma técnica por dia, em 3 minutos. O que ele escreve no treino
 * vira o kit que o SOS mostra na hora da vontade. Treinar antes faz a técnica estar à mão depois
 * (prevenção de recaída: ensaiar a resposta fora da crise).
 */
import type { PlanItemKind } from '@/data/repositories/types';
import { daysBetween, type LocalDate } from './dates';

export interface TechniqueStep {
  text: string;
  /** Pede uma resposta escrita, que vai para o plano com este tipo. */
  capture?: { kind: PlanItemKind; placeholder: string; prompt?: string };
  /** Lista de opções para escolher antes de escrever (ex.: pensamentos comuns). */
  options?: readonly string[];
  /** Pausa guiada em segundos (ex.: respirar e notar o corpo). */
  pauseSeconds?: number;
}

export interface Technique {
  id: string;
  title: string;
  /** Uma frase: para que serve. */
  why: string;
  steps: readonly TechniqueStep[];
}

export const PERMISSIVE_THOUGHTS = [
  'Só hoje, amanhã eu paro',
  'Eu mereço depois do dia que tive',
  'Já usei essa semana, tanto faz',
  'Ninguém vai saber',
  'Dessa vez eu controlo',
  'Estou entediado, não tem nada pra fazer',
] as const;

/** Situações de oferta para treinar a recusa. */
export const OFFER_SITUATIONS = [
  'Chega mensagem: "tem hoje, quer?"',
  'Alguém oferece pessoalmente',
  'Um amigo insiste: "só um pouco, pra relaxar"',
] as const;

export const VALUES = ['Saúde', 'Família', 'Dinheiro e independência', 'Trabalho', 'Respeito por mim', 'Liberdade', 'Amizades'] as const;

export const TECHNIQUES: readonly Technique[] = [
  {
    id: 'se_entao',
    title: 'Se acontecer, eu faço',
    why: 'Decidir antes, em frase de "se… então…", faz a resposta sair quase no automático.',
    steps: [
      { text: 'Pense no momento mais difícil: chegar em casa depois do trabalho, sozinho, sem nada pra fazer.' },
      {
        text: 'Complete com uma ação concreta, que dá para começar em 1 minuto.',
        capture: { kind: 'se_entao', prompt: 'Se eu chegar em casa e bater o tédio, então eu…', placeholder: 'troco de roupa e saio para caminhar' },
      },
      { text: 'Leia em voz alta duas vezes. Essa frase vai aparecer quando você precisar.' },
    ],
  },
  {
    id: 'surfar',
    title: 'Surfar a onda',
    why: 'A vontade sobe, chega no pico e passa. Observar sem obedecer enfraquece ela com o tempo.',
    steps: [
      { text: 'Lembre da última vez que a vontade veio. Onde você sente no corpo? Peito, estômago, mãos, boca?' },
      { text: 'Respire devagar, soltando o ar mais longo do que puxou. Só observe, como quem olha uma onda.', pauseSeconds: 60 },
      { text: 'Repare: a sensação muda, mexe de lugar, diminui. Você não precisa fazer nada com ela.' },
      { text: 'Na próxima vontade de verdade, o SOS faz isso com você por 15 minutos.' },
    ],
  },
  {
    id: 'filme',
    title: 'O filme até o fim',
    why: 'A vontade mostra só os primeiros 10 minutos. Lembrar o resto do filme muda a decisão.',
    steps: [
      { text: 'Imagine uma noite em que você usa. Não pare na primeira parte: vá até as 3 da manhã e até o dia seguinte.' },
      {
        text: 'Escreva como essa noite termina de verdade, com suas palavras.',
        capture: { kind: 'filme', prompt: 'Quando eu uso, a noite termina assim:', placeholder: '3 da manhã acordado, sem dinheiro, o dia seguinte perdido' },
      },
      { text: 'Na hora da vontade, o SOS te mostra esse final.' },
    ],
  },
  {
    id: 'pensamentos',
    title: 'Responder ao pensamento',
    why: 'Alguns pensamentos dão permissão para usar. Ter a resposta pronta tira a força deles.',
    steps: [
      {
        text: 'Qual desses pensamentos aparece mais para você?',
        options: PERMISSIVE_THOUGHTS,
        capture: { kind: 'resposta', prompt: 'Minha resposta para esse pensamento:', placeholder: 'Amanhã eu vou pensar a mesma coisa. Hoje é o dia.' },
      },
      { text: 'Você pode voltar aqui e responder aos outros. Cada resposta entra no seu SOS.' },
    ],
  },
  {
    id: 'futuro',
    title: 'Um dia daqui a 6 meses',
    why: 'Imaginar o futuro em detalhes faz ele pesar mais que a vontade de agora.',
    steps: [
      { text: 'Feche os olhos. Daqui a 6 meses, uma noite de semana boa. Onde você está? Com quem? O que está fazendo?', pauseSeconds: 45 },
      {
        text: 'Descreva essa cena em uma ou duas frases, no presente.',
        capture: { kind: 'futuro', prompt: 'Daqui a 6 meses, numa noite boa, eu…', placeholder: 'estou voltando do treino, com dinheiro na conta, dormindo bem' },
      },
    ],
  },
  {
    id: 'acesso',
    title: 'Dificultar o acesso',
    why: 'Cada passo a mais entre a vontade e a droga dá tempo para a onda passar.',
    steps: [
      { text: 'Escolha uma barreira que você consegue fazer hoje. Exemplos: arquivar ou silenciar o contato, baixar o limite de PIX à noite no app do banco, não levar dinheiro, voltar por outro caminho.' },
      {
        text: 'Escreva a barreira que vai fazer.',
        capture: { kind: 'barreira', prompt: 'A barreira que eu vou colocar:', placeholder: 'baixar o limite de PIX noturno para R$ 50' },
      },
      { text: 'Faça agora, se der. Levar 2 minutos hoje pode salvar uma noite.' },
    ],
  },
  {
    id: 'corpo',
    title: 'Fome, cansaço, solidão',
    why: 'Fome, raiva, solidão e cansaço aumentam a vontade. Às vezes o que falta é comer ou dormir.',
    steps: [
      { text: 'Agora: você está com fome? Cansado? Irritado? Sozinho? Repare em qual pesa mais.' },
      {
        text: 'O que resolve o que mais pesa, em 10 minutos?',
        capture: { kind: 'se_entao', prompt: 'Se eu estiver com fome, cansado ou sozinho, então eu…', placeholder: 'como algo de verdade antes de decidir qualquer coisa' },
      },
    ],
  },
  {
    id: 'recusar',
    title: 'Dizer não para a oferta',
    why: 'Recusar é uma habilidade: um "não" curto e ensaiado sai mais fácil quando a oferta chega de surpresa.',
    steps: [
      { text: 'Um "não" que funciona é curto, firme, sem desculpa longa. Depois você muda de assunto ou vai embora.' },
      {
        text: 'Qual oferta é mais provável para você?',
        options: OFFER_SITUATIONS,
        capture: { kind: 'recusa', prompt: 'Minha resposta, curta e firme:', placeholder: 'Não, parei. Valeu.' },
      },
      { text: 'Fale em voz alta três vezes, com voz firme, como se a pessoa estivesse na sua frente.', pauseSeconds: 20 },
      { text: 'O que mais protege: apagar ou bloquear o contato de quem vende. Se ainda não fez, pense em fazer hoje.' },
    ],
  },
  {
    id: 'fim_de_semana',
    title: 'Plano para o fim de semana',
    why: 'Tempo livre sem plano é quando a vontade decide. Uma noite de sexta ou sábado com hora marcada já tem dono.',
    steps: [
      { text: 'Pense na próxima sexta ou sábado à noite. O que costuma acontecer quando não tem nada marcado?' },
      {
        text: 'Marque algo com hora e lugar. Pode ser simples.',
        capture: { kind: 'plano_noite', prompt: 'Sexta ou sábado à noite eu vou…', placeholder: 'jogar futebol às 20h e jantar depois' },
      },
      { text: 'Esse plano entra nas opções de "Como vai ser sua noite?". Escolha ele quando chegar o dia.' },
    ],
  },
  {
    id: 'valores',
    title: 'O que importa para você',
    why: 'Parar fica mais fácil quando está ligado ao que você valoriza, e não só a evitar algo.',
    steps: [
      {
        text: 'Qual destes pesa mais para você agora?',
        options: VALUES,
        capture: { kind: 'razao', prompt: 'Por isso eu quero parar:', placeholder: 'quero ter dinheiro meu e confiar em mim de novo' },
      },
      { text: 'Feche os olhos 30 segundos e imagine um dia em que você viveu de acordo com isso.', pauseSeconds: 30 },
      { text: 'Essa razão vai aparecer no SOS, junto com as outras.' },
    ],
  },
];

export function findTechnique(id: string): Technique | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

/**
 * Técnica do dia: primeiro as que nunca foram praticadas, na ordem do catálogo (as primeiras
 * montam o kit do SOS mais rápido). Depois de todas, revezamento pelo dia.
 */
export function techniqueOfTheDay(today: LocalDate, practicedIds: readonly string[], start: LocalDate = today): Technique {
  const untried = TECHNIQUES.find((t) => !practicedIds.includes(t.id));
  if (untried) return untried;
  const i = ((daysBetween(start, today) % TECHNIQUES.length) + TECHNIQUES.length) % TECHNIQUES.length;
  return TECHNIQUES[i];
}
