import React, { useEffect, useRef, ReactElement } from 'react';
import style from './app.module.css';
import Globe from './components/globe/Globe';

function App(): ReactElement {
  const threeContainer = useRef<HTMLElement>(null);

  useEffect(
    (): void => {
      if (threeContainer.current) {
        const globe = new Globe(threeContainer.current);
        globe.render();
      }
    }
  );

  return (
    <div className={style.app}>
      <header className={style.appHeader}>CLEAN PLANET</header>
      <main className={style.threeContainer} ref={threeContainer} />
      <footer>© Anton Chernov 2019</footer>
    </div>
  );
}

export default App;
