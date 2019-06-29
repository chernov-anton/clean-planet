import React, { useEffect, useRef, ReactElement, RefObject, useState } from 'react';
import style from './app.module.css';
import Globe from './components/globe';
import { CountryChangeCallback } from './components/globe/types';

function useGlobe(country: string, setCountry: CountryChangeCallback): RefObject<HTMLElement> {
  const threeContainer = useRef<HTMLElement>(null);

  useEffect((): void => {
    if (threeContainer.current) {
      const globe = new Globe({
        container: threeContainer.current,
        onCountryChange: setCountry,
      });
      globe.render();
    }
  }, [setCountry]);

  return threeContainer;
}

function App(): ReactElement {
  const [country, setCountry] = useState('CH');
  const threeContainer = useGlobe(country, setCountry);

  return (
    <div className={style.app}>
      <header className={style.appHeader}>CLEAN PLANET</header>
      <main id="main" className={style.threeContainer} ref={threeContainer} />
      <footer>© Anton Chernov 2019</footer>
    </div>
  );
}

export default App;
