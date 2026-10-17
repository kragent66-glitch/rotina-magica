import { CARE_STEPS } from '@/domain/care';
import { HELP_LINKS } from '@/ui/HelpLinks';

export function CareCard({ onUnderstand }: { onUnderstand: () => void }) {
  return (
    <section className="card card--care">
      <h2>Hoje é dia de cuidar de você</h2>
      <ul className="ticks">
        {CARE_STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="small muted">Se a cabeça estiver muito pesada, fale com alguém agora.</p>
      <a className="option" href="tel:188">
        Ligar 188: CVV, 24h, gratuito
      </a>
      <a className="option" href={HELP_LINKS[0].href} target="_blank" rel="noopener noreferrer">
        {HELP_LINKS[0].label}: atendimento gratuito, sem encaminhamento
      </a>
      <button type="button" className="link" onClick={onUnderstand}>
        Quando estiver melhor: entender o que aconteceu (1 min)
      </button>
    </section>
  );
}
