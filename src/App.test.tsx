import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { DataProvider } from './data/provider';
import { createTestRepositories } from './data/test-repos';

function setup(repos = createTestRepositories()) {
  window.location.hash = '';
  render(
    <DataProvider repos={repos}>
      <App />
    </DataProvider>,
  );
  return { repos, user: userEvent.setup() };
}

describe('Rumo', () => {
  it('primeiro uso gera planos de noite e leva para a noite de hoje', async () => {
    const { repos, user } = setup();
    await user.click(screen.getByRole('button', { name: '18:00' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Ver amigos ou família' }));
    await user.click(screen.getByRole('button', { name: 'Cozinhar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Dinheiro' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('Seus planos de noite')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Começar' }));

    expect(repos.plan.list('plano_noite').map((p) => p.text)).toEqual(['Ver amigos ou família', 'Cozinhar']);
    expect(screen.getByText('Como vai ser sua noite?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cozinhar' }));
    expect(screen.getByText('Sua noite de hoje')).toBeInTheDocument();
    expect(screen.getByText(/Passar no mercado/)).toBeInTheDocument();
  });

  it('não aceita horário inválido', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText('ex.: 18:30'), '27');
    expect(screen.getByText(/Não entendi esse horário/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('o SOS abre mesmo antes do primeiro uso', async () => {
    window.location.hash = '#sos';
    render(
      <DataProvider repos={createTestRepositories()}>
        <App />
      </DataProvider>,
    );
    expect(screen.getByText(/Vamos atravessar isso juntos/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /188/ })).toHaveAttribute('href', 'tel:188');
  });

  it('da tela inicial ao SOS é um toque', async () => {
    const repos = createTestRepositories();
    repos.settings.set('onboardingDone', true);
    const { user } = setup(repos);
    await user.click(screen.getByRole('button', { name: /Bateu vontade/ }));
    expect(await screen.findByText(/Vamos atravessar isso juntos/)).toBeInTheDocument();
  });
});
