import { useState, useEffect } from 'react';
import MobileJoin from './components/mobile/MobileJoin';
import MobileDashboard from './components/mobile/MobileDashboard';
import { useGameSocket } from './hooks/useGameSocket';

const MobileApp = () => {
  const { isConnected, lastMessage, sendMessage } = useGameSocket();
  const [teamState, setTeamState] = useState(null); // { id, name, color }
  const [gameState, setGameState] = useState('setup');
  const [gameConfig, setGameConfig] = useState(null);
  const [teams, setTeams] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null); // { catIndex, qIndex }
  const [stealable, setStealable] = useState(false);
  const [teamOrder, setTeamOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'TEAM_REGISTERED':
        setTeamState(prev => ({ ...prev, id: lastMessage.team_id }));
        setGameState(lastMessage.phase);
        if (lastMessage.config) setGameConfig(lastMessage.config);
        break;
      case 'SYNC_TEAMS':
        setTeams(lastMessage.teams);
        // Update own score if needed
        break;
      case 'GAME_STARTED':
        setGameState('playing');
        setGameConfig(lastMessage.config);
        setTeamOrder(lastMessage.teamOrder || []);
        setCurrentTurnIndex(lastMessage.currentTurnIndex || 0);
        break;
      case 'QUESTION_OPENED':
        setActiveQuestion({ catIndex: lastMessage.catIndex, qIndex: lastMessage.qIndex });
        setStealable(false);
        break;
      case 'QUESTION_CLOSED':
        setActiveQuestion(null);
        setStealable(false);
        if (lastMessage.currentTurnIndex !== undefined) {
          setCurrentTurnIndex(lastMessage.currentTurnIndex);
        }
        if (lastMessage.catIndex != null && lastMessage.qIndex != null) {
          setGameConfig(prev => {
            if (!prev) return prev;
            const newConfig = { ...prev };
            newConfig.categories = [...prev.categories];
            const newCat = { ...newConfig.categories[lastMessage.catIndex] };
            newCat.questions = [...newCat.questions];
            newCat.questions[lastMessage.qIndex] = { ...newCat.questions[lastMessage.qIndex], isAnswered: true };
            newConfig.categories[lastMessage.catIndex] = newCat;
            return newConfig;
          });
        }
        break;
      case 'TEAM_KICKED':
        if (teamState && lastMessage.teamId === teamState.id) {
          setTeamState(null);
          setGameState('setup');
        }
        break;
      case 'STEAL_AVAILABLE':
        if (teamState && lastMessage.excludeTeamId !== teamState.id) {
          setStealable(true);
        }
        break;
      case 'STEAL_SUCCESS':
        setStealable(false); // Someone got it, hide button
        break;
      case 'ERROR':
        alert(lastMessage.message);
        setTeamState(null);
        break;
      case 'PHASE_CHANGED':
        setGameState(lastMessage.phase);
        break;
      default:
        break;
    }
  }, [lastMessage, teamState]);

  const handleJoin = (name, color) => {
    setTeamState({ name, color });
    sendMessage('REGISTER_TEAM', { name, color });
  };

  if (!isConnected) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>Connecting to Game Server...</div>;
  }

  if (!teamState || !teamState.id) {
    return <MobileJoin onJoin={handleJoin} />;
  }

  if (gameState === 'setup') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Welcome, {teamState.name}!</h2>
        <p>Waiting for the Game Master to start...</p>
      </div>
    );
  }

  return (
    <MobileDashboard 
      team={teamState}
      teams={teams}
      config={gameConfig}
      activeQuestion={activeQuestion}
      stealable={stealable}
      sendMessage={sendMessage}
      isMyTurn={teamOrder.length > 0 ? teamOrder[currentTurnIndex] === teamState.id : true}
    />
  );
};

export default MobileApp;
