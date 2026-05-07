import { Plus, Minus } from 'lucide-react';

const ScoreBoard = ({ teams, sendMessage }) => {

  const handleAdjustPoints = (teamId, currentScore, amount) => {
    if (sendMessage) {
      sendMessage('UPDATE_SCORE', { teamId, score: currentScore + amount });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', overflowX: 'auto', justifyContent: 'center' }}>
      {teams.map((team) => {
        return (
          <div key={team.id} style={{ 
            flex: '1', minWidth: '200px', maxWidth: '300px',
            background: 'var(--bg-color)', borderRadius: '12px', padding: '1rem',
            borderBottom: `6px solid ${team.color}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
              {team.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {sendMessage && (
                <button 
                  onClick={() => handleAdjustPoints(team.id, team.score, -5)}
                  style={{ background: 'transparent', color: 'var(--danger)', padding: '4px' }}
                >
                  <Minus size={20} />
                </button>
              )}
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: team.color, textShadow: '1px 1px 0 rgba(0,0,0,0.1)' }}>
                {team.score}
              </div>
              {sendMessage && (
                <button 
                  onClick={() => handleAdjustPoints(team.id, team.score, 5)}
                  style={{ background: 'transparent', color: 'var(--accent)', padding: '4px' }}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBoard;
