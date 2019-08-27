import React from 'react';
import './App.css';
import { Game } from './Debug/Game';

const App: React.FC = () => {
  Game.start();
  return (
    <div className="App">
      <Game map_pic={''} map_arr={6} map_cor={12} margin={[180, 0, 100, 0]} padding={[240, 120]}/>
    </div>
  );
}

export default App;
