import React, { Component } from 'react';
import './App.css';
import init from './texturedGlobe';

class App extends Component {
  public componentDidMount(): void {
    init();
  }

  public render(): React.ReactNode {
    return (
      <div className="App">
        <header className="App-header">CLEAN PLANET</header>
      </div>
    );
  }
}

export default App;
