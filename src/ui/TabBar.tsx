import type { ReactElement } from 'react';
import { navigate, type RouteName } from '@/router';
import { BookIcon, GearIcon, HeartIcon, SunIcon } from './icons';

const TABS: { route: RouteName; label: string; Icon: () => ReactElement }[] = [
  { route: 'home', label: 'Hoje', Icon: SunIcon },
  { route: 'sos', label: 'Ajuda agora', Icon: HeartIcon },
  { route: 'diario', label: 'Diário', Icon: BookIcon },
  { route: 'ajustes', label: 'Ajustes', Icon: GearIcon },
];

/** Barra de baixo: as quatro áreas do app, sempre a um toque. */
export function TabBar({ current }: { current: RouteName }) {
  return (
    <nav className="tabbar" aria-label="Navegação principal">
      {TABS.map(({ route, label, Icon }) => (
        <button
          key={route}
          type="button"
          className={`tabbar__item${current === route ? ' on' : ''}${route === 'sos' ? ' tabbar__item--sos' : ''}`}
          aria-current={current === route ? 'page' : undefined}
          onClick={() => navigate(route)}
        >
          <span className="tabbar__icon">
            <Icon />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
