import React, { Component, RefObject } from 'react';
import './App.css';
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
      <div className="App">
        <header className="App-header">CLEAN PLANET</header>
        <main className="Three-container" ref={this.threeContainer} />
        <footer>© Anton Chernov 2019</footer>
      </div>
    );
  }
}

export default App;
