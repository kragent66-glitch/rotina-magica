/**
 * Ações padrão do SOS, focadas nos gatilhos conhecidos (fim do expediente, sozinho, entediado):
 * mudar de ambiente e de estado físico rápido, e ver gente. A ordem muda conforme o que funciona
 * para a pessoa (ver domain/strategies).
 */
export interface SosAction {
  id: string;
  text: string;
}

export const DEFAULT_ACTIONS: readonly SosAction[] = [
  { id: 'sair', text: 'Saia de casa agora: 10 minutos de caminhada, sem levar cartão' },
  { id: 'gente', text: 'Vá para um lugar com gente: padaria, mercado, praça' },
  { id: 'agua_fria', text: 'Banho frio ou água gelada no rosto' },
  { id: 'audio', text: 'Mande um áudio para alguém, sobre qualquer assunto' },
  { id: 'exercicio', text: 'Exercício curto: flexões, polichinelos, subir escadas' },
  { id: 'comer', text: 'Coma algo e beba água. Fome e cansaço aumentam a vontade' },
];

export const CRISIS_CONTACTS = [
  { label: 'CVV, apoio emocional 24h', phone: '188' },
  { label: 'SAMU, emergência médica', phone: '192' },
] as const;
