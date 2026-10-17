/**
 * O app web não consegue disparar notificação agendada com o app fechado no Android. A agenda do
 * celular consegue, e é confiável. Geramos um evento diário (arquivo .ics) com alarme na hora da
 * saída e o link do app. Título neutro, para a tela bloqueada não revelar nada.
 */
function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function buildDailyReminderIcs({
  time,
  url,
  now,
  title = 'Rotina: como vai ser a noite?',
}: {
  time: string;
  url: string;
  now: Date;
  title?: string;
}): string {
  const [h, m] = time.split(':').map(Number);
  const start = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(h)}${pad(m)}00`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rumo//PT-BR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:rumo-saida-${stamp}@rumo`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    'DURATION:PT10M',
    'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(`Abra: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}
