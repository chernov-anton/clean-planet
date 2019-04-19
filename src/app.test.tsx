import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('./components/globe/Globe.ts');

it('renders without crashing', (): void => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
