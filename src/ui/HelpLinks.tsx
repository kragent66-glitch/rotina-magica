/**
 * Ajuda de gente, fora do app. Os links só abrem o site ou o mapa; o Rumo não manda nenhum dado
 * (noreferrer esconde até o endereço do app).
 */
export const HELP_LINKS = [
  {
    href: 'https://www.google.com/maps/search/CAPS+AD',
    label: 'CAPS AD perto de você',
    detail: 'Atendimento do SUS para álcool e drogas. Gratuito e sem precisar de encaminhamento.',
  },
  { href: 'https://www.na.org.br/', label: 'Narcóticos Anônimos', detail: 'Reuniões presenciais e online, de graça e sem cadastro.' },
  { href: 'https://cvv.org.br/', label: 'CVV por chat', detail: 'Conversa sigilosa, 24 horas. Também pelo telefone 188.' },
] as const;

export function HelpLinks() {
  return (
    <div className="stack">
      {HELP_LINKS.map((l) => (
        <a key={l.href} className="option help-link" href={l.href} target="_blank" rel="noopener noreferrer">
          <strong>{l.label}</strong>
          <span className="small muted">{l.detail}</span>
        </a>
      ))}
    </div>
  );
}
