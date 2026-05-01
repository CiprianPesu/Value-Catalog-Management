import useKeycloak from '../features/Auth/hooks/useKeycloak';
import { Header } from './layout/Header';
import Router from './router/Router';

function App() {
  const { keycloak, authenticated } = useKeycloak();

  if (!authenticated) {
    keycloak?.login();
    return null;
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <header className='h-[60px] border-b'>
        <Header />
      </header>

      <main className='flex-1 p-4'>
        <Router />
      </main>
    </div>
  );
}

export default App;
