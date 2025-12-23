import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import IntroScene from './components/intro/IntroScene';
import MainGame from './components/main/MainGame';
import GameOverScene from './components/ending/GameOverScene';
import './App.css';

function GameCoodinator() {
  const { state } = useGame();

  return (
    <div className="game-container">
      {state.phase === 'INTRO' && <IntroScene />}
      {state.phase === 'NAMING' && <IntroScene namingMode={true} />}
      {state.phase === 'MAIN_GAME' && <MainGame />}
      {state.phase === 'GAME_OVER' && <GameOverScene state={state} />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameCoodinator />
    </GameProvider>
  );
}

export default App;
