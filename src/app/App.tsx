import { HashRouter } from 'react-router';

import { AppRouter } from './router';

export default function App() {
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
}
