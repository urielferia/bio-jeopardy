import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import { useGameSocket } from './hooks/useGameSocket';

const HostApp = () => {
  const { isConnected, lastMessage, sendMessage } = useGameSocket();
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing'
  const [gameConfig, setGameConfig] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (isConnected) {
      sendMessage('REGISTER_HOST');
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'SYNC_TEAMS') {
      setTeams(lastMessage.teams);
    } else if (lastMessage.type === 'SELECT_QUESTION') {
      // Not needed if server broadcasts OPEN_QUESTION
    }
  }, [lastMessage]);

  const handleStartGame = (config) => {
    // Add the connected teams to the config
    const finalConfig = { ...config, teams };
    setGameConfig(finalConfig);
    setGameState('playing');
    sendMessage('START_GAME', { config: finalConfig });
  };

  if (!isConnected) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>Connecting to Server...</div>;
  }

  return (
    <div className="app-container">
      {gameState === 'setup' && <SetupScreen onStart={handleStartGame} connectedTeams={teams} onRemoveTeam={(teamId) => sendMessage('REMOVE_TEAM', { teamId })} />}
      {gameState === 'playing' && gameConfig && (
        <GameBoard 
          config={gameConfig} 
          teams={teams}
          lastMessage={lastMessage} 
          sendMessage={sendMessage} 
        />
      )}
    </div>
  );
};

export default HostApp;
