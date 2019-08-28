import React from 'react';
import './App.css';
import { Game } from './Debug/Game';

const App: React.FC = () => {
  let set: Array< Array<boolean> > = [];
  for (let i: number = 0; i < 6; i++) {
    let s: Array<boolean> = [];
    for (let j: number = 0; j < 12; j++) {
      s.push(false);
    }
    set.push(s);
  }
  return (
    <div className="App">
      <Game map_pic={''} map_arr={6} map_cor={12} margin={[180, 0, 100, 0]} padding={[240, 120]} />
    </div>
  );
}

export default App;
