import React, { ReactElement } from 'react';
import style from './app.module.css';
import Globe from './components/globe';

function App(): ReactElement {
  return (
    <div className={style.app}>
      <header className={style.appHeader}>CLEAN PLANET</header>
      <Globe className={style.threeContainer} />
      <footer>© Anton Chernov 2019</footer>
    </div>
  );
}

export default App;
