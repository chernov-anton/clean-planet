import React, { Component, RefObject } from 'react';
import style from './app.module.css';
import init from './texturedGlobe';

class App extends Component {
  private threeContainer: RefObject<HTMLMainElement> = React.createRef();

  public componentDidMount(): void {
    if (this.threeContainer.current) {
      init(this.threeContainer.current);
    }
  }

  public render(): React.ReactNode {
    return (
      <div className={style.app}>
        <header className={style.appHeader}>CLEAN PLANET</header>
        <main className={style.threeContainer} ref={this.threeContainer} />
        <footer>© Anton Chernov 2019</footer>
      </div>
    );
  }
}

export default App;
