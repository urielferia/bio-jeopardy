import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import { useGameSocket } from './hooks/useGameSocket';

const HostApp = () => {
  const { isConnected, lastMessage, sendMessage } = useGameSocket();
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing'
  const [gameConfig, setGameConfig] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);

  useEffect(() => {
    if (isConnected) {
      const isHost = localStorage.getItem('isHost');
      if (isHost) {
        sendMessage('RECONNECT_HOST');
      } else {
        localStorage.setItem('isHost', 'true');
        sendMessage('REGISTER_HOST');
      }
    }
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === 'SYNC_STATE') {
      setGameState(lastMessage.phase);
      if (lastMessage.config) {
        setGameConfig({
          ...lastMessage.config,
          teams: lastMessage.teams || []
        });
      }
      setTeams(lastMessage.teams || []);
      setActiveEffects(lastMessage.activeEffects || []);
    } else if (lastMessage.type === 'SYNC_TEAMS') {
      setTeams(lastMessage.teams);
    } else if (lastMessage.type === 'ITEM_ACTIVATED') {
      setActiveEffects(prev => [...prev, lastMessage.effect]);
    } else if (lastMessage.type === 'EFFECTS_CLEARED') {
      setActiveEffects([]);
    } else if (lastMessage.type === 'PHASE_CHANGED') {
      setGameState(lastMessage.phase);
      if (lastMessage.phase === 'setup') {
        setGameConfig(null);
      }
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
          activeEffects={activeEffects}
          lastMessage={lastMessage} 
          sendMessage={sendMessage} 
        />
      )}
      {gameState === 'playing' && !gameConfig && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
          <h2>Game is in progress, but configuration is missing.</h2>
          <button 
            onClick={() => sendMessage('RESET_GAME')}
            style={{ padding: '10px 20px', background: 'var(--danger)', color: 'white', borderRadius: '8px', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            Force Reset Game
          </button>
        </div>
      )}
    </div>
  );
};

export default HostApp;
