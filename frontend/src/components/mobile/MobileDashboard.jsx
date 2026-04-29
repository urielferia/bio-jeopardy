import { AlertTriangle } from 'lucide-react';

const MobileDashboard = ({ team, teams, config, activeQuestion, stealable, sendMessage, isMyTurn }) => {

  const handleSelect = (catIndex, qIndex) => {
    // A mobile team can select a question if none is active
    if (!activeQuestion) {
      sendMessage('SELECT_QUESTION', { catIndex, qIndex, teamId: team.id });
    }
  };

  const handleSteal = () => {
    if (stealable) {
      sendMessage('STEAL_PRESS');
    }
  };

  const myScore = teams.find(t => t.id === team.id)?.score || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }} className="animate-fade-in">
      
      {/* Top Bar - Team Status */}
      <div style={{ padding: '1rem', background: team.color, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{team.name}</h2>
        <div style={{ fontSize: '2rem', fontWeight: '900' }}>{myScore}</div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', overflowY: 'auto', padding: '1rem' }}>
        
        {stealable && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
            <button 
              onClick={handleSteal}
              style={{
                width: '90vw', height: '90vw', maxWidth: '400px', maxHeight: '400px',
                borderRadius: '50%', background: 'var(--danger)', color: 'white',
                fontSize: '4rem', fontWeight: '900', border: '15px solid #7f1d1d',
                boxShadow: '0 20px 50px rgba(239, 68, 68, 0.6), inset 0 10px 20px rgba(255,255,255,0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textTransform: 'uppercase', animation: 'pulse-timer 1s infinite'
              }}
            >
              <AlertTriangle size={64} style={{ marginBottom: '10px' }} />
              Steal
            </button>
          </div>
        )}

        {activeQuestion && !stealable && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Question Active</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Look at the Game Master screen!</p>
          </div>
        )}

        {!activeQuestion && config && (
          <div style={{ paddingBottom: '2rem', position: 'relative' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {isMyTurn ? 'Your Turn: Select a Question' : 'Waiting for another team to pick...'}
            </h3>
            <div style={{ 
              display: 'grid', gridTemplateColumns: `repeat(${config.categories.length}, 1fr)`, gap: '5px',
              opacity: isMyTurn ? 1 : 0.5, pointerEvents: isMyTurn ? 'auto' : 'none'
            }}>
              {config.categories.map((cat, catIndex) => (
                <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ background: 'var(--text-primary)', color: 'white', padding: '8px 4px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.name}
                  </div>
                  {cat.questions.map((q, qIndex) => {
                    const isAnswered = q.isAnswered;
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSelect(catIndex, qIndex)}
                        style={{
                          padding: '15px 5px', fontSize: '1.2rem', fontWeight: 'bold',
                          background: isAnswered ? 'transparent' : 'var(--card-bg)', 
                          color: isAnswered ? 'transparent' : 'var(--accent)', 
                          border: isAnswered ? '1px solid rgba(0,0,0,0.1)' : '1px solid var(--glass-border)',
                          borderRadius: '4px',
                          cursor: isAnswered ? 'default' : 'pointer'
                        }}
                        disabled={isAnswered}
                      >
                        {isAnswered ? '' : (qIndex + 1) * config.multiplier}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Global Scoreboard at bottom */}
      <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px', overflowX: 'auto' }}>
        {teams.map(t => (
          <div key={t.id} style={{ minWidth: '80px', padding: '8px', background: 'var(--card-bg)', borderRadius: '8px', borderBottom: `4px solid ${t.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: t.color }}>{t.score}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default MobileDashboard;
