/**
 * "A noite": ensaio interativo da noite de risco (saída do trabalho, casa vazia, tédio).
 * Cada escolha mexe na vontade e explica o porquê. As opções usam o plano da própria pessoa,
 * então o ensaio é da noite dela, não de um personagem. Base: ensaio comportamental e
 * intenções de implementação da prevenção de recaída (Marlatt; Gollwitzer). Errar aqui é barato.
 */
import { shuffle, type Rng } from './rng';

export interface StoryChoice {
  text: string;
  /** Quanto a escolha mexe na vontade (negativo baixa). */
  delta: number;
  why: string;
}

export interface StoryScene {
  id: string;
  /** O "se" do plano que sai do ensaio: "Se {cue}, então…". */
  cue: string;
  time: string;
  text: string;
  choices: StoryChoice[];
}

export interface StoryPersonal {
  reason?: string;
  activity?: string;
  plan?: string;
  ifThen?: string;
}

export const START_URGE = 4;
export const MAX_URGE = 10;

const cut = (t: string | undefined, fallback: string) => {
  const s = (t ?? '').trim() || fallback;
  return s.length > 70 ? `${s.slice(0, 67)}…` : s;
};

type Variant = (p: StoryPersonal) => StoryScene;

/** Uma fase por momento da noite, três versões em cada (dia comum, sexta, pagamento) para o ensaio não ficar decorado. */
const PHASES: Variant[][] = [
  [
    (p) => ({
      id: 'saida-cansado',
      cue: 'eu sair do trabalho cansado',
      time: '18:10',
      text: 'Fim do expediente. Cansado, a cabeça já pensa na noite livre.',
      choices: [
        { text: 'Ir pelo caminho de sempre, que passa perto de onde comprava', delta: 2, why: 'Lugares ligados ao uso puxam a vontade sozinhos.' },
        { text: 'Mudar o caminho e passar no mercado', delta: -1, why: 'Mudar a rota tira os gatilhos do caminho.' },
        { text: `Sair já com o plano da noite: ${cut(p.plan, 'academia')}`, delta: -2, why: 'Decidir antes da vontade chegar é o que mais protege.' },
      ],
    }),
    () => ({
      id: 'saida-cerveja',
      cue: 'me chamarem para beber depois do trabalho',
      time: '18:05',
      text: 'Dia pesado. Um colega chama para uma cerveja "rapidinha".',
      choices: [
        { text: 'Topar a cerveja', delta: 3, why: 'Álcool tira o freio e costuma vir junto com a vontade.' },
        { text: 'Agradecer e ir comer algo de verdade', delta: -1, why: 'Fome e cansaço aumentam a vontade. Comer ajuda.' },
        { text: 'Ir, mas pedir refrigerante e sair em 30 minutos', delta: 0, why: 'Dá para estar junto com limite claro, mas pede atenção.' },
      ],
    }),
    () => ({
      id: 'saida-sexta',
      cue: 'chegar sexta-feira à noite',
      time: '18:00',
      text: 'Sexta-feira. A semana acabou e a cabeça pede uma "recompensa".',
      choices: [
        { text: 'Passar no lugar de sempre "só pra ver"', delta: 3, why: 'Ir "só pra ver" é decidir sem perceber que decidiu.' },
        { text: 'Marcar algo com hora: futebol, cinema, janta', delta: -2, why: 'Fim de semana sem plano é o maior risco. Com hora marcada, a noite tem dono.' },
        { text: 'Ir pra casa e ver o que acontece', delta: 1, why: 'Deixar a noite em aberto entrega a decisão para a vontade.' },
      ],
    }),
  ],
  [
    (p) => ({
      id: 'casa-silencio',
      cue: 'eu chegar em casa sem nada para fazer',
      time: '19:00',
      text: 'Em casa, sozinho. Silêncio. Nada marcado para fazer.',
      choices: [
        { text: 'Deitar e rolar o celular', delta: 1, why: 'Tédio sem plano é o terreno preferido da vontade.' },
        { text: cut(p.activity, 'Cozinhar algo de verdade'), delta: -2, why: 'Algo que ocupa mãos e cabeça corta o tédio.' },
        { text: 'Banho frio e trocar de roupa', delta: -1, why: 'Mudar o estado do corpo quebra o piloto automático.' },
      ],
    }),
    () => ({
      id: 'casa-pagamento',
      cue: 'o pagamento cair',
      time: '19:20',
      text: 'O pagamento caiu na conta. Tem dinheiro sobrando hoje.',
      choices: [
        { text: 'Deixar o dinheiro onde está', delta: 1, why: 'Dinheiro fácil de gastar é uma porta aberta.' },
        { text: 'Passar para uma conta difícil de mexer', delta: -2, why: 'Dificultar o acesso dá tempo para a vontade passar.' },
        { text: 'Pagar uma conta agora', delta: -1, why: 'Dar destino ao dinheiro tira a "sobra" que vira uso.' },
      ],
    }),
    () => ({
      id: 'casa-festa',
      cue: 'me chamarem para um lugar onde vai ter',
      time: '19:40',
      text: 'Chega convite para uma festa. Você sabe que lá vai ter.',
      choices: [
        { text: 'Ir e ver como fica', delta: 3, why: 'Lugar com oferta é o gatilho mais forte que existe.' },
        { text: 'Recusar e propor outro programa', delta: -2, why: 'Trocar o lugar, não a companhia, mantém o social sem o risco.' },
        { text: 'Ir com hora para sair e sem dinheiro', delta: 0, why: 'Diminui o risco, mas ainda pede muito de você.' },
      ],
    }),
  ],
  [
    () => ({
      id: 'fissura-corpo',
      cue: 'a vontade apertar no corpo',
      time: '21:00',
      text: 'A vontade chega forte. Corpo inquieto, boca seca.',
      choices: [
        { text: 'Ficar parado, brigando com ela', delta: 1, why: 'Brigar parado faz a vontade parecer maior do que é.' },
        { text: 'Surfar a onda: 10 minutos respirando devagar', delta: -2, why: 'A vontade sobe, chega ao pico e desce. Observar sem obedecer ensina isso ao cérebro.' },
        { text: 'Jogar Blocos por 3 minutos', delta: -2, why: 'Jogos visuais como Tetris baixam a força das imagens da vontade.' },
      ],
    }),
    () => ({
      id: 'fissura-imagem',
      cue: 'a cena do uso vier na cabeça',
      time: '21:15',
      text: 'Vem a cena na cabeça: o ritual, o primeiro efeito.',
      choices: [
        { text: 'Deixar a cena rodar', delta: 2, why: 'Imaginar o uso em detalhe alimenta a vontade.' },
        { text: 'Passar o filme até o fim: a manhã seguinte', delta: -2, why: 'Ver a noite inteira, até a manhã, tira o brilho da cena.' },
        { text: 'Ocupar a cabeça com algo visual', delta: -1, why: 'Tarefas visuais disputam espaço com as imagens da vontade.' },
      ],
    }),
    () => ({
      id: 'fissura-tedio',
      cue: 'o tédio apertar',
      time: '21:30',
      text: 'Nada na TV, nada no celular. O tédio pesa.',
      choices: [
        { text: 'Ficar no sofá rolando o celular', delta: 1, why: 'O tédio cresce quando o corpo fica parado.' },
        { text: 'Sair 10 minutos para andar, sem levar cartão', delta: -2, why: 'Mudar de lugar corta a vontade, e sem cartão não tem compra.' },
        { text: 'Mandar um áudio para alguém, sobre qualquer coisa', delta: -1, why: 'Falar com alguém quebra o isolamento, mesmo sem tocar no assunto.' },
      ],
    }),
  ],
  [
    (p) => ({
      id: 'pensamento-mereco',
      cue: 'eu pensar "só hoje, eu mereço"',
      time: '22:00',
      text: 'Um pensamento: "Só hoje. Eu mereço depois dessa semana."',
      choices: [
        { text: 'Concordar: foi uma semana difícil mesmo', delta: 3, why: 'Pensamento de permissão é o último passo antes do uso.' },
        { text: `Lembrar por que quer parar: ${cut(p.reason, 'minha saúde')}`, delta: -2, why: 'Suas razões, lembradas na hora, pesam contra a permissão.' },
        { text: 'Responder: "Eu mereço acordar bem amanhã"', delta: -1, why: 'Trocar por uma recompensa que não cobra depois.' },
      ],
    }),
    (p) => ({
      id: 'pensamento-ninguem',
      cue: 'eu pensar "ninguém vai saber"',
      time: '22:10',
      text: '"Ninguém vai saber. Uma vez não faz diferença."',
      choices: [
        { text: 'Pensar: "É verdade, ninguém vai saber"', delta: 3, why: 'O "só uma vez" esconde como as noites costumam terminar.' },
        { text: 'Responder: "Eu vou saber. E nunca foi uma vez só."', delta: -2, why: 'Lembrar o padrão real desmonta o "só uma vez".' },
        { text: `Seguir seu plano: ${cut(p.ifThen, 'se apertar, saio de casa por 15 minutos')}`, delta: -2, why: 'Um "se… então…" pronto dispensa decidir no pior momento.' },
      ],
    }),
    () => ({
      id: 'pensamento-controle',
      cue: 'eu pensar "dessa vez eu controlo"',
      time: '22:05',
      text: '"Dessa vez eu controlo. Só um pouco."',
      choices: [
        { text: 'Acreditar: dessa vez é diferente', delta: 3, why: 'O "só um pouco" quase nunca termina pouco.' },
        { text: 'Lembrar como a última vez terminou', delta: -2, why: 'A lembrança real da última noite pesa mais que a promessa.' },
        { text: 'Ir dormir mais cedo e decidir amanhã', delta: -1, why: 'Adiar a decisão para amanhã quase sempre desfaz a vontade.' },
      ],
    }),
  ],
  [
    () => ({
      id: 'final-mensagem',
      cue: 'chegar mensagem oferecendo',
      time: '22:40',
      text: 'Chega uma mensagem: "tem hoje, quer?"',
      choices: [
        { text: 'Responder "hoje não"', delta: 1, why: 'Responder deixa a conversa aberta para outro dia.' },
        { text: 'Bloquear o número e apagar a conversa', delta: -3, why: 'Cortar o acesso é uma das barreiras mais fortes que existem.' },
        { text: 'Deixar sem resposta, com a conversa aberta', delta: 2, why: 'Conversa aberta fica chamando a noite toda.' },
      ],
    }),
    () => ({
      id: 'final-sono',
      cue: 'eu ficar sem sono à noite',
      time: '23:00',
      text: 'Sem sono. A noite parece longa.',
      choices: [
        { text: 'Ficar acordado esperando o sono', delta: 1, why: 'Ficar acordado sem rumo estica a janela de risco.' },
        { text: 'Luz baixa e celular fora do quarto', delta: -2, why: 'Dormir fecha a janela de risco da noite.' },
        { text: 'Um filme leve na sala até dar sono', delta: -1, why: 'Distração tranquila ajuda a atravessar a noite.' },
      ],
    }),
    () => ({
      id: 'final-banco',
      cue: 'eu abrir o app do banco à noite',
      time: '23:10',
      text: 'Você abre o app do banco "só para ver o saldo".',
      choices: [
        { text: 'Ficar olhando o saldo', delta: 2, why: 'Olhar o dinheiro na hora da vontade é meio caminho para gastar.' },
        { text: 'Baixar o limite do PIX noturno agora', delta: -3, why: 'Dificultar o acesso dá tempo para a vontade passar.' },
        { text: 'Fechar o app e deixar o celular longe', delta: -1, why: 'Tirar o gatilho da mão já ajuda.' },
      ],
    }),
  ],
];

/** Monta uma noite: uma cena por fase, opções embaralhadas. */
export function buildStory(rng: Rng, personal: StoryPersonal = {}): StoryScene[] {
  return PHASES.map((variants) => {
    const scene = variants[Math.floor(rng() * variants.length)](personal);
    return { ...scene, choices: shuffle(scene.choices, rng) };
  });
}

export interface StoryStep {
  sceneId: string;
  choice: string;
  delta: number;
  urgeAfter: number;
  /** Plano "se… então…" com a melhor saída desta cena. */
  plan: string;
}

export interface StoryState {
  urge: number;
  step: number;
  log: StoryStep[];
}

export function startStory(): StoryState {
  return { urge: START_URGE, step: 0, log: [] };
}

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** "Se {momento}, então {a escolha que mais baixou a vontade}." */
export function planFor(scene: StoryScene): string {
  const best = [...scene.choices].sort((a, b) => a.delta - b.delta)[0];
  return `Se ${scene.cue}, então ${lowerFirst(best.text)}`;
}

export function choose(state: StoryState, scene: StoryScene, choice: StoryChoice): StoryState {
  const urge = Math.min(MAX_URGE, Math.max(0, state.urge + choice.delta));
  const step = { sceneId: scene.id, choice: choice.text, delta: choice.delta, urgeAfter: urge, plan: planFor(scene) };
  return { urge, step: state.step + 1, log: [...state.log, step] };
}

export function isOver(state: StoryState, scenes: readonly StoryScene[]): boolean {
  return state.urge >= MAX_URGE || state.step >= scenes.length;
}

/** Pontos: cada escolha que baixa a vontade vale mais; terminar a noite com ela baixa dá bônus. */
export function storyScore(state: StoryState): number {
  const choices = state.log.reduce((sum, s) => sum + (s.delta < 0 ? 100 + -s.delta * 20 : s.delta === 0 ? 40 : 0), 0);
  const bonus = state.urge >= MAX_URGE ? 0 : state.urge <= 3 ? 200 : 80;
  return choices + bonus;
}

/** O momento que mais empurrou a vontade para cima: é ali que vale montar um plano. */
export function turningPoint(state: StoryState): StoryStep | null {
  return state.log.filter((s) => s.delta > 0).sort((a, b) => b.delta - a.delta)[0] ?? null;
}

export type StoryEnding = 'dormiu' | 'apertado' | 'escapou';

export function ending(state: StoryState): StoryEnding {
  if (state.urge >= MAX_URGE) return 'escapou';
  return state.urge <= 3 ? 'dormiu' : 'apertado';
}
