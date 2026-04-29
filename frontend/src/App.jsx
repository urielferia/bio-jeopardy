import { useState } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing'
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = (config) => {
    setGameConfig(config);
    setGameState('playing');
  };

  return (
    <div className="app-container">
      {gameState === 'setup' && <SetupScreen onStart={handleStartGame} />}
      {gameState === 'playing' && gameConfig && <GameBoard config={gameConfig} />}
    </div>
  );
}

export default App;
