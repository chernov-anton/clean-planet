import React, { ReactElement } from 'react';
import style from './app.module.css';
import Globe from './components/globe';

function App(): ReactElement {
  return (
    <div className={style.app}>
      <Globe />
    </div>
  );
}

export default App;
