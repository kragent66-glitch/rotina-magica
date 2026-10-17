import type { ReactElement } from 'react';
import type { RoutineStep } from '@/domain/routine';
import { BookIcon, BreakIcon, MoonIcon, PillarIcon, ScrollIcon, ShieldIcon, SunIcon, WindIcon } from '@/ui/icons';

const BY_ID: Record<string, () => ReactElement> = {
  m_ra: SunIcon,
  m_asana: WindIcon,
  m_rmp: ShieldIcon,
  m_juramento: ScrollIcon,
  t_ahathoor: SunIcon,
  t_gatilho: BreakIcon,
  n_tum: SunIcon,
  n_rmp: ShieldIcon,
  n_pilar: PillarIcon,
  n_diario: BookIcon,
  n_khephra: MoonIcon,
};

export function StepIcon({ step }: { step: RoutineStep }) {
  const Icon = BY_ID[step.id] ?? SunIcon;
  return <Icon />;
}
